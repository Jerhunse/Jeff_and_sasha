"use client"

import { useState } from "react"
import Image from "next/image"
import { RsvpLookupForm } from "@/app/(public)/rsvp/[code]/rsvp-lookup-form"

const DEFAULT_SPLASH_IMAGE = "/Gemini_Generated_Image_x4mqmsx4mqmsx4mq-Firefly-Upscaler-2x-scale.png"

interface SplashRsvpGateProps {
  /** Wedding slug for RSVP lookup (e.g. used in /rsvp/[slug]) */
  rsvpSlug: string
  /** Optional override for splash image; defaults to the invitation image */
  imageUrl?: string
}

/**
 * Landing gate: user sees only the full-screen splash image first.
 * Clicking the center of the image reveals the RSVP lookup form; they must
 * complete the RSVP flow (invite code or email → submit RSVP) before
 * getting access to the rest of the site (wedding_access cookie).
 */
export function SplashRsvpGate({ rsvpSlug, imageUrl = DEFAULT_SPLASH_IMAGE }: SplashRsvpGateProps) {
  const [showForm, setShowForm] = useState(false)

  const handleCenterClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const rect = target.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distX = Math.abs(e.clientX - centerX)
    const distY = Math.abs(e.clientY - centerY)
    // Consider "center" as middle 40% (within 20% of center each axis)
    const thresholdX = rect.width * 0.2
    const thresholdY = rect.height * 0.2
    if (distX <= thresholdX && distY <= thresholdY) {
      setShowForm(true)
    }
  }

  if (showForm) {
    return (
      <div className="min-h-screen min-h-dvh">
        <RsvpLookupForm slug={rsvpSlug} />
      </div>
    )
  }

  return (
    <div
      className="relative min-h-screen min-h-dvh w-full cursor-pointer overflow-hidden bg-black"
      onClick={handleCenterClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          setShowForm(true)
        }
      }}
      aria-label="Click the center of the invitation to continue"
    >
      <Image
        src={imageUrl}
        alt="Wedding invitation"
        fill
        className="object-contain"
        sizes="100vw"
        priority
        unoptimized={imageUrl.startsWith("/") && imageUrl.includes("Gemini")}
      />
      {/* Invisible center hotspot: middle 40% × 40% */}
      <div
        className="absolute left-1/2 top-1/2 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      />
    </div>
  )
}
