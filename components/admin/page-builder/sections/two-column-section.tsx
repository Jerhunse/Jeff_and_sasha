"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TwoColumnSectionContent {
  leftContent: string
  rightContent: string
  imagePosition: "left" | "right"
  imageUrl?: string
}

interface TwoColumnSectionEditorProps {
  content: TwoColumnSectionContent
  onChange: (content: TwoColumnSectionContent) => void
}

export function TwoColumnSectionEditor({
  content,
  onChange,
}: TwoColumnSectionEditorProps) {
  const updateField = (field: keyof TwoColumnSectionContent, value: any) => {
    onChange({ ...content, [field]: value })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Two Column Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Image Position</Label>
            <Select
              value={content.imagePosition || "right"}
              onValueChange={(value) => updateField("imagePosition", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input
              value={content.imageUrl || ""}
              onChange={(e) => updateField("imageUrl", e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label>Left Column Content</Label>
            <Textarea
              value={content.leftContent || ""}
              onChange={(e) => updateField("leftContent", e.target.value)}
              placeholder="Content for left column..."
              rows={8}
            />
          </div>

          <div className="space-y-2">
            <Label>Right Column Content</Label>
            <Textarea
              value={content.rightContent || ""}
              onChange={(e) => updateField("rightContent", e.target.value)}
              placeholder="Content for right column..."
              rows={8}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {content.imagePosition === "left" ? (
              <>
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                  {content.imageUrl ? (
                    <img
                      src={content.imageUrl}
                      alt="Section image"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Image</p>
                  )}
                </div>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-sm">
                    {content.rightContent || "Right column content..."}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-sm">
                    {content.leftContent || "Left column content..."}
                  </p>
                </div>
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                  {content.imageUrl ? (
                    <img
                      src={content.imageUrl}
                      alt="Section image"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Image</p>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

