"use client"

import { useState } from "react"
import Image from "next/image"
import { useImageLayout, imageRectToViewportStyle } from "@/components/ui/interactive-image"

const SPLASH_IMAGE = "/Gemini_Generated_Image_x4mqmsx4mqmsx4mq-Firefly-Upscaler-2x-scale.png"

/** Native dimensions of the splash image (4352×3904). */
const IMAGE_WIDTH = 4352
const IMAGE_HEIGHT = 3904

/**
 * Hotspot boxes in IMAGE SPACE (image-native pixels, 4352×3904).
 * Define once; converted to viewport coordinates at runtime.
 */
const HOTSPOTS = {
  center: { x: 1560, y: 920, w: 1240, h: 2040 },
  left: { x: 330, y: 1700, w: 1220, h: 1320 },
  rsvp: { x: 2640, y: 3000, w: 1300, h: 820 },
  envelope: { x: 2600, y: 300, w: 1500, h: 820 },
  details: { x: 2620, y: 1350, w: 1300, h: 780 },
}

/** Maps internal hotspot id to InvitationSplashRegionLinks key */
const HOTSPOT_TO_REGION = {
  center: "centerPage",
  left: "leftPage",
  rsvp: "rsvpCard",
  envelope: "envelope",
  details: "detailsCard",
} as const

type HotspotId = keyof typeof HOTSPOTS

export type InvitationRegionId = "envelope" | "detailsCard" | "centerPage" | "leftPage" | "rsvpCard"

export interface InvitationSplashRegionLinks {
  envelope?: string | (() => void)
  detailsCard?: string | (() => void)
  centerPage?: string | (() => void)
  leftPage?: string | (() => void)
  rsvpCard?: string | (() => void)
}

interface InvitationSplashProps {
  /** Override image URL; defaults to the Gemini invitation image */
  imageUrl?: string
  /**
   * Links or actions per region. String = href, function = onClick.
   * Omit or leave empty for placeholder (no navigation yet).
   */
  regionLinks?: InvitationSplashRegionLinks
  /** Show hotspot outlines for tuning alignment (debug overlay). */
  debugRegions?: boolean
}

/**
 * Splash page: invitation image fills viewport (object-cover) with clickable
 * regions positioned from image-native pixel coords. Layout is computed at
 * runtime so hotspots stay aligned on any viewport.
 */
export function InvitationSplash({
  imageUrl = SPLASH_IMAGE,
  regionLinks,
  debugRegions = false,
}: InvitationSplashProps) {
  const [failed, setFailed] = useState(false)
  const effectiveSrc = failed ? SPLASH_IMAGE : imageUrl
  const layout = useImageLayout(IMAGE_WIDTH, IMAGE_HEIGHT, "cover")

  if (!layout) {
    // Show image while layout computes (first frame)
    return (
      <div className="relative h-screen min-h-dvh w-full overflow-hidden bg-background">
        <img
          src={effectiveSrc}
          alt="Wedding invitation"
          className="absolute inset-0 w-full h-full object-cover object-center"
          draggable={false}
          onError={() => setFailed(true)}
        />
      </div>
    )
  }

  function styleFor(id: HotspotId): React.CSSProperties {
    return imageRectToViewportStyle(layout, IMAGE_WIDTH, IMAGE_HEIGHT, HOTSPOTS[id])
  }

  return (
    <div className="relative h-screen min-h-dvh w-full overflow-hidden bg-background">
      {/* Image fills viewport with object-cover (may crop edges) */}
      <img
        src={effectiveSrc}
        alt="Wedding invitation"
        className="absolute inset-0 w-full h-full object-cover object-center"
        draggable={false}
        onError={() => setFailed(true)}
      />

      {/* Hotspot overlay: pointer-events-none on container, pointer-events-auto on each hotspot */}
      <div className="absolute inset-0 pointer-events-none">
        {(Object.keys(HOTSPOTS) as HotspotId[]).map((id) => {
          const regionId = HOTSPOT_TO_REGION[id]
          const link = regionLinks?.[regionId]
          const href = typeof link === "string" ? link : undefined
          const onClick = typeof link === "function" ? link : undefined

          const common = {
            className: [
              "hotspot pointer-events-auto cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              debugRegions ? "hotspot-debug" : "",
            ]
              .filter(Boolean)
              .join(" "),
            style: styleFor(id),
            "aria-label": regionId,
          }

          if (href) {
            return (
              <a
                key={id}
                href={href}
                {...common}
                onClick={(e) => {
                  if (onClick) {
                    e.preventDefault()
                    onClick()
                  }
                }}
              />
            )
          }

          return (
            <button
              key={id}
              type="button"
              {...common}
              onClick={onClick ?? (() => {})}
            />
          )
        })}
      </div>
    </div>
  )
}
