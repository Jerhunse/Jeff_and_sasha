"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { PhotoboothStrip } from "@/components/photobooth/photobooth-strip"
import { Button } from "@/components/ui/button"
import { Loader2, Download } from "lucide-react"

interface Photo {
  id: string
  url: string
  order: number
  filename: string
}

interface Session {
  id: string
  createdAt: string
  photos: Photo[]
}

export function DownloadPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("id")

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      router.push("/photobooth")
      return
    }

    async function loadSession() {
      try {
        const response = await fetch(`/api/photobooth/session?id=${sessionId}`)

        if (!response.ok) {
          throw new Error("Failed to load session")
        }

        const data = await response.json()
        setSession(data)
      } catch (error) {
        console.error("Error loading session:", error)
        setError("Failed to load session")
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [sessionId, router])

  const downloadPhoto = async (photo: Photo) => {
    setDownloading(photo.id)
    try {
      const response = await fetch(photo.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = photo.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download error:", error)
      setError("Failed to download photo")
    } finally {
      setDownloading(null)
    }
  }

  const downloadAllPhotos = async () => {
    if (!session) return

    for (const photo of session.photos) {
      await downloadPhoto(photo)
      // Small delay between downloads to prevent browser blocking
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }

  if (loading) {
    return (
      <div className="photobooth-page flex items-center justify-center" style={{ minHeight: '100dvh' }}>
        <Loader2 className="w-12 h-12 animate-spin text-[var(--pb-champagne)]" />
      </div>
    )
  }

  if (!session || error) {
    return (
      <div className="photobooth-page flex items-center justify-center" style={{ minHeight: '100dvh' }}>
        <div className="text-center">
          <p className="text-xl text-red-400 mb-4">{error || "Session not found"}</p>
          <Button onClick={() => router.push("/photobooth")}>Back to Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="photobooth-page flex flex-col" style={{ minHeight: '100dvh' }}>
      <header className="flex items-center justify-between whitespace-nowrap border-b border-[var(--pb-olive-green)]/20 px-6 py-6 lg:px-20 bg-[var(--pb-forest-green)]/80 backdrop-blur-md">
        <div className="flex items-center gap-3 text-[var(--pb-forest-green)]">
          <div className="size-6">
            <span className="text-3xl">🌿</span>
          </div>
          <h2 className="text-[var(--pb-soft-cream)] text-2xl font-bold italic photobooth-serif">
            The Wedding Gallery
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline-block text-[var(--pb-mocha)] text-sm font-medium italic">
            Our Special Day {new Date().getFullYear()}
          </span>
          <div className="flex min-w-[84px] items-center justify-center rounded-full h-10 px-6 border border-[var(--pb-olive-green)]/30 text-[var(--pb-olive-green)] text-sm font-semibold">
            <span className="truncate">Session #{sessionId?.slice(0, 6) || "---"}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center p-6 lg:p-10 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--pb-olive-green)]/10 text-[var(--pb-olive-green)] mb-4">
            <Download className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-3 photobooth-serif text-[var(--pb-soft-cream)]">
            Download Your Photos
          </h1>
          <p className="text-[var(--pb-mocha)] text-lg max-w-xl mx-auto italic">
            Your beautiful moments are ready to download.
          </p>
        </div>

        <div className="w-full max-w-2xl mb-12">
          <Button
            onClick={downloadAllPhotos}
            disabled={!!downloading}
            className="w-full bg-[var(--pb-terracotta)] text-white py-6 rounded-full font-bold text-lg hover:brightness-110 transition-all shadow-lg mb-8"
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Download All Photos ({session.photos.length})
              </>
            )}
          </Button>

          <div className="bg-white/40 backdrop-blur-sm border border-[var(--pb-olive-green)]/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-6 text-[var(--pb-espresso)] photobooth-serif text-center">
              Or download individually:
            </h3>
            <div className="space-y-4">
              {session.photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="flex items-center justify-between p-4 bg-white/60 rounded-lg border border-[var(--pb-olive-green)]/20"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={photo.url}
                      alt={`Photo ${idx + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border-2 border-[var(--pb-olive-green)]/30"
                    />
                    <span className="text-[var(--pb-espresso)] font-medium">
                      Photo {idx + 1}
                    </span>
                  </div>
                  <Button
                    onClick={() => downloadPhoto(photo)}
                    disabled={downloading === photo.id}
                    variant="outline"
                    className="border-[var(--pb-olive-green)] text-[var(--pb-olive-green)] hover:bg-[var(--pb-olive-green)]/10"
                  >
                    {downloading === photo.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 w-full">
          <p className="text-center text-xs font-bold text-[var(--pb-mocha)] uppercase tracking-[0.3em] mb-6">
            Preview
          </p>

          {session.photos.length > 0 && (
            <div className="flex justify-center">
              <PhotoboothStrip photos={session.photos} />
            </div>
          )}
        </div>

        <div className="mt-12 mb-8">
          <button
            onClick={() => router.push("/photobooth")}
            className="flex items-center gap-1 px-8 py-2 text-[var(--pb-mocha)] hover:text-[var(--pb-soft-cream)] transition-colors group"
          >
            <span className="photobooth-script text-4xl leading-none transition-transform group-hover:-translate-x-2">
              ←
            </span>
            <span className="photobooth-script text-3xl pb-1">Back to Home</span>
          </button>
        </div>
      </main>

      <footer className="p-8 text-center text-[var(--pb-mocha)] text-xs font-medium tracking-wide border-t border-[var(--pb-olive-green)]/10">
        © {new Date().getFullYear()} Crafted with Love • Digital Gallery Portal
      </footer>
    </div>
  )
}
