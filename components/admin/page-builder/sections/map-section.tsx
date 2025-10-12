"use client"

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
import { MapPin } from "lucide-react"

interface MapSectionContent {
  location: string
  zoom: number
  showDirections: boolean
}

interface MapSectionEditorProps {
  content: MapSectionContent
  onChange: (content: MapSectionContent) => void
}

export function MapSectionEditor({ content, onChange }: MapSectionEditorProps) {
  const updateField = (field: keyof MapSectionContent, value: any) => {
    onChange({ ...content, [field]: value })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Map Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="map-location">Location</Label>
            <Input
              id="map-location"
              value={content.location || ""}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="Enter address or coordinates"
            />
            <p className="text-sm text-muted-foreground">
              Full address or "latitude,longitude"
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="map-zoom">Zoom Level</Label>
            <Select
              value={String(content.zoom || 15)}
              onValueChange={(value) => updateField("zoom", Number(value))}
            >
              <SelectTrigger id="map-zoom">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 - City</SelectItem>
                <SelectItem value="14">14 - Neighborhood</SelectItem>
                <SelectItem value="15">15 - Street (Default)</SelectItem>
                <SelectItem value="17">17 - Building</SelectItem>
                <SelectItem value="19">19 - Close Up</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="map-directions"
              checked={content.showDirections || false}
              onCheckedChange={(checked) => updateField("showDirections", checked)}
            />
            <Label htmlFor="map-directions" className="cursor-pointer">
              Show "Get Directions" button
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
          <div className="aspect-video rounded-lg border bg-muted flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {content.location || "Map will display here"}
              </p>
              {content.showDirections && (
                <p className="text-xs text-muted-foreground mt-2">
                  [Get Directions Button]
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

