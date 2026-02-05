"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tag, Plus, X, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface TagData {
  id: string
  name: string
  color: string
  description: string | null
}

interface GuestTagData {
  id: string
  tag: TagData
}

interface GuestTagManagerProps {
  guestId: string
  currentTags: GuestTagData[]
}

export function GuestTagManager({ guestId, currentTags }: GuestTagManagerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [allTags, setAllTags] = useState<TagData[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchAllTags()
    }
  }, [open])

  const fetchAllTags = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/tags")
      if (!response.ok) throw new Error("Failed to fetch tags")
      const data = await response.json()
      setAllTags(data.tags)
    } catch (err) {
      setError("Failed to load tags")
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = async (tagId: string) => {
    setActionLoading(tagId)
    setError(null)
    try {
      const response = await fetch(`/api/admin/guests/${guestId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add tag")
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemoveTag = async (tagId: string) => {
    setActionLoading(tagId)
    setError(null)
    try {
      const response = await fetch(`/api/admin/guests/${guestId}/tags?tagId=${tagId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to remove tag")
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const currentTagIds = new Set(currentTags.map((t) => t.tag.id))
  const availableTags = allTags.filter((t) => !currentTagIds.has(t.id))

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {currentTags.length === 0 ? (
          <span className="text-sm text-muted-foreground">No tags assigned</span>
        ) : (
          currentTags.map((guestTag) => (
            <Badge
              key={guestTag.id}
              variant="outline"
              style={{
                borderColor: guestTag.tag.color,
                color: guestTag.tag.color,
              }}
              className="flex items-center gap-1 pr-1"
            >
              {guestTag.tag.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveTag(guestTag.tag.id)}
                disabled={actionLoading === guestTag.tag.id}
              >
                {actionLoading === guestTag.tag.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </Button>
            </Badge>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-3 w-3 mr-1" />
            Add Tag
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tags</DialogTitle>
            <DialogDescription>
              Select tags to assign to this guest
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : availableTags.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                {allTags.length === 0
                  ? "No tags available. Create tags first."
                  : "All available tags have been assigned."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: tag.color,
                        color: tag.color,
                      }}
                    >
                      {tag.name}
                    </Badge>
                    {tag.description && (
                      <span className="text-sm text-muted-foreground">
                        {tag.description}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddTag(tag.id)}
                    disabled={actionLoading === tag.id}
                  >
                    {actionLoading === tag.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
