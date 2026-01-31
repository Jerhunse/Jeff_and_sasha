"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Lock, AlertCircle } from "lucide-react"

const VALID_CODE = "sj2026"

interface RsvpCodeGateProps {
  isOpen: boolean
  onClose: () => void
  weddingSlug: string
}

/**
 * Code gate dialog that prompts users to enter "sj2026" before accessing the RSVP form.
 * Case-insensitive validation.
 */
export function RsvpCodeGate({ isOpen, onClose, weddingSlug }: RsvpCodeGateProps) {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedCode = code.trim().toLowerCase()

    if (!trimmedCode) {
      setError("Please enter the access code")
      return
    }

    if (trimmedCode !== VALID_CODE.toLowerCase()) {
      setError("Invalid access code. Please try again.")
      return
    }

    // Valid code - navigate to RSVP form
    router.push(`/rsvp/${weddingSlug}`)
  }

  const handleClose = () => {
    setCode("")
    setError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-4 mx-auto">
            <Lock className="h-6 w-6 text-gold" />
          </div>
          <DialogTitle className="text-center text-2xl font-cursive">
            Enter Access Code
          </DialogTitle>
          <DialogDescription className="text-center">
            Please enter your invitation code to continue
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="code">Access Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="Enter code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError("")
              }}
              className="text-center text-lg tracking-wider uppercase"
              autoFocus
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Continue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
