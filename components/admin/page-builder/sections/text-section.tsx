"use client"

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

interface TextSectionContent {
  content: string
  alignment: "left" | "center" | "right"
}

interface TextSectionEditorProps {
  content: TextSectionContent
  onChange: (content: TextSectionContent) => void
}

export function TextSectionEditor({ content, onChange }: TextSectionEditorProps) {
  const updateField = (field: keyof TextSectionContent, value: any) => {
    onChange({ ...content, [field]: value })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Text Block Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-content">Content</Label>
            <Textarea
              id="text-content"
              value={content.content || ""}
              onChange={(e) => updateField("content", e.target.value)}
              placeholder="Enter your text content here..."
              rows={10}
            />
            <p className="text-sm text-muted-foreground">
              Supports Markdown formatting
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text-alignment">Text Alignment</Label>
            <Select
              value={content.alignment || "left"}
              onValueChange={(value) => updateField("alignment", value)}
            >
              <SelectTrigger id="text-alignment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
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
            className="prose max-w-none"
            style={{ textAlign: content.alignment || "left" }}
          >
            <p className="whitespace-pre-wrap">
              {content.content || "Your text content will appear here..."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

