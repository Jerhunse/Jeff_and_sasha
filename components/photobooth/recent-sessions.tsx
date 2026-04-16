"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
interface Photo {
  id: string
  url: string
  order: number
  filename: string
}

interface Session {
  id: string
  createdAt: string
  stripUrl: string | null
  photos: Photo[]
}

function SessionPreviewCard({ session }: { session: Session }) {
  const hasPhotos = session.photos.length > 0

  return (
    <Link
      href={`/photobooth/complete?id=${session.id}`}
      className="rounded-3xl overflow-hidden bg-white/5 border border-white/5 aspect-[4/5] relative group cursor-pointer transition-transform duration-500 hover:-translate-y-2 block"
    >
      <div className="w-full h-full bg-gradient-to-br from-[var(--pb-mocha)]/20 to-[var(--pb-espresso)]/40" />

      {hasPhotos && (
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1.5 p-3">
          {session.photos.slice(0, 4).map((photo) => (
            <div
              key={photo.id}
              className="relative rounded-lg overflow-hidden bg-gray-800"
            >
              <img
                src={photo.url}
                alt={`Photo ${photo.order}`}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>
      )}

      {!hasPhotos && session.stripUrl && (
        <div className="absolute inset-0 p-3">
          <img
            src={session.stripUrl}
            alt="Photo strip preview"
            className="w-full h-full object-cover rounded-2xl opacity-90 group-hover:opacity-100 transition-opacity"
          />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[var(--pb-forest-green)] via-transparent to-transparent opacity-90" />

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <p className="text-base font-medium photobooth-header-font text-[var(--pb-soft-cream)]">
          Session {session.id.slice(0, 8)}
        </p>
        <p className="text-[9px] text-[var(--pb-champagne)]/60 uppercase tracking-[0.2em] mt-1">
          {new Date(session.createdAt).toLocaleDateString()}
        </p>
      </div>
    </Link>
  )
}

function SessionCardSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden bg-white/5 border border-white/5 aspect-[4/5] relative animate-pulse">
      <div className="w-full h-full bg-gradient-to-br from-[var(--pb-mocha)]/20 to-[var(--pb-espresso)]/40" />
      <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
        <div className="h-4 bg-white/10 rounded w-24" />
        <div className="h-2 bg-white/5 rounded w-16" />
      </div>
    </div>
  )
}

export function RecentSessionsGrid() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/photobooth/sessions")
        if (!res.ok) throw new Error("Failed to load sessions")
        const data: Session[] = await res.json()
        if (!cancelled) setSessions(data.slice(0, 4))
      } catch (e) {
        console.error(e)
        if (!cancelled) setSessions([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <SessionCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-12 text-center">
        <p className="text-[var(--pb-champagne)]/80 photobooth-header-font text-lg mb-2">
          No sessions yet
        </p>
        <p className="text-[var(--pb-champagne)]/50 text-sm mb-6">
          Start a booth session to see previews here.
        </p>
        <Link
          href="/photobooth/session"
          className="inline-block px-8 py-3 bg-[var(--pb-terracotta)] text-white rounded-full text-sm font-bold hover:bg-[#b04d2b] transition-colors"
        >
          Start New Session
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {sessions.map((session) => (
        <SessionPreviewCard key={session.id} session={session} />
      ))}
    </div>
  )
}
