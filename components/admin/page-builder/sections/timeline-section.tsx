"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Clock } from "lucide-react"

interface TimelineEvent {
  time: string
  title: string
  description: string
}

interface TimelineSectionContent {
  events: TimelineEvent[]
}

interface TimelineSectionEditorProps {
  content: TimelineSectionContent
  onChange: (content: TimelineSectionContent) => void
}

export function TimelineSectionEditor({
  content,
  onChange,
}: TimelineSectionEditorProps) {
  const addEvent = () => {
    onChange({
      ...content,
      events: [
        ...(content.events || []),
        { time: "", title: "", description: "" },
      ],
    })
  }

  const removeEvent = (index: number) => {
    onChange({
      ...content,
      events: content.events.filter((_, i) => i !== index),
    })
  }

  const updateEvent = (
    index: number,
    field: "time" | "title" | "description",
    value: string
  ) => {
    const updated = [...content.events]
    updated[index] = { ...updated[index], [field]: value }
    onChange({ ...content, events: updated })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Timeline Settings</CardTitle>
            <Button onClick={addEvent} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.events?.map((event, index) => (
            <Card key={index}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label>Time</Label>
                      <Input
                        value={event.time}
                        onChange={(e) => updateEvent(index, "time", e.target.value)}
                        placeholder="3:00 PM"
                      />
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={event.title}
                        onChange={(e) => updateEvent(index, "title", e.target.value)}
                        placeholder="Ceremony"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={event.description}
                        onChange={(e) =>
                          updateEvent(index, "description", e.target.value)
                        }
                        placeholder="Join us for the ceremony..."
                        rows={2}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEvent(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!content.events || content.events.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No timeline events yet. Click "Add Event" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content.events?.map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  {index < content.events.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <p className="text-sm text-muted-foreground mb-1">
                    {event.time || "Time"}
                  </p>
                  <h3 className="font-semibold mb-1">
                    {event.title || "Event Title"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {event.description || "Event description"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

