"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { SimpleRsvpForm } from "@/components/rsvp/simple-rsvp-form"

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

interface EnvelopeLandingProps {
  partner1Name: string
  partner2Name: string
  weddingDate: string
  redirectTo: string
  weddingDetails?: WeddingDetails
}

export function EnvelopeLanding({
  partner1Name,
  partner2Name,
  weddingDate,
  redirectTo,
  weddingDetails,
}: EnvelopeLandingProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showRsvpForm, setShowRsvpForm] = useState(false)
  const [hasRsvp, setHasRsvp] = useState(false)
  const router = useRouter()

  // Check if user has already RSVP'd on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const rsvpSubmitted = localStorage.getItem("rsvp_submitted")
      if (rsvpSubmitted === "true") {
        setHasRsvp(true)
      }
    }
  }, [])

  const handleClick = () => {
    if (isOpen) return
    setIsOpen(true)

    // If they haven't RSVP'd, show the form after animation
    if (!hasRsvp) {
      setTimeout(() => {
        setShowRsvpForm(true)
      }, 1200)
    } else {
      // If they have RSVP'd, redirect as normal
      setTimeout(() => {
        router.push(redirectTo)
      }, 1200)
    }
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
        // If it's not a valid date, try to parse as formatted string
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
          <div className="w-full max-w-2xl px-4 py-8">
            <div className="text-center mb-8">
              <h1 className="font-cursive text-4xl md:text-5xl text-gold mb-2">
                RSVP
              </h1>
              <p className="text-xl text-muted-foreground">
                {partner1Name} & {partner2Name}
              </p>
            </div>
            <SimpleRsvpForm
              partner1Name={partner1Name}
              partner2Name={partner2Name}
              weddingDate={weddingDate}
              onSuccess={handleRsvpSuccess}
              weddingDetails={weddingDetails}
            />
          </div>
        )}
      </div>
    </>
  )
}
