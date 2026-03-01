"use client"

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react"

interface CameraViewfinderProps {
  deviceId: string | null
  onError?: (error: Error) => void
}

export interface CameraViewfinderRef {
  capturePhoto: () => Promise<Blob>
}

export const CameraViewfinder = forwardRef<
  CameraViewfinderRef,
  CameraViewfinderProps
>(({ deviceId, onError }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useImperativeHandle(ref, () => ({
    capturePhoto: async () => {
      if (!videoRef.current || !canvasRef.current) {
        throw new Error("Camera not ready")
      }

      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        throw new Error("Could not get canvas context")
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to capture photo"))
            }
          },
          "image/jpeg",
          0.92
        )
      })
    },
  }))

  useEffect(() => {
    let mounted = true

    async function startCamera() {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }

        if (!deviceId) return

        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error("Error starting camera:", error)
        if (onError) {
          onError(error as Error)
        }
      }
    }

    startCamera()

    return () => {
      mounted = false
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [deviceId, onError])

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
    </>
  )
})

CameraViewfinder.displayName = "CameraViewfinder"
