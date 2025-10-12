"use client"

import { useState, useEffect } from "react"
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
import { Badge } from "@/components/ui/badge"

interface SegmentBuilderProps {
  segment: any
  onChange: (segment: any) => void
}

export function SegmentBuilder({ segment, onChange }: SegmentBuilderProps) {
  const [tags, setTags] = useState<any[]>([])

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      // This would call your tags API
      // For now, placeholder
      setTags([])
    } catch (error) {
      console.error("Fetch tags error:", error)
    }
  }

  const updateField = (field: string, value: any) => {
    onChange({ ...segment, [field]: value })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Target Audience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>RSVP Status</Label>
          <Select
            value={segment.rsvpStatus || "all"}
            onValueChange={(value) =>
              updateField("rsvpStatus", value === "all" ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Guests</SelectItem>
              <SelectItem value="PENDING">Pending RSVPs</SelectItem>
              <SelectItem value="YES">Attending</SelectItem>
              <SelectItem value="NO">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            checked={segment.hasEmail !== false}
            onCheckedChange={(checked) => updateField("hasEmail", checked)}
          />
          <Label className="cursor-pointer">
            Only guests with email addresses
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}
