"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Loader2, Camera, AlertCircle } from "lucide-react"

interface TetheredSessionCaptureProps {
  sessionId: string
  photoStyle: "color" | "bw"
  onComplete: (photoUrls: string[]) => void
}

type CaptureState =
  | "idle"
  | "countdown"
  | "waiting"
  | "uploading"
  | "done"

export function TetheredSessionCapture({
  sessionId,
  photoStyle,
  onComplete,
}: TetheredSessionCaptureProps) {
  const [state, setState] = useState<CaptureState>("idle")
  const [countdown, setCountdown] = useState(5)
  const [photoCount, setPhotoCount] = useState(0)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [lastPhotoUrl, setLastPhotoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showFlash, setShowFlash] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const hasStartedRef = useRef(false)
  const photoCountRef = useRef(0)
  const photoUrlsRef = useRef<string[]>([])

  useEffect(() => {
    photoCountRef.current = photoCount
  }, [photoCount])

  useEffect(() => {
    photoUrlsRef.current = photoUrls
  }, [photoUrls])


  const capturePhoto = useCallback(async () => {
    const currentOrder = photoCountRef.current + 1

    try {
      setState("waiting")
      const response = await fetch("/api/photobooth/tethered-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, order: currentOrder, photoStyle }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Capture failed")
      }

      const data = await response.json()
      const capturedFile = data.file

      setShowFlash(true)
      setTimeout(() => setShowFlash(false), 300)

      const newCount = currentOrder
      setPhotoCount(newCount)
      setPhotoUrls((prev) => [...prev, capturedFile.url])
      setLastPhotoUrl(capturedFile.url)

      if (newCount >= 4) {
        setState("uploading")

        try {
          const stripResponse = await fetch("/api/photobooth/generate-strip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          })

          if (!stripResponse.ok) {
            const errorData = await stripResponse.json()
            console.error("Failed to generate photostrip:", errorData)
          } else {
            const stripData = await stripResponse.json()
            console.log("Photostrip generated:", stripData.stripUrl)
          }
        } catch (err) {
          console.error("Failed to generate photostrip:", err)
        }

        setState("done")
        setTimeout(() => {
          onComplete(photoUrlsRef.current)
        }, 1500)
      } else {
        startNewCountdown(3)
      }
    } catch (err) {
      console.error("Tethered capture error:", err)
      const message = err instanceof Error ? err.message : "Capture failed"

      if (message.includes("timed out")) {
        setError("No photo detected. Click the shutter on Imaging Edge, then try again.")
      } else {
        setError(message)
      }
      setState("idle")

      setTimeout(() => {
        setError(null)
        startNewCountdown(3)
      }, 3000)
    }
  }, [onComplete, photoStyle, sessionId])

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
  }, [capturePhoto])

  useEffect(() => {
    if (!hasStartedRef.current) {
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
  }, [startNewCountdown])

  const getStatusText = () => {
    switch (state) {
      case "idle":
        return "Get Ready..."
      case "countdown":
        return countdown > 0 ? String(countdown) : "Smile!"
      case "waiting":
        return "Click the shutter!"
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
        {lastPhotoUrl ? (
          <img
            src={lastPhotoUrl}
            alt="Last captured photo"
            className="w-full h-full object-cover opacity-40"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="w-32 h-32 text-white/10" />
          </div>
        )}
      </div>

      {showFlash && (
        <div className="absolute inset-0 bg-white z-50 animate-flash" />
      )}

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
        {(state === "countdown" || state === "waiting" || state === "uploading" || state === "idle") && (
          <div className="text-center flex flex-col items-center justify-center">
            <div
              className="font-bold text-white opacity-95 photobooth-header-font leading-none animate-pulse drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
              style={{ fontSize: "min(70vw, 70vh)" }}
            >
              {state === "countdown" && countdown > 0 && countdown}
              {state === "waiting" && (
                <Camera
                  className="animate-bounce"
                  style={{ width: "min(40vw, 40vh)", height: "min(40vw, 40vh)" }}
                />
              )}
              {state === "uploading" && (
                <Loader2 className="animate-spin" style={{ width: "min(40vw, 40vh)", height: "min(40vw, 40vh)" }} />
              )}
            </div>
            <div className="text-3xl md:text-5xl text-white/90 mt-6 font-bold tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
              {getStatusText()}
            </div>
            {state === "waiting" && (
              <div className="mt-6 text-xl md:text-2xl text-white/70 animate-pulse">
                Waiting for camera...
              </div>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-5 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-4 transition-all shadow-lg ${
              i < photoCount
                ? "bg-green-500 border-green-400 shadow-green-500/60 scale-110"
                : i === photoCount && (state === "countdown" || state === "waiting")
                  ? "bg-black/30 border-white animate-pulse scale-125 backdrop-blur-sm"
                  : "bg-black/30 border-white/70 backdrop-blur-sm"
            }`}
          />
        ))}
      </div>

      <div className="absolute top-8 right-8 pointer-events-none">
        <div className="bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-2">
          <div className={`size-2.5 rounded-full ${
            state === "waiting" ? "bg-yellow-500 animate-pulse" : "bg-green-500"
          }`} />
          <span className="text-white text-xs font-bold uppercase tracking-wider">
            {state === "waiting" ? "Awaiting Shutter" : "Tethered"}
          </span>
        </div>
      </div>

      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white px-4 py-3 rounded-lg flex items-center gap-3 backdrop-blur-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
