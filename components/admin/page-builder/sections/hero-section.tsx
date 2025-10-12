"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface HeroSectionContent {
  title: string
  subtitle: string
  backgroundImage: string
  showCountdown: boolean
}

interface HeroSectionEditorProps {
  content: HeroSectionContent
  onChange: (content: HeroSectionContent) => void
}

export function HeroSectionEditor({ content, onChange }: HeroSectionEditorProps) {
  const updateField = (field: keyof HeroSectionContent, value: any) => {
    onChange({ ...content, [field]: value })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Section Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero-title">Title</Label>
            <Input
              id="hero-title"
              value={content.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Welcome to Our Wedding"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero-subtitle">Subtitle</Label>
            <Textarea
              id="hero-subtitle"
              value={content.subtitle || ""}
              onChange={(e) => updateField("subtitle", e.target.value)}
              placeholder="Join us as we celebrate our love"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero-bg">Background Image URL</Label>
            <Input
              id="hero-bg"
              value={content.backgroundImage || ""}
              onChange={(e) => updateField("backgroundImage", e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-sm text-muted-foreground">
              Or use the media library to select an image
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hero-countdown"
              checked={content.showCountdown || false}
              onCheckedChange={(checked) => updateField("showCountdown", checked)}
            />
            <Label htmlFor="hero-countdown" className="cursor-pointer">
              Show countdown timer
            </Label>
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
            className="relative h-64 rounded-lg overflow-hidden flex items-center justify-center text-white"
            style={{
              backgroundImage: content.backgroundImage
                ? `url(${content.backgroundImage})`
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative text-center p-6">
              <h1 className="text-4xl font-serif font-bold mb-2">
                {content.title || "Your Title Here"}
              </h1>
              <p className="text-lg">
                {content.subtitle || "Your subtitle here"}
              </p>
              {content.showCountdown && (
                <div className="mt-4 text-sm">
                  [Countdown Timer]
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

