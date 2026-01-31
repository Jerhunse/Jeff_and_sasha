"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

/** Layout from useImageLayout: rendered size and letterbox offsets in viewport px */
export interface ImageLayout {
  rw: number
  rh: number
  ox: number
  oy: number
}

export type ImageLayoutMode = "contain" | "cover"

/**
 * Computes rendered image size and letterbox/crop offsets so overlays can be positioned
 * in viewport pixels.
 * - contain: matches object-contain (full image visible, may letterbox). Height-limited on
 *   narrow viewports, width-limited on wide.
 * - cover: matches object-cover (image fills viewport, may crop). Same scale both axes;
 *   overlays stay aligned with the visible (possibly cropped) image.
 */
export function useImageLayout(
  imageWidth: number = 4352,
  imageHeight: number = 3904,
  mode: ImageLayoutMode = "contain"
): ImageLayout | null {
  const [layout, setLayout] = useState<ImageLayout | null>(null)
  const AR = imageWidth / imageHeight

  useEffect(() => {
    function compute() {
      const VW = window.innerWidth
      const VH = window.innerHeight

      let rw: number
      let rh: number
      if (mode === "cover") {
        const scale = Math.max(VW / imageWidth, VH / imageHeight)
        rw = imageWidth * scale
        rh = imageHeight * scale
      } else {
        if (VW / VH >= AR) {
          rh = VH
          rw = VH * AR
        } else {
          rw = VW
          rh = VW / AR
        }
      }

      setLayout({
        rw,
        rh,
        ox: (VW - rw) / 2,
        oy: (VH - rh) / 2,
      })
    }

    compute()
    window.addEventListener("resize", compute)
    return () => window.removeEventListener("resize", compute)
  }, [AR, mode, imageWidth, imageHeight])

  return layout
}

/**
 * Converts a rect in image-native pixels to viewport-pixel style (left, top, width, height).
 * Use with useImageLayout and image dimensions so hotspots stay aligned with the displayed image.
 */
export function imageRectToViewportStyle(
  layout: ImageLayout,
  imageWidth: number,
  imageHeight: number,
  rect: { x: number; y: number; w: number; h: number }
): React.CSSProperties {
  const scaleX = layout.rw / imageWidth
  const scaleY = layout.rh / imageHeight
  return {
    position: "absolute",
    left: layout.ox + rect.x * scaleX,
    top: layout.oy + rect.y * scaleY,
    width: rect.w * scaleX,
    height: rect.h * scaleY,
  }
}

/**
 * Rect region: coords are percentages [left, top, right, bottom] (0–100).
 * left/top = top-left corner, right/bottom = bottom-right corner.
 */
export interface ImageMapRegion {
  id: string
  /** [left%, top%, right%, bottom%] — percentage of image dimensions */
  coords: [number, number, number, number]
  /** Shown on hover; optional. */
  label?: string
  /** Navigate to URL on click (use for links). */
  href?: string
  /** Run on click (use for in-page actions). If both href and onClick, onClick runs first. */
  onClick?: () => void
}

interface InteractiveImageProps {
  src: string
  alt: string
  /** Click-mapped regions; each defines a rect and optional label/href/onClick */
  regions: ImageMapRegion[]
  /** Next/Image fill class; default object-contain */
  objectFit?: "contain" | "cover" | "fill"
  /**
   * Image aspect ratio (width / height). When set with objectFit="contain", overlays are
   * positioned relative to the visible image area so they stay aligned (no letterbox offset).
   * Omit to use overlay % as container % (regions can be off if the image is letterboxed).
   */
  imageAspectRatio?: number
  /** Allow Next/Image optimization for this src (e.g. false for large local PNGs) */
  unoptimized?: boolean
  /** If the main image fails to load, show this instead (avoids black screen) */
  fallbackSrc?: string
  /** Show region outlines and labels for tuning coords (e.g. in dev) */
  debugRegions?: boolean
  className?: string
}

/**
 * Renders an image with click-mapped regions. Regions use percentage coordinates
 * so the map stays aligned on resize. Supports href (navigation) and onClick (actions).
 */
export function InteractiveImage({
  src,
  alt,
  regions,
  objectFit = "contain",
  imageAspectRatio,
  unoptimized = false,
  fallbackSrc,
  debugRegions = false,
  className = "",
}: InteractiveImageProps) {
  const [failed, setFailed] = useState(false)
  const effectiveSrc = failed && fallbackSrc ? fallbackSrc : src
  const isFallback = effectiveSrc !== src

  const useAspectWrapper =
    objectFit === "contain" && imageAspectRatio != null && imageAspectRatio > 0

  const imageNode = (
    <Image
      src={effectiveSrc}
      alt={alt}
      fill
      className={useAspectWrapper ? "object-cover" : `object-${objectFit}`}
      sizes="100vw"
      priority
      unoptimized={unoptimized || isFallback}
      draggable={false}
      onError={() => {
        if (fallbackSrc && !failed) setFailed(true)
      }}
    />
  )

  const overlayContent = (
    <>
      {regions.map((region) => {
        const [left, top, right, bottom] = region.coords
        const width = right - left
        const height = bottom - top

        const content = (
          <>
            {region.label && (
              <span
                className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity text-white text-sm font-medium text-center p-2 pointer-events-none"
                aria-hidden
              >
                {region.label}
              </span>
            )}
            {debugRegions && (
              <span
                className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-[10px] p-1 font-mono pointer-events-none"
                aria-hidden
              >
                {region.id} [{left.toFixed(0)},{top.toFixed(0)},{right.toFixed(0)},{bottom.toFixed(0)}]
              </span>
            )}
          </>
        )

        const common = {
          className:
            "absolute cursor-pointer border border-transparent hover:border-white/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" +
            (debugRegions ? " border-red-500 border-2 bg-red-500/10" : ""),
          style: {
            left: `${left}%`,
            top: `${top}%`,
            width: `${width}%`,
            height: `${height}%`,
          },
          "aria-label": region.label || region.id,
        }

        if (region.href) {
          return (
            <a
              key={region.id}
              href={region.href}
              {...common}
              onClick={(e) => {
                if (region.onClick) {
                  e.preventDefault()
                  region.onClick()
                }
              }}
            >
              {content}
            </a>
          )
        }

        return (
          <button
            key={region.id}
            type="button"
            {...common}
            onClick={region.onClick}
          >
            {content}
          </button>
        )
      })}
    </>
  )

  if (useAspectWrapper) {
    const isLandscape = imageAspectRatio >= 1
    const aspectBoxStyle: React.CSSProperties = {
      aspectRatio: String(imageAspectRatio),
      ...(isLandscape
        ? { width: "100%", height: "auto", maxHeight: "100%" }
        : { height: "100%", width: "auto", maxWidth: "100%" }),
    }
    return (
      <div
        className={`relative size-full min-h-screen overflow-hidden flex items-center justify-center ${className}`}
      >
        <div className="relative shrink-0" style={aspectBoxStyle}>
          {imageNode}
          {overlayContent}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative size-full min-h-screen overflow-hidden ${className}`}>
      {imageNode}
      {overlayContent}
    </div>
  )
}
