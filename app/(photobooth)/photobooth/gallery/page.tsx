"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Camera, Loader2, ArrowLeft } from "lucide-react"

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

export default function GalleryPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSessions() {
      try {
        const response = await fetch("/api/photobooth/sessions")

        if (!response.ok) {
          throw new Error("Failed to load sessions")
        }

        const data = await response.json()
        setSessions(data)
      } catch (error) {
        console.error("Error loading sessions:", error)
        setError("Failed to load gallery")
      } finally {
        setLoading(false)
      }
    }

    loadSessions()
  }, [])

  return (
    <div className="photobooth-page min-h-screen">
      <header className="flex items-center justify-between border-b border-[var(--pb-soft-cream)]/10 bg-[var(--pb-forest-green)]/80 backdrop-blur-md px-6 md:px-12 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-full border border-[var(--pb-champagne)]/30 text-[var(--pb-champagne)]">
            <Camera className="w-5 h-5" />
          </div>
          <h2 className="text-2xl photobooth-header-font font-medium tracking-tight text-[var(--pb-soft-cream)]">
            Lumina <span className="text-[var(--pb-champagne)] italic">Booth</span>
          </h2>
        </div>
        <Link
          href="/photobooth"
          className="flex items-center gap-2 text-[var(--pb-champagne)] hover:text-[var(--pb-soft-cream)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </header>

      <main className="px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl photobooth-header-font font-light italic tracking-tight mb-4 text-[var(--pb-soft-cream)]">
            Session Gallery
          </h1>
          <p className="text-[var(--pb-champagne)]/70 text-lg max-w-2xl mx-auto">
            Browse through all your captured memories
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-[var(--pb-champagne)]" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-xl text-red-400 mb-4">{error}</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-[var(--pb-champagne)]/70 mb-4">
              No sessions yet. Start a new session to create memories!
            </p>
            <Link
              href="/photobooth/session"
              className="inline-block mt-4 px-8 py-3 bg-[var(--pb-terracotta)] text-white rounded-full font-bold hover:bg-[#b04d2b] transition-colors"
            >
              Start New Session
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/photobooth/complete?id=${session.id}`}
                className="group relative rounded-3xl overflow-hidden bg-white/5 border border-white/5 aspect-square hover:-translate-y-2 transition-transform duration-500 shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--pb-mocha)]/30 to-[var(--pb-espresso)]/50" />

                {session.photos.length > 0 && (
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-2 p-4">
                    {session.photos.slice(0, 4).map((photo, idx) => (
                      <div
                        key={photo.id}
                        className="relative rounded-lg overflow-hidden bg-gray-800"
                      >
                        <img
                          src={photo.url}
                          alt={`Photo ${photo.order}`}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[var(--pb-forest-green)] via-transparent to-transparent opacity-90" />

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-lg font-medium photobooth-header-font text-[var(--pb-soft-cream)]">
                    Session {session.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-[var(--pb-champagne)]/60 uppercase tracking-wider mt-1">
                    {new Date(session.createdAt).toLocaleDateString()} •{" "}
                    {session.photos.length} photos
                  </p>
                </div>

                <div className="absolute top-4 right-4 bg-[var(--pb-soft-cream)] text-[var(--pb-espresso)] px-3 py-1 rounded-full text-xs font-bold">
                  {session.photos.length} photos
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-auto px-12 py-12 flex flex-col md:flex-row items-center justify-between border-t border-[var(--pb-soft-cream)]/10 text-[var(--pb-champagne)]/50 text-[10px] uppercase tracking-[0.15em]">
        <p className="photobooth-header-font text-xs normal-case tracking-normal">
          © {new Date().getFullYear()} Lumina Booth Pro. Fine-line elegance for your wedding day.
        </p>
      </footer>
    </div>
  )
}
