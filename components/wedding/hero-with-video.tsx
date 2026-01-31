"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, MapPin, ChevronDown } from "lucide-react"
import { CountdownTimer } from "./countdown-timer"

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
  const [videoOpacity, setVideoOpacity] = useState(1)
  const videoRef = useRef<HTMLIFrameElement>(null)
  
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
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <section id="home" className="relative h-screen min-h-dvh w-full overflow-hidden bg-transparent">
      {/* YouTube Video background with fade effect */}
      <div 
        className="absolute inset-0 transition-opacity duration-300"
        style={{ opacity: videoOpacity }}
      >
        <iframe
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src="https://www.youtube.com/embed/7bOfht-JlO4?autoplay=1&mute=1&loop=1&playlist=7bOfht-JlO4&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1"
          title="Wedding Video"
          allow="autoplay; fullscreen"
          style={{
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            pointerEvents: 'none',
          }}
        />
      </div>
      
      {/* Fallback static image (visible when video fades out or fails to load) */}
      <img
        src="/background-main.png"
        alt="Wedding"
        className="absolute inset-0 w-full h-full object-cover -z-[1]"
        draggable={false}
      />
      
      {/* Light overlay for text readability */}
      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/30 via-transparent to-transparent"
        aria-hidden
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 hero-text-shadow">
        <div className="mb-4 md:mb-6">
          <CountdownTimer targetDate={weddingDate} />
        </div>
        
        <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white mb-4 md:mb-6 leading-tight text-center drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]">
          <span className="block">{partner1Name}</span>
          <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal my-2 md:my-3">&</span>
          <span className="block">{partner2Name}</span>
        </h1>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-white mb-8 md:mb-10">
          <div className="flex items-center space-x-2 md:space-x-3">
            <Calendar className="h-5 w-5 md:h-6 md:w-6 text-white/90 shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]" />
            <span className="font-cormorant text-base md:text-lg lg:text-xl tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {formattedDate}
            </span>
          </div>
          <div className="w-px h-6 bg-white/40 hidden md:block" />
          <div className="flex items-center space-x-2 md:space-x-3">
            <MapPin className="h-5 w-5 md:h-6 md:w-6 text-white/90 shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]" />
            <span className="font-cormorant text-base md:text-lg lg:text-xl tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {location}
            </span>
          </div>
        </div>

        <Button asChild size="lg" className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 hover:scale-105 text-white font-sans text-xs md:text-[10px] tracking-[0.2em] uppercase px-8 py-3 rounded-full transition-all shadow-lg md:hidden min-h-[44px] min-w-[120px]">
          <Link href={`/rsvp/${weddingSlug}`}>RSVP</Link>
        </Button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <ChevronDown className="h-8 w-8 text-white/70" />
      </div>
    </section>
  )
}
