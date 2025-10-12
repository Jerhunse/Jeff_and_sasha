"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Send, Save, Eye } from "lucide-react"
import { SegmentBuilder } from "./segment-builder"

interface MessageComposerProps {
  messageId?: string
  initialData?: any
}

export function MessageComposer({ messageId, initialData }: MessageComposerProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [subject, setSubject] = useState(initialData?.subject || "")
  const [bodyHTML, setBodyHTML] = useState(initialData?.bodyHTML || "")
  const [segment, setSegment] = useState(
    initialData?.segmentJSON ? JSON.parse(initialData.segmentJSON) : {}
  )
  const [scheduledAt, setScheduledAt] = useState("")

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    if (!subject || !bodyHTML) {
      setError("Subject and message body are required")
      setIsSaving(false)
      return
    }

    try {
      const url = messageId ? `/api/admin/messages/${messageId}` : "/api/admin/messages"
      const method = messageId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          bodyHTML,
          segmentJSON: segment,
          scheduledAt: scheduledAt || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save message")
      }

      router.push("/admin/messages")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSend = async () => {
    if (!confirm("Are you sure you want to send this message now?")) return

    setIsSending(true)
    setError(null)

    try {
      // Save first if new
      if (!messageId) {
        const saveResponse = await fetch("/api/admin/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject,
            bodyHTML,
            segmentJSON: segment,
          }),
        })

        if (!saveResponse.ok) throw new Error("Failed to save message")

        const { message } = await saveResponse.json()
        
        // Send the newly created message
        const sendResponse = await fetch(`/api/admin/messages/${message.id}/send`, {
          method: "POST",
        })

        if (!sendResponse.ok) {
          const data = await sendResponse.json()
          throw new Error(data.error || "Failed to send message")
        }

        const sendData = await sendResponse.json()
        alert(sendData.message)
        router.push("/admin/messages")
      } else {
        // Send existing message
        const response = await fetch(`/api/admin/messages/${messageId}/send`, {
          method: "POST",
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to send message")
        }

        const data = await response.json()
        alert(data.message)
        router.push("/admin/messages")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {messageId ? "Edit Message" : "Compose Message"}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/messages")}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Draft
          </Button>
          <Button onClick={handleSend} disabled={isSending || isSaving}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Now
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

      <Tabs defaultValue="compose">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="segment">Recipients</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Important update about our wedding"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Message Body</Label>
                <Textarea
                  id="body"
                  value={bodyHTML}
                  onChange={(e) => setBodyHTML(e.target.value)}
                  placeholder="Dear {{firstName}}..."
                  rows={15}
                />
                <p className="text-sm text-muted-foreground">
                  Available variables: {"{"}
                  {"{"}firstName{"}"}
                  {"}"}, {"{"}
                  {"{"}lastName{"}"}
                  {"}"}, {"{"}
                  {"{"}rsvpLink{"}"}
                  {"}"}, {"{"}
                  {"{"}websiteLink{"}"}
                  {"}"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Schedule for Later (Optional)</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segment">
          <SegmentBuilder segment={segment} onChange={setSegment} />
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-white">
                <h3 className="text-xl font-bold mb-4">{subject || "Subject"}</h3>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">
                    {bodyHTML
                      .replace(/\{\{firstName\}\}/g, "John")
                      .replace(/\{\{lastName\}\}/g, "Doe")
                      .replace(/\{\{rsvpLink\}\}/g, "[RSVP Link]")
                      .replace(/\{\{websiteLink\}\}/g, "[Website Link]") ||
                      "Message body will appear here"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

