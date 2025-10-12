"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, Eye, RefreshCw } from "lucide-react"

interface ThemeEditorProps {
  coupleId: string
}

const googleFonts = [
  { name: "Playfair Display", family: "serif" },
  { name: "Merriweather", family: "serif" },
  { name: "Cormorant Garamond", family: "serif" },
  { name: "Lora", family: "serif" },
  { name: "Inter", family: "sans-serif" },
  { name: "Montserrat", family: "sans-serif" },
  { name: "Open Sans", family: "sans-serif" },
  { name: "Roboto", family: "sans-serif" },
  { name: "Raleway", family: "sans-serif" },
]

const themePresets = [
  {
    name: "Romantic Rose",
    primaryColor: "#d4a5a5",
    secondaryColor: "#f5e6e8",
    accentColor: "#9d6b6b",
  },
  {
    name: "Forest Green",
    primaryColor: "#6b9c7f",
    secondaryColor: "#f5f5f0",
    accentColor: "#d4a574",
  },
  {
    name: "Navy & Gold",
    primaryColor: "#2c3e50",
    secondaryColor: "#ecf0f1",
    accentColor: "#f39c12",
  },
  {
    name: "Lavender Dream",
    primaryColor: "#9b7fb5",
    secondaryColor: "#f8f5fa",
    accentColor: "#d4a5d4",
  },
  {
    name: "Sunset",
    primaryColor: "#e74c3c",
    secondaryColor: "#fef5e7",
    accentColor: "#f39c12",
  },
]

