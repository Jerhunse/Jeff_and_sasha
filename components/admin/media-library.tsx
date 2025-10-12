"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Tag,
  Search,
  Loader2,
  X,
} from "lucide-react"

interface Media {
  id: string
  url: string
  thumbnailUrl?: string
  filename: string
  mimeType: string
  size: number
  width?: number
  height?: number
  alt?: string
  caption?: string
  tags: string[]
  createdAt: Date
}

interface MediaLibraryProps {
  onSelect?: (media: Media) => void
  selectionMode?: boolean
}

export function MediaLibrary({ onSelect, selectionMode = false }: MediaLibraryProps) {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])

  const fetchMedia = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (selectedTag) params.append("tag", selectedTag)
      if (searchQuery) params.append("search", searchQuery)

      const response = await fetch(`/api/admin/media?${params}`)
      if (!response.ok) throw new Error("Failed to fetch media")

      const data = await response.json()
      setMedia(data.media)

      // Extract all unique tags
      const tags = new Set<string>()
      data.media.forEach((m: Media) => {
        m.tags.forEach((t) => tags.add(t))
      })
      setAllTags(Array.from(tags).sort())
    } catch (error) {
      console.error("Fetch media error:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedTag, searchQuery])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      for (const file of Array.from(files)) {
        // Upload file
        const formData = new FormData()
        formData.append("file", file)

        const uploadResponse = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const uploadData = await uploadResponse.json()

        // Create media record
        const createResponse = await fetch("/api/admin/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(uploadData),
        })

        if (!createResponse.ok) {
          throw new Error(`Failed to create media record for ${file.name}`)
        }
      }

      // Refresh media list
      await fetchMedia()
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload one or more files")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (mediaId: string) => {
    if (!confirm("Are you sure you want to delete this media?")) return

    try {
      const response = await fetch(`/api/admin/media/${mediaId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete media")

      setMedia(media.filter((m) => m.id !== mediaId))
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete media")
    }
  }

  const filteredMedia = media.filter((m) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        m.filename.toLowerCase().includes(query) ||
        m.caption?.toLowerCase().includes(query) ||
        m.alt?.toLowerCase().includes(query)
      )
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Media Library</h2>
          <p className="text-muted-foreground">
            {media.length} {media.length === 1 ? "file" : "files"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button disabled={uploading} asChild>
            <label className="cursor-pointer">
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search media..."
              className="pl-10"
            />
          </div>
          {allTags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  {tag}
                  {selectedTag === tag && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Media Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredMedia.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No media found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedTag
                ? "Try adjusting your filters"
                : "Upload your first image to get started"}
            </p>
            {!searchQuery && !selectedTag && (
              <Button asChild>
                <label className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                  />
                </label>
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <Card
              key={item.id}
              className={`group cursor-pointer overflow-hidden ${
                selectionMode ? "hover:ring-2 hover:ring-primary" : ""
              }`}
              onClick={() => selectionMode && onSelect?.(item)}
            >
              <div className="aspect-square relative bg-muted">
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.alt || item.filename}
                  className="w-full h-full object-cover"
                />
                {!selectionMode && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium truncate">{item.filename}</p>
                {item.caption && (
                  <p className="text-xs text-muted-foreground truncate">
                    {item.caption}
                  </p>
                )}
                {item.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {(item.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

