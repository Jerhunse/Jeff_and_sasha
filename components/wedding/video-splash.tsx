"use client"

import { useState, useEffect } from "react"
import { CountdownTimer } from "./countdown-timer"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, AlertCircle } from "lucide-react"

interface VideoSplashProps {
  /** Wedding slug for navigation */
  weddingSlug: string
  /** Wedding date for countdown timer */
  weddingDate: Date
  /** Couple names to display */
  partner1Name: string
  partner2Name: string
  /** Location / address to display */
  location?: string | null
  /** Optional video URL override */
  videoUrl?: string
  /** Optional poster image URL */
  posterUrl?: string
}

type FlowStage = "initial" | "code-prompt" | "action-choice"

const VALID_CODE = "sj2026"

/**
 * Splash page with full-screen video background, countdown timer, and code-gated entry
 */
export function VideoSplash({
  weddingSlug,
  weddingDate,
  partner1Name,
  partner2Name,
  location,
  videoUrl = "/videos/wedding-splash.mp4",
  posterUrl = "/background-main.png",
}: VideoSplashProps) {
  const router = useRouter()
  const [stage, setStage] = useState<FlowStage>("initial")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (code.toLowerCase() === VALID_CODE.toLowerCase()) {
      // Valid code - proceed to action choice
      sessionStorage.setItem("wedding_access_code", code)
      setError("")
      setStage("action-choice")
    } else {
      // Invalid code
      setError("You don't have access due to an incorrect code. Please try again.")
    }
  }

  const handleRsvpNow = () => {
    router.push(`/rsvp/${weddingSlug}/new`)
  }

  const handleAlreadyRsvpd = () => {
    router.push(`/${weddingSlug}`)
  }

  const handleCloseDialog = () => {
    setStage("initial")
    setCode("")
    setError("")
  }

  return (
    <>
      <style jsx global>{`
        body {
          overflow: hidden;
        }
      `}</style>
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black" style={{ zIndex: 9999 }}>
        {/* Video background - fills entire viewport */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 min-w-full min-h-full w-auto h-auto object-cover"
          style={{
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%',
          }}
          poster={posterUrl}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl.replace('.mp4', '.webm')} type="video/webm" />
        </video>

      {/* Vignette effect - faded border around all 4 sides */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 pointer-events-none">
        {/* Enter button */}
        <Button
          size="lg"
          onClick={() => setStage("code-prompt")}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 font-sans text-[10px] tracking-[0.2em] uppercase px-8 py-6 rounded-full transition-all shadow-lg pointer-events-auto"
        >
          Enter
        </Button>
      </div>

      {/* Code Entry Dialog */}
      <Dialog open={stage === "code-prompt"} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Access Code Required
            </DialogTitle>
            <DialogDescription>
              Please enter your invitation code to continue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Invitation Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter your code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  setError("")
                }}
                className="uppercase"
                autoFocus
              />
              {error && (
                <div className="flex items-start gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button type="submit">
                Continue
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Action Choice Dialog */}
      <Dialog open={stage === "action-choice"} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome!</DialogTitle>
            <DialogDescription>
              What would you like to do?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              size="lg"
              onClick={handleRsvpNow}
              className="w-full"
            >
              RSVP Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleAlreadyRsvpd}
              className="w-full"
            >
              Already RSVP'd
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  )
}
