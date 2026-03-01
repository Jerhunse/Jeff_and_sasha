"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { CameraViewfinder, CameraViewfinderRef } from "./camera-viewfinder"
import { Loader2 } from "lucide-react"

interface SessionCaptureProps {
  sessionId: string
  deviceId: string | null
  onComplete: (photoUrls: string[]) => void
}

type CaptureState =
  | "idle"
  | "countdown"
  | "capture"
  | "uploading"
  | "done"

export function SessionCapture({
  sessionId,
  deviceId,
  onComplete,
}: SessionCaptureProps) {
  const [state, setState] = useState<CaptureState>("idle")
  const [countdown, setCountdown] = useState(5)
  const [photoCount, setPhotoCount] = useState(0)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showFlash, setShowFlash] = useState(false)

  const cameraRef = useRef<CameraViewfinderRef>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const hasStartedRef = useRef(false)
  const photoCountRef = useRef(0)
  const photoUrlsRef = useRef<string[]>([])
  const uploadPromisesRef = useRef<Promise<void>[]>([])

  // Keep refs in sync
  useEffect(() => {
    photoCountRef.current = photoCount
  }, [photoCount])

  useEffect(() => {
    photoUrlsRef.current = photoUrls
  }, [photoUrls])

  const startNewCountdown = useCallback((seconds: number) => {
    setState("countdown")
    setCountdown(seconds)

    let remaining = seconds
    const interval = setInterval(() => {
      remaining--
      setCountdown(remaining)

      if (remaining <= 0) {
        clearInterval(interval)
        capturePhoto()
      }
    }, 1000)

    timerRef.current = interval
  }, [])

  const capturePhoto = async () => {
    if (!cameraRef.current) {
      setError("Camera not ready")
      return
    }

    try {
      setState("capture")
      
      setShowFlash(true)
      setTimeout(() => setShowFlash(false), 200)
      
      const blob = await cameraRef.current.capturePhoto()

      const newCount = photoCountRef.current + 1
      setPhotoCount(newCount)

      // Upload and track the promise
      const uploadPromise = (async () => {
        const formData = new FormData()
        formData.append("file", blob, `photo-${newCount}.jpg`)
        formData.append("sessionId", sessionId)
        formData.append("order", String(newCount))

        const response = await fetch("/api/photobooth/capture", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const data = await response.json()
        setPhotoUrls((prev) => [...prev, data.file.url])
      })().catch((error) => {
        console.error("Upload error:", error)
        setError("Failed to save photo, but continuing session")
      })

      uploadPromisesRef.current.push(uploadPromise)

      if (newCount >= 4) {
        setState("uploading")
        
        // Wait for all uploads to complete
        await Promise.all(uploadPromisesRef.current)
        
        // Generate photostrip
        try {
          const stripResponse = await fetch("/api/photobooth/generate-strip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          })

          if (!stripResponse.ok) {
            const errorData = await stripResponse.json()
            console.error("Failed to generate photostrip:", errorData)
            console.error("Status:", stripResponse.status)
          } else {
            const stripData = await stripResponse.json()
            console.log("Photostrip generated successfully:", stripData.stripUrl)
          }
        } catch (error) {
          console.error("Failed to generate photostrip:", error)
        }

        setState("done")
        setTimeout(() => {
          onComplete(photoUrlsRef.current)
        }, 1000)
      } else {
        startNewCountdown(3)
      }
    } catch (error) {
      console.error("Capture error:", error)
      setError("Failed to capture photo. Please try again.")
      setState("idle")
    }
  }

  useEffect(() => {
    if (!hasStartedRef.current && deviceId) {
      hasStartedRef.current = true
      const timerId = setTimeout(() => {
        startNewCountdown(5)
      }, 2000)
      timerRef.current = timerId
    }

    return () => {
      hasStartedRef.current = false
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [deviceId, startNewCountdown])

  const getStatusText = () => {
    switch (state) {
      case "idle":
        return "Get Ready..."
      case "countdown":
        return countdown > 0 ? String(countdown) : "Smile!"
      case "capture":
        return "📸 Capturing!"
      case "uploading":
        return "Creating your photostrip..."
      case "done":
        return "All done!"
      default:
        return ""
    }
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 bg-[var(--pb-espresso)]">
        {deviceId && (
          <CameraViewfinder ref={cameraRef} deviceId={deviceId} />
        )}
      </div>

      {showFlash && (
        <div className="absolute inset-0 bg-white z-50 animate-flash" />
      )}

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {(state === "countdown" || state === "capture" || state === "uploading" || state === "idle") && (
          <div className="text-center">
            <div className="text-[10rem] font-bold text-white opacity-90 photobooth-header-font leading-none animate-pulse">
              {state === "countdown" && countdown > 0 && countdown}
              {state === "capture" && "📸"}
              {state === "uploading" && <Loader2 className="w-32 h-32 animate-spin" />}
            </div>
            <div className="text-2xl text-white/80 mt-4 font-medium">
              {getStatusText()}
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all ${
              i < photoCount
                ? "bg-green-500 border-green-500"
                : "bg-transparent border-white/50"
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}
