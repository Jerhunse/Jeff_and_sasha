"use client"

import { useState } from "react"
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
import { Lock, AlertCircle, Calendar, MapPin } from "lucide-react"

interface HeroCodeGateProps {
  partner1Name: string
  partner2Name: string
  weddingDate: Date
  location: string
  weddingSlug: string
  onAccessGranted: () => void
}

type DialogStage = "code-entry" | "rsvp-choice" | null

const VALID_CODE = "sj2026"

export function HeroCodeGate({
  partner1Name,
  partner2Name,
  weddingDate,
  location,
  weddingSlug,
  onAccessGranted,
}: HeroCodeGateProps) {
  const router = useRouter()
  const [dialogStage, setDialogStage] = useState<DialogStage>(null)
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  const formattedDate = new Date(weddingDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (code.toLowerCase() === VALID_CODE.toLowerCase()) {
      setError("")
      // Move to RSVP choice dialog
      setDialogStage("rsvp-choice")
    } else {
      setError("Invalid code. Please try again.")
    }
  }

  const handleRsvpNow = () => {
    router.push(`/rsvp/${weddingSlug}`)
  }

  const handleAlreadyRsvpd = () => {
    setDialogStage(null)
    onAccessGranted()
  }

  const handleCloseDialog = () => {
    setDialogStage(null)
    setCode("")
    setError("")
  }

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }
        
        .animate-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
        
        .animate-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
        
        .animate-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
        }
      `}</style>
      
      <section className="relative h-screen min-h-dvh w-full overflow-hidden bg-black">
        {/* Video background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="/background-main.png"
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
        </video>
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 text-center">
          {/* Countdown timer */}
          <div className="mb-8 animate-fade-in-up">
            <CountdownTimer targetDate={weddingDate} />
          </div>

          {/* Couple names */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-8 leading-tight animate-fade-in-up animate-delay-200">
            <span className="block">{partner1Name}</span>
            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal my-2">&</span>
            <span className="block">{partner2Name}</span>
          </h1>

          {/* Date and Location */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 text-white mb-10 animate-fade-in-up animate-delay-400">
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-white/90 shrink-0" />
              <span className="font-cormorant text-lg md:text-xl tracking-wide">
                {formattedDate}
              </span>
            </div>
            <div className="w-px h-6 bg-white/40 hidden md:block" />
            <div className="flex items-center space-x-3">
              <MapPin className="h-6 w-6 text-white/90 shrink-0" />
              <span className="font-cormorant text-lg md:text-xl tracking-wide">
                {location}
              </span>
            </div>
          </div>

          {/* Enter button */}
          <Button
            size="lg"
            onClick={() => setDialogStage("code-entry")}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 font-sans text-[10px] tracking-[0.2em] uppercase px-8 py-6 rounded-full transition-all shadow-lg animate-fade-in-up animate-delay-600"
          >
            Enter
          </Button>
        </div>

        {/* Code Entry Dialog */}
        <Dialog open={dialogStage === "code-entry"} onOpenChange={handleCloseDialog}>
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

        {/* RSVP Choice Dialog */}
        <Dialog open={dialogStage === "rsvp-choice"} onOpenChange={handleCloseDialog}>
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
      </section>
    </>
  )
}
