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
import { Tag, Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface TagData {
  id: string
  name: string
  color: string
  description: string | null
}

interface BulkTagManagerProps {
  guestIds: string[]
  onComplete?: () => void
}

export function BulkTagManager({ guestIds, onComplete }: BulkTagManagerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [allTags, setAllTags] = useState<TagData[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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
    setSuccess(null)
    
    try {
      let successCount = 0
      let failCount = 0

      // Add tag to each selected guest
      for (const guestId of guestIds) {
        try {
          const response = await fetch(`/api/admin/guests/${guestId}/tags`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tagId }),
          })

          if (response.ok) {
            successCount++
          } else {
            // If the error is that the tag is already assigned, don't count as failure
            const data = await response.json()
            if (data.error?.includes("already assigned")) {
              successCount++
            } else {
              failCount++
            }
          }
        } catch (err) {
          failCount++
        }
      }

      if (successCount > 0) {
        setSuccess(`Tag added to ${successCount} guest${successCount !== 1 ? 's' : ''}`)
        router.refresh()
        
        if (onComplete) {
          onComplete()
        }
        
        // Close dialog after a short delay
        setTimeout(() => {
          setOpen(false)
          setSuccess(null)
        }, 2000)
      }

      if (failCount > 0) {
        setError(`Failed to add tag to ${failCount} guest${failCount !== 1 ? 's' : ''}`)
      }
    } catch (err: any) {
      setError(err.message || "Failed to add tags")
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Tag className="h-4 w-4 mr-2" />
          Add Tag
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tag to {guestIds.length} Guests</DialogTitle>
          <DialogDescription>
            Select a tag to assign to all selected guests
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : allTags.length === 0 ? (
          <div className="text-center py-8">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No tags available. Create tags first.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {allTags.map((tag) => (
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

        {success && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
            {success}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
