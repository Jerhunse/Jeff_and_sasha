"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CameraSelector } from "@/components/photobooth/camera-selector"
import { SessionCapture } from "@/components/photobooth/session-capture"
import { TetheredSessionCapture } from "@/components/photobooth/tethered-session-capture"
import { Button } from "@/components/ui/button"
import { Loader2, Camera, Aperture } from "lucide-react"

type CameraMode = "webcam" | "tethered" | null
type PhotoStyle = "color" | "bw"

export default function SessionPage() {
  const router = useRouter()
  const [cameraMode, setCameraMode] = useState<CameraMode>(null)
  const [tetheredAvailable, setTetheredAvailable] = useState(false)
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showInstructions, setShowInstructions] = useState(true)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [photoStyle, setPhotoStyle] = useState<PhotoStyle>("color")

  useEffect(() => {
    fetch("/api/photobooth/tethered-status")
      .then((res) => res.json())
      .then((data) => {
        if (data.available) {
          setTetheredAvailable(true)
          setCameraMode("tethered")
        } else {
          setCameraMode("webcam")
        }
      })
      .catch(() => {
        setCameraMode("webcam")
      })
  }, [])

  const handleBeginSession = async () => {
    if (cameraMode === "webcam" && !selectedDeviceId) {
      alert("Please select a camera first")
      return
    }

    setIsCreatingSession(true)

    try {
      const response = await fetch("/api/photobooth/session", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to create session")
      }

      const data = await response.json()
      setSessionId(data.id)
      setShowInstructions(false)
    } catch (error) {
      console.error("Error creating session:", error)
      alert("Failed to start session. Please try again.")
    } finally {
      setIsCreatingSession(false)
    }
  }

  const handleSessionComplete = (photoUrls: string[]) => {
    if (sessionId) {
      router.push(`/photobooth/complete?id=${sessionId}`)
    }
  }

  const canBegin = cameraMode === "tethered" || (cameraMode === "webcam" && !!selectedDeviceId)

  return (
    <div className="photobooth-page relative w-full" style={{ minHeight: '100dvh' }}>
      {showInstructions ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto -webkit-overflow-scrolling-touch">
          <div className="w-full max-w-2xl bg-[var(--pb-soft-cream)] rounded-2xl shadow-2xl overflow-hidden border-[12px] border-[var(--pb-olive-green)]/10 relative my-auto">
            <div className="absolute top-0 left-0 p-4 opacity-40 pointer-events-none">
              <span className="text-[var(--pb-olive-green)] text-7xl">🌿</span>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-40 pointer-events-none">
              <span className="text-[var(--pb-olive-green)] text-7xl">🌿</span>
            </div>
            <div className="absolute bottom-0 left-0 p-4 opacity-40 pointer-events-none rotate-180">
              <span className="text-[var(--pb-olive-green)] text-7xl">🌿</span>
            </div>
            <div className="absolute bottom-0 right-0 p-4 opacity-40 pointer-events-none rotate-180">
              <span className="text-[var(--pb-olive-green)] text-7xl">🌿</span>
            </div>

            <div className="p-8 md:p-12 relative z-10">
              <div className="flex flex-col items-center text-center space-y-8">
                <div className="relative">
                  <div className="size-24 rounded-full border border-[var(--pb-mocha)]/20 flex items-center justify-center relative">
                    <span className="text-[var(--pb-mocha)] text-6xl">⏱️</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-[var(--pb-espresso)] text-4xl font-bold tracking-tight photobooth-serif">
                    Wedding Session Instructions
                  </h1>
                  <p className="text-[var(--pb-forest-green)] text-xl font-medium italic">
                    Ready for your close-up?
                  </p>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[var(--pb-champagne)]/20 p-6 rounded-xl border border-[var(--pb-olive-green)]/20 flex flex-col items-center text-center space-y-3">
                    <span className="text-[var(--pb-mocha)] text-3xl">⏱️</span>
                    <div className="text-[var(--pb-espresso)]">
                      <span className="block text-sm uppercase tracking-widest text-[var(--pb-olive-green)] font-bold mb-1">
                        Step One
                      </span>
                      <p className="text-lg leading-tight">
                        <span className="text-[var(--pb-forest-green)] font-bold">5 seconds</span> for the first photo, then{" "}
                        <span className="text-[var(--pb-forest-green)] font-bold">3 seconds</span> between each.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[var(--pb-champagne)]/20 p-6 rounded-xl border border-[var(--pb-olive-green)]/20 flex flex-col items-center text-center space-y-3">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <span key={i} className="text-[var(--pb-mocha)] text-xl">
                          📸
                        </span>
                      ))}
                    </div>
                    <div className="text-[var(--pb-espresso)]">
                      <span className="block text-sm uppercase tracking-widest text-[var(--pb-olive-green)] font-bold mb-1">
                        Step Two
                      </span>
                      <p className="text-lg leading-tight">
                        <span className="text-[var(--pb-forest-green)] font-bold">4 pictures</span>{" "}
                        will be taken with short breaks.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full aspect-video bg-[var(--pb-espresso)]/90 rounded-2xl relative overflow-hidden border-4 border-[var(--pb-champagne)] shadow-xl flex items-center justify-center">
                  <span className="text-[var(--pb-champagne)]/20 text-9xl">📷</span>
                  <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                    <div className={`size-2.5 rounded-full animate-pulse ${cameraMode === "tethered" ? "bg-blue-500" : "bg-red-500"}`}></div>
                    <span className="text-white text-xs font-bold uppercase tracking-[0.2em]">
                      {cameraMode === "tethered" ? "Sony A7 IV Connected" : "Ready to Capture"}
                    </span>
                  </div>
                </div>

                <div className="w-full pt-4">
                  {tetheredAvailable && (
                    <div className="mb-4 flex gap-2">
                      <button
                        onClick={() => setCameraMode("tethered")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all text-sm font-bold uppercase tracking-wider ${
                          cameraMode === "tethered"
                            ? "border-[var(--pb-forest-green)] bg-[var(--pb-forest-green)]/10 text-[var(--pb-forest-green)]"
                            : "border-[var(--pb-champagne)]/30 text-[var(--pb-mocha)]/60 hover:border-[var(--pb-forest-green)]/50"
                        }`}
                      >
                        <Aperture className="w-4 h-4" />
                        Sony Camera
                      </button>
                      <button
                        onClick={() => setCameraMode("webcam")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all text-sm font-bold uppercase tracking-wider ${
                          cameraMode === "webcam"
                            ? "border-[var(--pb-forest-green)] bg-[var(--pb-forest-green)]/10 text-[var(--pb-forest-green)]"
                            : "border-[var(--pb-champagne)]/30 text-[var(--pb-mocha)]/60 hover:border-[var(--pb-forest-green)]/50"
                        }`}
                      >
                        <Camera className="w-4 h-4" />
                        Webcam
                      </button>
                    </div>
                  )}

                  {cameraMode === "webcam" && (
                    <div className="mb-4">
                      <CameraSelector
                        selectedDeviceId={selectedDeviceId}
                        onDeviceSelect={setSelectedDeviceId}
                      />
                    </div>
                  )}

                  {cameraMode === "tethered" && (
                    <div className="mb-4 rounded-2xl border border-[var(--pb-forest-green)]/20 bg-[var(--pb-forest-green)]/5 px-4 py-3 text-[var(--pb-forest-green)]">
                      <div className="flex items-center justify-center gap-2">
                        <Aperture className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Tethered Mode — Trigger shutter from Imaging Edge
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--pb-olive-green)] mb-2">
                      Photo Style
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPhotoStyle("color")}
                        className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all text-sm font-bold uppercase tracking-wider ${
                          photoStyle === "color"
                            ? "border-[var(--pb-forest-green)] bg-[var(--pb-forest-green)]/10 text-[var(--pb-forest-green)]"
                            : "border-[var(--pb-champagne)]/30 text-[var(--pb-mocha)]/60 hover:border-[var(--pb-forest-green)]/50"
                        }`}
                      >
                        Color
                      </button>
                      <button
                        onClick={() => setPhotoStyle("bw")}
                        className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all text-sm font-bold uppercase tracking-wider ${
                          photoStyle === "bw"
                            ? "border-[var(--pb-forest-green)] bg-[var(--pb-forest-green)]/10 text-[var(--pb-forest-green)]"
                            : "border-[var(--pb-champagne)]/30 text-[var(--pb-mocha)]/60 hover:border-[var(--pb-forest-green)]/50"
                        }`}
                      >
                        Black & White
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleBeginSession}
                    disabled={!canBegin || isCreatingSession}
                    className="w-full bg-[var(--pb-terracotta)] hover:bg-[#b34a2c] text-white text-2xl font-bold py-6 rounded-2xl transition-all shadow-lg"
                  >
                    {isCreatingSession ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <span className="photobooth-serif">Begin Session</span>
                        <span className="ml-4">❤️</span>
                      </>
                    )}
                  </Button>

                  <p className="mt-6 text-[var(--pb-mocha)]/70 text-sm italic">
                    Smile, laugh, and celebrate the moment!
                  </p>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 bg-[var(--pb-champagne)]/30 border-t border-[var(--pb-olive-green)]/10 flex justify-between items-center">
              <button
                onClick={() => router.push("/photobooth")}
                className="text-[var(--pb-espresso)]/60 hover:text-[var(--pb-terracotta)] transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : sessionId && cameraMode === "tethered" ? (
        <div className="fixed inset-0 bg-[var(--pb-forest-green)]">
          <TetheredSessionCapture
            sessionId={sessionId}
            photoStyle={photoStyle}
            onComplete={handleSessionComplete}
          />
        </div>
      ) : sessionId && selectedDeviceId ? (
        <div className="fixed inset-0 bg-[var(--pb-forest-green)]">
          <SessionCapture
            sessionId={sessionId}
            deviceId={selectedDeviceId}
            photoStyle={photoStyle}
            onComplete={handleSessionComplete}
          />
        </div>
      ) : null}
    </div>
  )
}
