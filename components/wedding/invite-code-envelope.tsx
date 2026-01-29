"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface InviteCodeEnvelopeProps {
  redirectTo: string
  /** URL of the landing background image. Defaults to /landing-background.png */
  imageUrl?: string
}

const INVITE_CODE = "sj2026"

const DEFAULT_LANDING_IMAGE = "/landing-background.png"

export function InviteCodeEnvelope({ redirectTo, imageUrl }: InviteCodeEnvelopeProps) {
  const backgroundImageUrl = imageUrl?.trim() || DEFAULT_LANDING_IMAGE
  const [showForm, setShowForm] = useState(false)
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleCenterClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (code.trim().toLowerCase() !== INVITE_CODE.toLowerCase()) {
      setError("Invalid invite code. Please try again.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/verify-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      })

      if (!response.ok) {
        throw new Error("Failed to verify code")
      }

      router.push(redirectTo)
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleOverlayBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowForm(false)
    }
  }

  return (
    <>
      <style jsx>{`
        .landing-scene {
          position: fixed;
          inset: 0;
          min-height: 100vh;
          min-height: 100dvh;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        /* Clickable center region – middle of the image */
        .center-hotspot {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: min(40%, 280px);
          height: min(35%, 220px);
          min-width: 120px;
          min-height: 100px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s ease;
          z-index: 1;
        }

        .center-hotspot:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .center-hotspot:focus {
          outline: 2px solid rgba(200, 164, 77, 0.5);
          outline-offset: 4px;
        }

        .center-hint {
          font-family: var(--font-eb-garamond), serif;
          font-size: clamp(12px, 2vw, 16px);
          color: rgba(63, 62, 60, 0.5);
          letter-spacing: 1px;
          text-align: center;
          pointer-events: none;
          max-width: 140px;
        }

        .form-overlay {
          position: fixed;
          inset: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(6px);
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .form-overlay.visible {
          opacity: 1;
          visibility: visible;
        }

        .form-container {
          background: var(--paper-ivory);
          padding: 40px 32px;
          box-shadow: var(--shadow-paper);
          border: 1px solid rgba(200, 164, 77, 0.2);
          border-radius: var(--radius-card);
          width: 100%;
          max-width: 420px;
          transform: scale(0.95);
          transition: transform 0.3s ease;
        }

        .form-overlay.visible .form-container {
          transform: scale(1);
        }

        .form-container h2 {
          font-family: var(--font-cormorant), serif;
          font-size: 28px;
          font-weight: 300;
          color: var(--ink-main);
          margin-bottom: 8px;
          letter-spacing: 1px;
          text-align: center;
        }

        .form-container p {
          font-family: var(--font-eb-garamond), serif;
          font-size: 15px;
          color: var(--ink-muted);
          margin-bottom: 24px;
          line-height: 1.6;
          text-align: center;
        }

        .code-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .code-input {
          font-family: var(--font-eb-garamond), serif;
          font-size: 16px;
          letter-spacing: 2px;
          text-align: center;
          text-transform: lowercase;
          border: 1px solid rgba(200, 164, 77, 0.3);
        }

        .code-input:focus {
          border-color: var(--gold-leaf);
          outline: none;
          box-shadow: 0 0 0 2px rgba(200, 164, 77, 0.1);
        }

        .error-message {
          color: var(--wax-copper);
          font-size: 14px;
          font-family: var(--font-eb-garamond), serif;
          margin-top: -4px;
          text-align: center;
        }

        @media (max-width: 640px) {
          .form-container {
            padding: 32px 24px;
          }

          .form-container h2 {
            font-size: 24px;
          }

          .center-hint {
            font-size: 12px;
          }
        }
      `}</style>

      <div
        className="landing-scene"
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundColor: "var(--bg-linen)",
        }}
      >
        {/* Center hotspot – click to show invite code form */}
        <div
          className="center-hotspot"
          onClick={handleCenterClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              setShowForm(true)
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Click to enter invite code"
        >
          <span className="center-hint">Click to enter</span>
        </div>
      </div>

      {/* Invite code form overlay */}
      <div
        className={`form-overlay ${showForm ? "visible" : ""}`}
        onClick={handleOverlayBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-title"
        aria-hidden={!showForm}
      >
        <div className="form-container" onClick={(e) => e.stopPropagation()}>
          <h2 id="form-title">You&apos;re Invited</h2>
          <p>Please enter your invite code to access the wedding website.</p>
          <form onSubmit={handleSubmit} className="code-form">
            <Input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError("")
              }}
              placeholder="Enter invite code"
              className="code-input"
              autoFocus={showForm}
              disabled={isSubmitting}
              aria-label="Invite code"
            />
            {error && <p className="error-message">{error}</p>}
            <Button
              type="submit"
              disabled={isSubmitting || !code.trim()}
              className="w-full"
              style={{
                background: "var(--gold-leaf)",
                color: "var(--ink-main)",
                fontFamily: "var(--font-eb-garamond), serif",
                letterSpacing: "1px",
              }}
            >
              {isSubmitting ? "Verifying..." : "Access Website"}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
