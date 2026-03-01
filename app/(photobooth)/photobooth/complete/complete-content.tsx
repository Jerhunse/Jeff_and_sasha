"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { PhotoboothStrip } from "@/components/photobooth/photobooth-strip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QRCodeSVG } from "qrcode.react"
import { Loader2, Send, QrCode as QrIcon } from "lucide-react"

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

export function CompletePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("id")

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
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

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !sessionId) return

    setSending(true)
    setError(null)

    try {
      const response = await fetch("/api/photobooth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sessionId }),
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

      setSent(true)
    } catch (error) {
      console.error("Error sending email:", error)
      setError("Failed to send email. Please try again.")
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="photobooth-page min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--pb-champagne)]" />
      </div>
    )
  }

  if (!session || error) {
    return (
      <div className="photobooth-page min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-400 mb-4">{error || "Session not found"}</p>
          <Button onClick={() => router.push("/photobooth")}>Back to Home</Button>
        </div>
      </div>
    )
  }

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/photobooth/download?id=${sessionId}`

  return (
    <div className="photobooth-page min-h-screen flex flex-col">
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

      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--pb-olive-green)]/10 text-[var(--pb-olive-green)] mb-4">
            <span className="text-4xl">🎉</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-3 photobooth-serif text-[var(--pb-soft-cream)]">
            Session Complete!
          </h1>
          <p className="text-[var(--pb-mocha)] text-lg max-w-xl mx-auto italic">
            Your beautiful moments are ready. Choose how you'd like to keep them.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full mb-12">
          <div className="bg-white/40 backdrop-blur-sm border border-[var(--pb-olive-green)]/10 rounded-2xl p-10 flex flex-col items-center justify-between shadow-sm">
            <div className="text-center mb-8">
              <Send className="text-5xl text-[var(--pb-espresso)] mb-4 mx-auto w-12 h-12" />
              <h2 className="text-3xl font-bold mb-3 text-[var(--pb-espresso)] photobooth-serif">
                Send to Email
              </h2>
              <p className="text-[var(--pb-mocha)] leading-relaxed">
                A digital heirloom link will be sent to your inbox.
              </p>
            </div>

            <form onSubmit={handleSendEmail} className="w-full max-w-md">
              <div className="flex flex-col w-full gap-4">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email Address"
                  className="rounded-full border-[var(--pb-espresso)] bg-transparent px-6 py-3 text-[var(--pb-espresso)]"
                  required
                  disabled={sent}
                />
                <Button
                  type="submit"
                  disabled={sending || sent}
                  className="bg-[var(--pb-terracotta)] text-white py-3 rounded-full font-bold hover:brightness-110 transition-all shadow-lg"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : sent ? (
                    "✓ Sent!"
                  ) : (
                    "Send Photos"
                  )}
                </Button>
              </div>
            </form>
          </div>

          <div className="bg-white/40 backdrop-blur-sm border border-[var(--pb-olive-green)]/10 rounded-2xl p-10 flex flex-col items-center justify-between shadow-sm">
            <div className="text-center mb-6">
              <QrIcon className="text-5xl text-[var(--pb-olive-green)] mb-4 mx-auto w-12 h-12" />
              <h2 className="text-3xl font-bold mb-3 text-[var(--pb-espresso)] photobooth-serif">
                Scan to Download
              </h2>
              <p className="text-[var(--pb-mocha)] leading-relaxed">
                Save your memories instantly to your phone.
              </p>
            </div>

            <div className="relative p-8 bg-white rounded-2xl border-[3px] border-[var(--pb-olive-green)] shadow-inner">
              <QRCodeSVG value={shareUrl} size={192} />
            </div>

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-[var(--pb-olive-green)]/70">
              Scan with your camera
            </p>
          </div>
        </div>

        <div className="mt-16 w-full">
          <p className="text-center text-xs font-bold text-[var(--pb-mocha)] uppercase tracking-[0.3em] mb-6">
            A glimpse of your memories
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
