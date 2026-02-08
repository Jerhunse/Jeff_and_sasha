"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { MapPin } from "lucide-react"
import { CountdownTimer } from "./countdown-timer"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const REQUIRED_RSVP_CODE = "sj2026"

interface HeroWithVideoProps {
  partner1Name: string
  partner2Name: string
  weddingDate: Date
  location: string
  weddingSlug: string
}

export function HeroWithVideo({
  partner1Name,
  partner2Name,
  weddingDate,
  location,
  weddingSlug,
}: HeroWithVideoProps) {
  const [showCodeDialog, setShowCodeDialog] = useState(false)
  const [codeInput, setCodeInput] = useState("")
  const [codeError, setCodeError] = useState("")
  const [hasRsvpAccess, setHasRsvpAccess] = useState(false)
  const router = useRouter()
  
  useEffect(() => {
    // Check if user has already entered the RSVP code
    const rsvpAccess = sessionStorage.getItem("rsvp_access_granted")
    if (rsvpAccess === "true") {
      setHasRsvpAccess(true)
    }
  }, [])

  const handleRsvpClick = () => {
    // Check if user has RSVP access
    if (hasRsvpAccess) {
      router.push(`/rsvp/${weddingSlug}`)
    } else {
      // Show code dialog
      setShowCodeDialog(true)
      setCodeError("")
      setCodeInput("")
    }
  }

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (codeInput.trim().toLowerCase() === REQUIRED_RSVP_CODE.toLowerCase()) {
      // Grant access
      sessionStorage.setItem("rsvp_access_granted", "true")
      setHasRsvpAccess(true)
      setShowCodeDialog(false)
      setCodeError("")
      
      // Navigate to RSVP page
      router.push(`/rsvp/${weddingSlug}`)
    } else {
      setCodeError("Invalid code. Please try again.")
    }
  }

  const formattedDate = new Date(weddingDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  // Get first initials
  const initial1 = partner1Name.charAt(0)
  const initial2 = partner2Name.charAt(0)

  return (
    <section id="home" className="relative min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Hero Image with angled clip */}
      <div className="lg:w-7/12 relative overflow-hidden bg-zinc-200 min-h-[50vh] lg:min-h-screen">
        <div className="absolute inset-0 hero-image-clip">
          <img
            src="/hero-couple-photo.png"
            alt="Wedding couple on the beach"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
            draggable={false}
          />
          <div className="absolute inset-0 bg-black/5" />
        </div>
      </div>

      {/* Right side - Wedding Details */}
      <div className="lg:w-5/12 bg-background-light flex flex-col justify-center items-center px-8 py-16 lg:px-16 text-center">
        {/* Monogram */}
        <div className="mb-12 border border-gold/30 rounded-full w-20 h-20 flex items-center justify-center">
          <span className="font-cursive text-3xl text-gold italic">
            {initial1}&{initial2}
          </span>
        </div>

       {/* Names */}
<div className="flex flex-col items-center text-zinc-800 mb-4">
  <span className="font-serif text-5xl lg:text-6xl font-light tracking-wide">
    {partner1Name}
  </span>

  <span className="font-serif text-4xl lg:text-5xl my-2 font-light">
    &
  </span>

  <span className="font-serif text-5xl lg:text-6xl font-light tracking-wide">
    {partner2Name}
  </span>
</div>


        {/* Subtitle */}
        <p className="uppercase tracking-[0.3em] text-sm text-gold mb-12 font-medium">
          Are getting married
        </p>

        {/* Date & Location */}
        <div className="space-y-2 mb-12">
          <p className="font-serif text-3xl italic text-zinc-700">
            {formattedDate}
          </p>
          <div className="flex items-center justify-center gap-2 text-zinc-500">
            <MapPin className="h-4 w-4" />
            <span className="text-sm tracking-widest uppercase">{location}</span>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="mb-12">
          <CountdownTimer targetDate={weddingDate} />
        </div>

        {/* CTA Buttons */}
        <div className="space-y-6">
          <Button 
            onClick={handleRsvpClick}
            size="lg"
            className="bg-gold hover:bg-gold/90 text-white px-12 py-6 rounded-none uppercase tracking-widest text-sm font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            RSVP to our Wedding
          </Button>
          
          <div>
            <a 
              href="#registry"
              className="text-zinc-400 hover:text-gold transition-colors text-xs uppercase tracking-widest underline underline-offset-8 decoration-gold/30"
            >
              View our Registry
            </a>
          </div>
        </div>
      </div>

      {/* Code Dialog */}
      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl text-black">Enter RSVP Code</DialogTitle>
            <DialogDescription>
              Please enter your invitation code to access the RSVP page.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code">Invitation Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter code"
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(e.target.value)
                  setCodeError("")
                }}
                className="mt-1"
                autoFocus
              />
              {codeError && (
                <p className="text-sm text-destructive mt-2">{codeError}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCodeDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Submit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
