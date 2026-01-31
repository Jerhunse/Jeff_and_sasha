"use client"

import { useState, useMemo } from "react"
import { RsvpLookupForm } from "@/app/(public)/rsvp/[code]/rsvp-lookup-form"
import { InteractiveImage, type ImageMapRegion } from "@/components/ui/interactive-image"

const DEFAULT_SPLASH_IMAGE = "/Gemini_Generated_Image_x4mqmsx4mqmsx4mq-Firefly-Upscaler-2x-scale.png"

interface SplashRsvpGateProps {
  /** Wedding slug for RSVP lookup (e.g. used in /rsvp/[slug]) */
  rsvpSlug: string
  /** Optional override for splash image; defaults to the invitation image */
  imageUrl?: string
  /**
   * Optional custom click-mapped regions. If not provided, a default center
   * region "RSVP" (30–70%, 30–70%) is used. Coords: [left%, top%, right%, bottom%].
   */
  regions?: ImageMapRegion[]
}

/**
 * Landing gate: full-screen interactive image with click-mapped regions.
 * Default: center region opens the RSVP form; user must complete RSVP
 * before getting access (wedding_access cookie). Pass custom regions to
 * map multiple hotspots (e.g. RSVP, Schedule, Registry).
 */
export function SplashRsvpGate({ rsvpSlug, imageUrl = DEFAULT_SPLASH_IMAGE, regions: customRegions }: SplashRsvpGateProps) {
  const [showForm, setShowForm] = useState(false)

  const regions = useMemo((): ImageMapRegion[] => {
    if (customRegions?.length) return customRegions
    return [
      {
        id: "rsvp",
        coords: [30, 30, 70, 70],
        label: "Click to RSVP",
        onClick: () => setShowForm(true),
      },
    ]
  }, [customRegions])

  if (showForm) {
    return (
      <div className="min-h-screen min-h-dvh">
        <RsvpLookupForm slug={rsvpSlug} />
      </div>
    )
  }

  return (
    <div
      className="relative min-h-screen min-h-dvh w-full overflow-hidden bg-black"
      role="img"
      aria-label="Wedding invitation with clickable regions"
    >
      <InteractiveImage
        src={imageUrl}
        alt="Wedding invitation"
        regions={regions}
        objectFit="contain"
        unoptimized={imageUrl.startsWith("/") && imageUrl.includes("Gemini")}
        className="absolute inset-0"
      />
    </div>
  )
}
