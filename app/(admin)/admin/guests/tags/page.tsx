"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Tag as TagIcon,
  Users,
} from "lucide-react"
import Link from "next/link"

interface TagData {
  id: string
  name: string
  color: string
  description: string | null
  _count?: { guests: number }
}

export default function ManageTagsPage() {
  const router = useRouter()
  const [tags, setTags] = useState<TagData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<TagData | null>(null)
  const [form, setForm] = useState({ name: "", color: "#6b9c7f", description: "" })

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/admin/tags")
      if (!response.ok) throw new Error("Failed to fetch tags")
      const data = await response.json()
      setTags(data.tags)
    } catch (err) {
      setError("Failed to load tags")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const openCreateDialog = () => {
    setEditingTag(null)
    setForm({ name: "", color: "#6b9c7f", description: "" })
    setDialogOpen(true)
  }

  const openEditDialog = (tag: TagData) => {
    setEditingTag(tag)
    setForm({ name: tag.name, color: tag.color, description: tag.description || "" })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) return

    setSaving(true)
    setError(null)
    try {
      const url = editingTag ? `/api/admin/tags?id=${editingTag.id}` : "/api/admin/tags"
      const method = editingTag ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save tag")
      }

      setDialogOpen(false)
      fetchTags()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (tagId: string) => {
    if (!confirm("Are you sure you want to delete this tag? It will be removed from all guests."))
      return

    try {
      const response = await fetch(`/api/admin/tags?id=${tagId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete tag")
      fetchTags()
    } catch (err) {
      setError("Failed to delete tag")
    }
  }

  const PRESET_COLORS = [
    "#6b9c7f", "#d4a574", "#e76f51", "#264653", "#2a9d8f",
    "#e9c46a", "#f4a261", "#8338ec", "#3a86a7", "#ef476f",
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/guests">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Guests
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold mb-2">Manage Tags</h1>
          <p className="text-muted-foreground">
            Organize your guests with tags for easy filtering and grouping
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Tag
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center py-12">
            <TagIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No tags yet</h3>
            <p className="text-muted-foreground mb-4">
              Create tags to organize your guests into groups
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Tag
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <Badge
                      variant="outline"
                      style={{ borderColor: tag.color, color: tag.color }}
                    >
                      {tag.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {tag.description || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {tag._count?.guests ?? 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(tag)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tag.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTag ? "Edit Tag" : "Create Tag"}</DialogTitle>
            <DialogDescription>
              {editingTag ? "Update the tag details" : "Create a new tag to organize your guests"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tagName">Name *</Label>
              <Input
                id="tagName"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Bride's Side, Family, College Friends"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagDescription">Description</Label>
              <Input
                id="tagDescription"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      form.color === color
                        ? "border-foreground scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setForm((f) => ({ ...f, color }))}
                  />
                ))}
                <Input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="w-8 h-8 p-0 border-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2">
              <p className="text-sm text-muted-foreground">Preview:</p>
              <Badge variant="outline" style={{ borderColor: form.color, color: form.color }}>
                {form.name || "Tag Name"}
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {editingTag ? "Save Changes" : "Create Tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
