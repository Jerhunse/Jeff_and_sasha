"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Image as ImageIcon } from "lucide-react"

interface GallerySectionContent {
  images: Array<{
    url: string
    caption?: string
    alt?: string
  }>
  columns: number
}

interface GallerySectionEditorProps {
  content: GallerySectionContent
  onChange: (content: GallerySectionContent) => void
}

export function GallerySectionEditor({
  content,
  onChange,
}: GallerySectionEditorProps) {
  const [newImageUrl, setNewImageUrl] = useState("")

  const addImage = () => {
    if (newImageUrl) {
      onChange({
        ...content,
        images: [
          ...(content.images || []),
          { url: newImageUrl, caption: "", alt: "" },
        ],
      })
      setNewImageUrl("")
    }
  }

  const removeImage = (index: number) => {
    onChange({
      ...content,
      images: content.images.filter((_, i) => i !== index),
    })
  }

  const updateImage = (
    index: number,
    field: "url" | "caption" | "alt",
    value: string
  ) => {
    const updated = [...content.images]
    updated[index] = { ...updated[index], [field]: value }
    onChange({ ...content, images: updated })
  }

  const updateColumns = (columns: number) => {
    onChange({ ...content, columns })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gallery Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Number of Columns</Label>
            <Select
              value={String(content.columns || 3)}
              onValueChange={(value) => updateColumns(Number(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Columns</SelectItem>
                <SelectItem value="3">3 Columns</SelectItem>
                <SelectItem value="4">4 Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Add Image</Label>
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Image URL or select from library"
              />
              <Button onClick={addImage} type="button">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Images ({content.images?.length || 0})</Label>
            {content.images?.map((image, index) => (
              <Card key={index}>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={image.url}
                        onChange={(e) => updateImage(index, "url", e.target.value)}
                        placeholder="Image URL"
                      />
                      <Input
                        value={image.caption || ""}
                        onChange={(e) =>
                          updateImage(index, "caption", e.target.value)
                        }
                        placeholder="Caption (optional)"
                      />
                      <Input
                        value={image.alt || ""}
                        onChange={(e) => updateImage(index, "alt", e.target.value)}
                        placeholder="Alt text (optional)"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${content.columns || 3}, 1fr)`,
            }}
          >
            {content.images && content.images.length > 0 ? (
              content.images.map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                  {image.url ? (
                    <img
                      src={image.url}
                      alt={image.alt || `Gallery image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No images added yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

