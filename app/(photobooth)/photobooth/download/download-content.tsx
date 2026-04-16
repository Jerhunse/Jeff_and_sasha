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
  stripUrl?: string | null
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

  // Trigger a same-origin download through our proxy route.
  // Using a real anchor navigation (rather than fetch+blob) is the most
  // reliable approach across mobile browsers — especially iOS Safari,
  // which frequently ignores the `download` attribute on cross-origin
  // blob URLs and can fail CORS preflight for Supabase public URLs.
  const triggerDownload = (href: string, filename: string) => {
    const a = document.createElement("a")
    a.href = href
    a.download = filename
    a.rel = "noopener"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const downloadPhoto = async (photo: Photo) => {
    setDownloading(photo.id)
    try {
      const baseName = photo.filename?.split("/").pop() || `photo-${photo.order + 1}.jpg`
      triggerDownload(
        `/api/photobooth/download?photoId=${encodeURIComponent(photo.id)}`,
        baseName
      )
    } catch (error) {
      console.error("Download error:", error)
      setError("Failed to download photo")
    } finally {
      // Small delay so the UI reflects the click before clearing state
      setTimeout(() => setDownloading(null), 600)
    }
  }

  const downloadAllPhotos = async () => {
    if (!session) return

    for (const photo of session.photos) {
      await downloadPhoto(photo)
      // Small delay between downloads to prevent browser blocking
      await new Promise((resolve) => setTimeout(resolve, 800))
    }
  }

  const downloadStrip = async () => {
    if (!session?.stripUrl || !sessionId) return

    setDownloading("strip")
    try {
      triggerDownload(
        `/api/photobooth/download?sessionId=${encodeURIComponent(sessionId)}&type=strip`,
        `photobooth-strip-${sessionId}.jpg`
      )
    } catch (error) {
      console.error("Download error:", error)
      setError("Failed to download photo strip")
    } finally {
      setTimeout(() => setDownloading(null), 600)
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
          {session.stripUrl && (
            <Button
              onClick={downloadStrip}
              disabled={downloading === "strip"}
              className="w-full bg-[var(--pb-olive-green)] text-white py-6 rounded-full font-bold text-lg hover:brightness-110 transition-all shadow-lg mb-4"
            >
              {downloading === "strip" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Download Photo Strip
                </>
              )}
            </Button>
          )}

          <Button
            onClick={downloadAllPhotos}
            disabled={!!downloading}
            className="w-full bg-[var(--pb-terracotta)] text-white py-6 rounded-full font-bold text-lg hover:brightness-110 transition-all shadow-lg mb-8"
          >
            {downloading && downloading !== "strip" ? (
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

          {session.stripUrl ? (
            <div className="flex justify-center">
              <img 
                src={session.stripUrl} 
                alt="Photo strip preview" 
                className="max-w-md w-full rounded-lg shadow-2xl border-4 border-white"
              />
            </div>
          ) : session.photos.length > 0 && (
            <div className="flex justify-center">
              <PhotoboothStrip photos={session.photos} />
            </div>
          )}
        </div>

        <div className="mt-12 mb-8 w-full max-w-2xl">
          <Button
            onClick={() => router.push("/photobooth")}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-8 rounded-full font-extrabold text-2xl md:text-3xl uppercase tracking-wide shadow-xl border-4 border-red-700 transition-all hover:scale-[1.02]"
          >
            ← Back to Home
          </Button>
        </div>
      </main>

      <footer className="p-8 text-center text-[var(--pb-mocha)] text-xs font-medium tracking-wide border-t border-[var(--pb-olive-green)]/10">
        © {new Date().getFullYear()} Crafted with Love • Digital Gallery Portal
      </footer>
    </div>
  )
}
