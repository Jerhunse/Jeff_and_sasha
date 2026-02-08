"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { RsvpForm } from "@/components/rsvp/rsvp-form"
import { CountdownTimer } from "@/components/wedding/countdown-timer"
import { Heart } from "lucide-react"
import { Guest, Couple } from "@prisma/client"

interface WeddingEvent {
  name: string
  startTime: string
  endTime?: string | null
  location?: string | null
  address?: string | null
  venue?: string | null
}

interface WeddingDetails {
  venueName?: string | null
  venueAddress?: string | null
  venueCity?: string | null
  venueState?: string | null
  venueZip?: string | null
  events?: WeddingEvent[]
}

interface EnvelopeLandingWithCodeProps {
  partner1Name: string
  partner2Name: string
  weddingDate: string
  redirectTo: string
  weddingDetails?: WeddingDetails
  guest: {
    id: string
    firstName: string
    lastName: string
    email?: string | null
    phone?: string | null
    allowPlusOne: boolean
    plusOneUsed: boolean
    plusOneName?: string | null
    rsvpStatus: string
    inviteToken: string
    maxGuestsAllowed?: number
  }
  couple: {
    id: string
    partner1Name: string
    partner2Name: string
    weddingDate: Date
    slug: string
    rsvpDeadline?: Date | null
    askMealChoice: boolean
    mealOptions?: string | null
    askSongRequest: boolean
    askBusTransport: boolean
    busRoutes?: string | null
    maxCapacity?: number | null
  }
}

export function EnvelopeLandingWithCode({
  partner1Name,
  partner2Name,
  weddingDate,
  redirectTo,
  weddingDetails,
  guest,
  couple,
}: EnvelopeLandingWithCodeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showRsvpForm, setShowRsvpForm] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if we should skip the envelope animation
  useEffect(() => {
    const skipEnvelope = searchParams.get('skipEnvelope')
    if (skipEnvelope === 'true') {
      setShowRsvpForm(true)
    }
  }, [searchParams])

  const handleClick = () => {
    if (isOpen) return
    setIsOpen(true)

    // Show the RSVP form after envelope animation
    setTimeout(() => {
      setShowRsvpForm(true)
    }, 1200)
  }

  const handleRsvpSuccess = () => {
    // After successful RSVP, redirect to the wedding site
    setTimeout(() => {
      router.push(redirectTo)
    }, 500)
  }

  // Format date to match the example format (MM.DD.YY)
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return weddingDate
      }
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const year = String(date.getFullYear()).slice(-2)
      return `${month}.${day}.${year}`
    } catch {
      return weddingDate
    }
  }

  return (
    <>
      <style jsx>{`
        .envelope-scene {
          min-height: 100vh;
          background: var(--bg-linen);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-family: var(--font-cormorant), serif;
        }

        .envelope-container {
          text-align: center;
        }

        .envelope {
          position: relative;
          width: 320px;
          height: 220px;
          cursor: pointer;
          perspective: 1000px;
        }

        .envelope-body {
          position: absolute;
          width: 100%;
          height: 100%;
          background: var(--sage-soft);
          border-radius: 6px;
          z-index: 1;
        }

        .envelope-flap {
          position: absolute;
          top: 0;
          width: 100%;
          height: 50%;
          background: var(--sage-deep);
          transform-origin: top;
          transform: rotateX(0deg);
          transition: transform 1s ease;
          z-index: 3;
          clip-path: polygon(0 0, 100% 0, 50% 100%);
          border-radius: 6px 6px 0 0;
        }

        .envelope-card {
          position: absolute;
          width: 90%;
          height: 85%;
          background: var(--paper-ivory);
          top: 8%;
          left: 5%;
          border-radius: 4px;
          z-index: 2;
          transform: translateY(0);
          transition: transform 1s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: var(--shadow-soft);
        }

        .envelope-card p {
          color: var(--ink-main);
          font-family: var(--font-cursive), "Dancing Script", cursive;
          font-size: 22px;
          letter-spacing: 1px;
          text-align: center;
          line-height: 1.4;
          margin: 0;
        }

        .envelope.open .envelope-flap {
          transform: rotateX(-160deg);
        }

        .envelope.open .envelope-card {
          transform: translateY(-140%);
        }

        .hint {
          margin-top: 16px;
          color: var(--ink-muted);
          font-size: 14px;
          letter-spacing: 2px;
          transition: opacity 0.3s ease;
        }

        .hint.hidden {
          opacity: 0;
        }

        @media (min-width: 768px) {
          .envelope {
            width: 400px;
            height: 275px;
          }

          .envelope-card p {
            font-size: 28px;
          }
        }
      `}</style>

      <div className="envelope-scene">
        {!showRsvpForm ? (
          <div className="envelope-container">
            <div
              className={`envelope ${isOpen ? "open" : ""}`}
              onClick={handleClick}
            >
              <div className="envelope-flap"></div>
              <div className="envelope-card">
                <p>
                  {partner1Name} + {partner2Name}
                  <br />
                  {formatDate(weddingDate)}
                </p>
              </div>
              <div className="envelope-body"></div>
            </div>

            <p className={`hint ${isOpen ? "hidden" : ""}`}>Click to open</p>
            <p className="mt-6">
              <Link
                href={redirectTo}
                className="text-sm text-muted-foreground hover:text-gold underline underline-offset-2 transition-colors"
              >
                Skip to wedding details →
              </Link>
            </p>
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center py-16 px-4">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
                  <Heart className="h-8 w-8 text-gold fill-gold" />
                </div>
                <h1 className="font-cursive text-4xl md:text-5xl text-black mb-2">
                  RSVP
                </h1>
                <p className="text-xl text-muted-foreground">
                  {couple.partner1Name} & {couple.partner2Name}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {new Date(couple.weddingDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <div className="mt-4">
                  <CountdownTimer targetDate={couple.weddingDate} compact />
                </div>
              </div>
              <RsvpForm guest={guest} couple={couple} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
