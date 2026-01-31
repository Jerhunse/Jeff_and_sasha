"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, MapPin, Heart, ChevronDown } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { CountdownTimer } from "./countdown-timer"

interface HeroSectionProps {
  partner1Name: string
  partner2Name: string
  weddingDate: Date
  venueName?: string | null
  venueCity?: string | null
  venueState?: string | null
  heroImageUrl?: string | null
  weddingSlug: string
}

export function HeroSection({
  partner1Name,
  partner2Name,
  weddingDate,
  venueName,
  venueCity,
  venueState,
  heroImageUrl,
  weddingSlug,
}: HeroSectionProps) {
  const [videoOpacity, setVideoOpacity] = useState(1)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const viewportHeight = window.innerHeight
      
      // Start fading out after scrolling 20% of viewport height
      // Completely fade out by 80% of viewport height
      const fadeStart = viewportHeight * 0.2
      const fadeEnd = viewportHeight * 0.8
      
      if (scrollPosition <= fadeStart) {
        setVideoOpacity(1)
      } else if (scrollPosition >= fadeEnd) {
        setVideoOpacity(0)
      } else {
        // Linear fade between start and end
        const fadeProgress = (scrollPosition - fadeStart) / (fadeEnd - fadeStart)
        setVideoOpacity(1 - fadeProgress)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const formattedDate = new Date(weddingDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const location = [venueCity, venueState].filter(Boolean).join(", ")
  const coupleNames = `${partner1Name} & ${partner2Name}`

  return (
    <section className="relative h-screen min-h-dvh w-full overflow-hidden bg-transparent">
      {/* Video background with fade effect */}
      <div 
        className="absolute inset-0 transition-opacity duration-300"
        style={{ opacity: videoOpacity }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="/background-main.png"
        >
          <source src="/videos/wedding-splash.mp4" type="video/mp4" />
          <source src="/videos/wedding-splash.webm" type="video/webm" />
        </video>
      </div>
      
      {/* Fallback static image (visible when video fades out or fails to load) */}
      <img
        src="/background-main.png"
        alt="Wedding"
        className="absolute inset-0 w-full h-full object-cover -z-[1]"
        draggable={false}
      />
      
      {/* Very light overlay for text readability only */}
      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-transparent"
        aria-hidden
      />

      {/* Floating text — no cards, no solid panels; shadow behind each for readability */}
      <div className="hero-text-shadow absolute inset-0 flex flex-col items-center justify-center z-10 px-4 animate-[float_8s_ease-in-out_infinite]">
        <div className="mb-4 md:mb-6 [&_.text-primary]:text-white [&_.text-muted-foreground]:text-white/80 [&_.border]:border-white/30 [&_.bg-card]:bg-white/10">
          <CountdownTimer targetDate={weddingDate} />
        </div>
        <p className="font-cormorant italic text-lg md:text-xl lg:text-2xl text-white/95 mb-4 md:mb-6 tracking-[0.2em]">
          Save the Date
        </p>
        <h1 className="font-heading text-5xl sm:text-6xl md:text-[100px] lg:text-[120px] xl:text-[140px] text-white mb-6 md:mb-8 leading-none">
          {coupleNames}
        </h1>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 lg:gap-12 text-white/95">
          <div className="flex items-center space-x-2 md:space-x-3">
            <Calendar className="h-6 w-6 md:h-7 md:w-7 text-white/90 shrink-0" />
            <span className="font-cormorant text-lg md:text-xl lg:text-2xl tracking-wide">
              {formattedDate}
            </span>
          </div>
          <div className="w-px h-6 md:h-8 bg-white/40 hidden md:block" />
          <div className="flex items-center space-x-2 md:space-x-3">
            <MapPin className="h-6 w-6 md:h-7 md:w-7 text-white/90 shrink-0" />
            <span className="font-cormorant text-lg md:text-xl lg:text-2xl tracking-wide">
              {location}
            </span>
          </div>
        </div>
        <Button asChild size="lg" className="mt-8 md:mt-10 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 hover:scale-105 text-white font-sans text-xs md:text-[10px] tracking-[0.2em] uppercase px-8 py-3 rounded-full transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] md:hidden min-h-[44px] min-w-[120px]">
          <Link href={`/rsvp/${weddingSlug}`}>RSVP</Link>
        </Button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-[pulse-glow_2s_ease-in-out_infinite] hover:animate-none transition-all duration-300 cursor-pointer group">
        <ChevronDown className="h-8 w-8 text-white/70 group-hover:text-[#d4a574] transition-all duration-300" />
      </div>
    </section>
  )
}

