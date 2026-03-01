"use client"

import { useState, useEffect } from "react"
import { Plus, Loader2, Image as ImageIcon, Video, RefreshCw, Share2 } from "lucide-react"
import { MediaLightbox } from "@/components/gallery/media-lightbox"
import { UploadDialog } from "@/components/gallery/upload-dialog"
import { toast } from "sonner"

interface MediaItem {
  id: string
  name: string
  mimeType: string
  kind: "image" | "video"
  createdTime: string
  url: string
  thumbnail?: string
  size?: number
}

type FilterType = "all" | "photos" | "videos"

export default function GalleryPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [nextOffset, setNextOffset] = useState<number>(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filter, setFilter] = useState<FilterType>("all")
  const [hasMore, setHasMore] = useState(false)

  const loadGallery = async (append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const params = new URLSearchParams()
      params.set("limit", "60")
      if (append) {
        params.set("offset", nextOffset.toString())
      } else {
        params.set("offset", "0")
      }

      const response = await fetch(`/api/gallery?${params.toString()}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || error.error || "Failed to load gallery")
      }

      const data = await response.json()

      if (append) {
        setItems((prev) => [...prev, ...data.items])
        setNextOffset(items.length + data.items.length)
      } else {
        setItems(data.items)
        setNextOffset(data.items.length)
      }

      setHasMore(data.hasMore || false)
    } catch (error: any) {
      console.error("Gallery load error:", error)
      toast.error(error.message || "Failed to load gallery")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadGallery()
  }, [])

  const handleUploadComplete = () => {
    // Reload gallery from the beginning
    loadGallery(false)
    toast.success("Photos uploaded successfully!")
  }

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      loadGallery(true)
    }
  }

  const handleShare = async () => {
    const galleryUrl = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Wedding of Tati & Ray - Photo Gallery",
          text: "Check out photos from Tati & Ray's wedding!",
          url: galleryUrl,
        })
        toast.success("Gallery link shared!")
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Share error:", error)
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(galleryUrl)
        toast.success("Link copied to clipboard!")
      } catch (error) {
        toast.error("Failed to copy link")
      }
    }
  }

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true
    if (filter === "photos") return item.kind === "image"
    if (filter === "videos") return item.kind === "video"
    return true
  })

  return (
    <div className="bg-[#101f22]" style={{ minHeight: '100dvh' }}>
      {/* Mobile-optimized container */}
      <div className="relative flex flex-col max-w-[480px] mx-auto bg-[#101f22] shadow-2xl" style={{ minHeight: '100dvh' }}>
        {/* Header */}
        <header className="sticky top-0 z-50 w-full bg-[#101f22]/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center p-1.5 rounded-lg bg-[#13c8ec]/20 text-[#13c8ec]">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <h1 className="text-lg font-bold tracking-tight text-white">MerakiDen Media</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 text-white/60 hover:text-white active:scale-90 transition-all"
                aria-label="Share gallery"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => loadGallery(false)}
                disabled={loading}
                className="p-2 text-white/60 hover:text-white active:scale-90 transition-all disabled:opacity-50"
                aria-label="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 py-6">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-[#13c8ec] font-bold text-[10px] tracking-[0.1em] uppercase mb-1">
              <span>Private</span>
              <span className="h-1 w-1 rounded-full bg-[#13c8ec]/40" />
              <span>April 16, 2026</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">
              Wedding of Tati & Ray
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Celebrating our special day. All photos and videos shared by guests.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center justify-between mb-6 sticky top-[65px] z-40 bg-[#101f22] py-2">
            <div className="flex items-center p-1 bg-white/5 rounded-xl">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === "all"
                    ? "bg-[#13c8ec] text-[#101f22] shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("photos")}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === "photos"
                    ? "bg-[#13c8ec] text-[#101f22] shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Photos
              </button>
              <button
                onClick={() => setFilter("videos")}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === "videos"
                    ? "bg-[#13c8ec] text-[#101f22] shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Videos
              </button>
            </div>
            <div className="text-xs text-white/40 font-medium">
              {filteredItems.length} {filter === "all" ? "items" : filter}
            </div>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#13c8ec] animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <ImageIcon className="w-10 h-10 text-white/30" />
              </div>
              <p className="text-white/60 text-base font-medium mb-2">No photos yet</p>
              <p className="text-white/40 text-sm">
                Be the first to share your memories!
              </p>
            </div>
          ) : (
            <>
              {/* Masonry grid */}
              <div className="masonry-grid">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="masonry-item group relative rounded-2xl overflow-hidden bg-white/5 shadow-md hover:shadow-xl transition-all"
                  >
                    <div className="relative w-full">
                      {item.kind === "image" ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-auto object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="relative w-full aspect-video bg-white/5 flex items-center justify-center">
                          <Video className="w-12 h-12 text-white/40" />
                          <div className="absolute top-2 right-2">
                            <div className="p-1.5 rounded-full bg-black/40 backdrop-blur-md">
                              <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1" />
                            </div>
                          </div>
                          {item.thumbnail && (
                            <img
                              src={item.thumbnail}
                              alt={item.name}
                              className="absolute inset-0 w-full h-full object-cover -z-10"
                              loading="lazy"
                            />
                          )}
                        </div>
                      )}

                      {/* Overlay gradient */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-[11px] font-medium truncate">
                          {item.name}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Load more button */}
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>Load More</>
                    )}
                  </button>
                </div>
              )}

              {/* Footer */}
              <div className="mt-12 text-center pb-24 border-t border-white/10 pt-8">
                <p className="text-white/40 text-xs mb-4">
                  {filteredItems.length} {filter === "all" ? "items" : filter} total
                </p>
                <div className="flex justify-center gap-6 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  <span>© 2026 EventVault Gallery</span>
                </div>
              </div>
            </>
          )}
        </main>

        {/* Floating upload button */}
        <button
          onClick={() => setUploadDialogOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-[#13c8ec] rounded-full flex items-center justify-center text-[#101f22] shadow-2xl shadow-[#13c8ec]/40 active:scale-90 transition-transform z-40 hover:shadow-[#13c8ec]/60"
          aria-label="Upload photos"
        >
          <Plus className="w-8 h-8 font-bold" />
        </button>

        {/* Lightbox */}
        <MediaLightbox item={selectedItem} items={items} onClose={() => setSelectedItem(null)} />

        {/* Upload dialog */}
        <UploadDialog
          isOpen={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          onUploadComplete={handleUploadComplete}
        />
      </div>
    </div>
  )
}