export function ThemeEditor({ coupleId }: ThemeEditorProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [theme, setTheme] = useState({
    primaryColor: "#6b9c7f",
    secondaryColor: "#f5f5f0",
    accentColor: "#d4a574",
    fontHeading: "Playfair Display",
    fontBody: "Inter",
    cornerRadius: "medium",
    showFlorals: true,
    heroImageUrl: "",
    logoImageUrl: "",
  })

  useEffect(() => {
    fetchTheme()
  }, [])

  const fetchTheme = async () => {
    try {
      const response = await fetch("/api/admin/settings/theme")
      if (!response.ok) throw new Error("Failed to fetch theme")

      const data = await response.json()
      setTheme(data.theme)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/settings/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save theme")
      }

      // Refresh page to apply theme
      window.location.reload()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const applyPreset = (preset: typeof themePresets[0]) => {
    setTheme({
      ...theme,
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      accentColor: preset.accentColor,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Theme Settings</h1>
          <p className="text-muted-foreground">
            Customize colors, fonts, and visual style
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTheme}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Theme
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Presets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {themePresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="p-3 border-2 rounded-lg hover:border-primary transition-all text-left"
                  >
                    <div className="flex gap-1 mb-2">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.primaryColor }}
                      />
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.secondaryColor }}
                      />
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.accentColor }}
                      />
                    </div>
                    <p className="text-sm font-medium">{preset.name}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) =>
                      setTheme({ ...theme, primaryColor: e.target.value })
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    value={theme.primaryColor}
                    onChange={(e) =>
                      setTheme({ ...theme, primaryColor: e.target.value })
                    }
                    placeholder="#6b9c7f"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Used for buttons, links, and accents
                </p>
              </div>

              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={theme.secondaryColor}
                    onChange={(e) =>
                      setTheme({ ...theme, secondaryColor: e.target.value })
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    value={theme.secondaryColor}
                    onChange={(e) =>
                      setTheme({ ...theme, secondaryColor: e.target.value })
                    }
                    placeholder="#f5f5f0"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Used for backgrounds and subtle elements
                </p>
              </div>

              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) =>
                      setTheme({ ...theme, accentColor: e.target.value })
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    value={theme.accentColor}
                    onChange={(e) =>
                      setTheme({ ...theme, accentColor: e.target.value })
                    }
                    placeholder="#d4a574"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Used for highlights and special elements
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Font Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Heading Font</Label>
                <Select
                  value={theme.fontHeading}
                  onValueChange={(value) =>
                    setTheme({ ...theme, fontHeading: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {googleFonts
                      .filter((f) => f.family === "serif")
                      .map((font) => (
                        <SelectItem key={font.name} value={font.name}>
                          <span style={{ fontFamily: font.name }}>
                            {font.name}
                          </span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Used for titles and headings
                </p>
              </div>

              <div className="space-y-2">
                <Label>Body Font</Label>
                <Select
                  value={theme.fontBody}
                  onValueChange={(value) =>
                    setTheme({ ...theme, fontBody: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {googleFonts
                      .filter((f) => f.family === "sans-serif")
                      .map((font) => (
                        <SelectItem key={font.name} value={font.name}>
                          <span style={{ fontFamily: font.name }}>
                            {font.name}
                          </span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Used for body text and paragraphs
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visual Style</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Corner Radius</Label>
                <Select
                  value={theme.cornerRadius}
                  onValueChange={(value) =>
                    setTheme({ ...theme, cornerRadius: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Square)</SelectItem>
                    <SelectItem value="small">Small (4px)</SelectItem>
                    <SelectItem value="medium">Medium (8px)</SelectItem>
                    <SelectItem value="large">Large (16px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-florals"
                  checked={theme.showFlorals}
                  onCheckedChange={(checked) =>
                    setTheme({ ...theme, showFlorals: checked as boolean })
                  }
                />
                <Label htmlFor="show-florals" className="cursor-pointer">
                  Show floral decorative elements
                </Label>
              </div>

              <div className="space-y-2">
                <Label>Hero Image URL</Label>
                <Input
                  value={theme.heroImageUrl || ""}
                  onChange={(e) =>
                    setTheme({ ...theme, heroImageUrl: e.target.value })
                  }
                  placeholder="https://example.com/hero.jpg"
                />
                <p className="text-sm text-muted-foreground">
                  Background image for hero sections
                </p>
              </div>

              <div className="space-y-2">
                <Label>Logo Image URL</Label>
                <Input
                  value={theme.logoImageUrl || ""}
                  onChange={(e) =>
                    setTheme({ ...theme, logoImageUrl: e.target.value })
                  }
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-sm text-muted-foreground">
                  Your monogram or logo
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Hero Preview */}
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  borderRadius:
                    theme.cornerRadius === "none"
                      ? "0"
                      : theme.cornerRadius === "small"
                      ? "4px"
                      : theme.cornerRadius === "large"
                      ? "16px"
                      : "8px",
                }}
              >
                <div
                  className="h-48 flex items-center justify-center text-white relative"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.accentColor} 100%)`,
                  }}
                >
                  <div className="relative z-10 text-center">
                    <h1
                      className="text-4xl font-bold mb-2"
                      style={{ fontFamily: theme.fontHeading }}
                    >
                      Your Names
                    </h1>
                    <p
                      className="text-lg"
                      style={{ fontFamily: theme.fontBody }}
                    >
                      Preview Text
                    </p>
                  </div>
                </div>
              </div>

              {/* Button Preview */}
              <div className="flex gap-3">
                <button
                  className="px-6 py-3 text-white font-medium"
                  style={{
                    backgroundColor: theme.primaryColor,
                    borderRadius:
                      theme.cornerRadius === "none"
                        ? "0"
                        : theme.cornerRadius === "small"
                        ? "4px"
                        : theme.cornerRadius === "large"
                        ? "16px"
                        : "8px",
                    fontFamily: theme.fontBody,
                  }}
                >
                  Primary Button
                </button>
                <button
                  className="px-6 py-3 font-medium"
                  style={{
                    backgroundColor: theme.secondaryColor,
                    color: theme.primaryColor,
                    borderRadius:
                      theme.cornerRadius === "none"
                        ? "0"
                        : theme.cornerRadius === "small"
                        ? "4px"
                        : theme.cornerRadius === "large"
                        ? "16px"
                        : "8px",
                    fontFamily: theme.fontBody,
                  }}
                >
                  Secondary Button
                </button>
              </div>

              {/* Text Preview */}
              <div className="p-6 rounded-lg" style={{ backgroundColor: theme.secondaryColor }}>
                <h2
                  className="text-2xl font-bold mb-4"
                  style={{ fontFamily: theme.fontHeading, color: theme.primaryColor }}
                >
                  Sample Heading
                </h2>
                <p
                  className="mb-3"
                  style={{ fontFamily: theme.fontBody }}
                >
                  This is how body text will appear on your wedding website. The
                  font should be easy to read and complement the heading style.
                </p>
                <a
                  href="#"
                  className="font-medium"
                  style={{ color: theme.accentColor }}
                >
                  Sample Link →
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

