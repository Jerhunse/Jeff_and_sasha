"use client"

import { useState, useEffect } from "react"
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react"

interface MediaItem {
  id: string
  name: string
  mimeType: string
  kind: "image" | "video"
  url: string
  thumbnail?: string
}

interface MediaLightboxProps {
  item: MediaItem | null
  items: MediaItem[]
  onClose: () => void
}

export function MediaLightbox({ item, items, onClose }: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (item) {
      const index = items.findIndex((i) => i.id === item.id)
      setCurrentIndex(index !== -1 ? index : 0)
    }
  }, [item, items])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!item) return

      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowLeft") {
        handlePrevious()
      } else if (e.key === "ArrowRight") {
        handleNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [item, currentIndex, items])

  if (!item) return null

  const currentItem = items[currentIndex] || item

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleDownload = () => {
    if (currentItem.url) {
      window.open(currentItem.url, "_blank")
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation arrows */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handlePrevious()
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {currentIndex < items.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleNext()
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Content */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-7xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-4 px-2">
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm md:text-base truncate">
              {currentItem.name}
            </p>
            <p className="text-white/60 text-xs md:text-sm">
              {currentIndex + 1} of {items.length}
            </p>
          </div>
          {currentItem.url && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Download</span>
            </button>
          )}
        </div>

        {/* Media content */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          {currentItem.kind === "image" ? (
            <img
              src={currentItem.url}
              alt={currentItem.name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          ) : (
            <video
              controls
              autoPlay
              className="max-w-full max-h-full rounded-lg"
              src={currentItem.url}
            >
              <source src={currentItem.url} type={currentItem.mimeType} />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    </div>
  )
}
