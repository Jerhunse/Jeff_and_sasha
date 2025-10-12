"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, MessageSquare, AlertCircle } from "lucide-react"

interface SendInvitationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedGuestIds: string[]
  type: "SAVE_THE_DATE" | "INVITATION"
  onSuccess?: () => void
}

export function SendInvitationsDialog({
  open,
  onOpenChange,
  selectedGuestIds,
  type,
  onSuccess,
}: SendInvitationsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sendViaEmail, setSendViaEmail] = useState(true)
  const [sendViaSMS, setSendViaSMS] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const handleSend = async () => {
    setIsSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/admin/invitations/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestIds: selectedGuestIds,
          type,
          sendViaEmail,
          sendViaSMS,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invitations")
      }

      setResult(data)

      // Wait a moment to show success message
      setTimeout(() => {
        onSuccess?.()
        onOpenChange(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const title =
    type === "SAVE_THE_DATE" ? "Send Save the Date" : "Send Wedding Invitation"
  const description =
    type === "SAVE_THE_DATE"
      ? "Send Save the Date notifications to selected guests"
      : "Send formal wedding invitations to selected guests"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!result ? (
            <>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm font-medium mb-2">
                  {selectedGuestIds.length} guest
                  {selectedGuestIds.length !== 1 ? "s" : ""} selected
                </p>
                <p className="text-xs text-muted-foreground">
                  {type === "SAVE_THE_DATE"
                    ? "Save the Date notifications will be sent to guests with email addresses."
                    : "Formal invitations with RSVP links will be sent to guests with email addresses."}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendEmail"
                    checked={sendViaEmail}
                    onCheckedChange={(checked) =>
                      setSendViaEmail(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="sendEmail"
                    className="text-sm font-medium cursor-pointer flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Send via Email
                  </Label>
                </div>

                <div className="flex items-center space-x-2 opacity-50">
                  <Checkbox
                    id="sendSMS"
                    checked={sendViaSMS}
                    disabled
                    onCheckedChange={(checked) =>
                      setSendViaSMS(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="sendSMS"
                    className="text-sm font-medium cursor-pointer flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Send via SMS (Coming Soon)
                  </Label>
                </div>
              </div>

              {!sendViaEmail && !sendViaSMS && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Please select at least one delivery method.
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                <p className="font-medium text-green-800 dark:text-green-200 mb-2">
                  Invitations Sent Successfully!
                </p>
                <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
                  <p>✓ {result.results.success} sent successfully</p>
                  {result.results.failed > 0 && (
                    <p>✗ {result.results.failed} failed</p>
                  )}
                </div>
              </div>

              {result.results.errors.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Errors:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {result.results.errors.slice(0, 3).map((err: any, idx: number) => (
                      <li key={idx}>{err.error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {!result ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSubmitting || (!sendViaEmail && !sendViaSMS)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send {type === "SAVE_THE_DATE" ? "Save the Date" : "Invitations"}
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

