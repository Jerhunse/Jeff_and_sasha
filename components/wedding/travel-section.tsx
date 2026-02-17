"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import {
  MapPin,
  Globe,
  Calendar,
  Info,
  Clock,
  Car,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Image from "next/image"

interface Hotel {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string | null
  website: string | null
  code: string | null
  specialRate: string | null
  deadline: Date | null
  distanceFromVenue: string | null
  amenities: string | null
  imageUrl: string | null
}

interface TravelSectionProps {
  venueName?: string | null
  venueAddress?: string | null
  venueCity?: string | null
  venueState?: string | null
  venueZip?: string | null
  hotels: Hotel[]
}

/**
 * Extracts the drive-time portion from a distanceFromVenue string.
 * Example: "~13 miles (25 minutes)" → "25 mins away"
 */
function extractDriveTime(distanceFromVenue: string | null): string | null {
  if (!distanceFromVenue) return null
  const match = distanceFromVenue.match(/\((\d+)\s*minutes?\)/)
  if (match) return `${match[1]} mins away`
  return distanceFromVenue
}

export function TravelSection({
  venueName,
  venueAddress,
  venueCity,
  venueState,
  venueZip,
  hotels,
}: TravelSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", checkScroll, { passive: true })
    window.addEventListener("resize", checkScroll)
    return () => {
      el.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [checkScroll, hotels])

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.querySelector("div")?.offsetWidth ?? 340
    const gap = 24
    el.scrollBy({
      left: direction === "left" ? -(cardWidth + gap) : cardWidth + gap,
      behavior: "smooth",
    })
  }

  const fullAddress = [venueAddress, venueCity, venueState, venueZip]
    .filter(Boolean)
    .join(", ")

  const directionsHref = venueAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
    : "https://share.google/BQng1GFNuxbDEQf5T"

  return (
    <section id="travel" className="scroll-mt-20 relative">
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-20">
        {/* ── Where to Stay ── */}
        <div>

          {/* Section header */}
          <div className="text-center mb-12 md:mb-16 max-w-2xl mx-auto">
            <h2 className="font-heading text-4xl md:text-5xl lg:text-7xl text-black mb-4 drop-shadow-sm">
              Where to Stay
            </h2>
            <div className="w-20 h-0.5 bg-primary mx-auto mb-6" />
            <p className="text-foreground text-base md:text-lg font-normal leading-relaxed">
              We have selected several hotels near our venue for your comfort.
            </p>
          </div>

          {hotels.length === 0 ? (
            <div className="rounded-xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-md p-8 text-center">
              <p className="font-serif italic text-muted-foreground">
                Hotel recommendations coming soon!
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Left arrow */}
              {canScrollLeft && (
                <button
                  onClick={() => scroll("left")}
                  aria-label="Scroll left"
                  className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-20 size-10 md:size-12 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-md border border-primary/20 shadow-lg flex items-center justify-center text-primary hover:bg-white dark:hover:bg-black/90 transition-all"
                >
                  <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                </button>
              )}

              {/* Right arrow */}
              {canScrollRight && (
                <button
                  onClick={() => scroll("right")}
                  aria-label="Scroll right"
                  className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-20 size-10 md:size-12 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-md border border-primary/20 shadow-lg flex items-center justify-center text-primary hover:bg-white dark:hover:bg-black/90 transition-all"
                >
                  <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                </button>
              )}

              {/* Fade edges */}
              {canScrollLeft && (
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 md:w-16 z-10 bg-gradient-to-r from-[#D4D9C3] to-transparent" />
              )}
              {canScrollRight && (
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 md:w-16 z-10 bg-gradient-to-l from-[#D4D9C3] to-transparent" />
              )}

              {/* Scrollable track */}
              <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-6 px-6 scrollbar-hide"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {hotels.map((hotel) => {
                  const driveTime = extractDriveTime(hotel.distanceFromVenue)
                  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${hotel.name} ${hotel.address} ${hotel.city} ${hotel.state}`
                  )}`

                  return (
                    <div
                      key={hotel.id}
                      className="group flex-shrink-0 w-[300px] md:w-[340px] snap-start bg-white dark:bg-[#2d2618] border border-primary/20 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative h-48 md:h-56 w-full overflow-hidden">
                        {hotel.imageUrl ? (
                          <Image
                            src={hotel.imageUrl}
                            alt={hotel.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="340px"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">
                              No image
                            </span>
                          </div>
                        )}

                        {/* Drive-time badge */}
                        {driveTime && (
                          <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/70 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                            <p className="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {driveTime}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 md:p-6">
                        <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 font-serif">
                          {hotel.name}
                        </h3>

                        <p className="text-muted-foreground text-sm mb-3 flex items-start gap-1.5">
                          <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>
                            {hotel.address}
                            {hotel.city && `, ${hotel.city}`}
                            {hotel.state && `, ${hotel.state}`}
                            {hotel.zip && ` ${hotel.zip}`}
                          </span>
                        </p>

                        {hotel.distanceFromVenue && (
                          <div className="flex items-center gap-2 mb-5 text-sm text-foreground">
                            <Car className="h-4 w-4 text-primary shrink-0" />
                            <span>
                              {hotel.distanceFromVenue} from venue
                            </span>
                          </div>
                        )}

                        {/* Special rate callout */}
                        {hotel.code && (
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-5 space-y-1.5">
                            <p className="text-sm font-semibold flex items-center gap-1.5">
                              <Info className="h-4 w-4 text-primary shrink-0" />
                              Special Rate Available
                            </p>
                            <p className="text-xs md:text-sm">
                              <span className="font-medium">
                                Block Code:
                              </span>{" "}
                              <code className="bg-background px-2 py-0.5 rounded text-xs">
                                {hotel.code}
                              </code>
                            </p>
                            {hotel.deadline && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 shrink-0" />
                                Book by{" "}
                                {new Date(
                                  hotel.deadline
                                ).toLocaleDateString()}
                              </p>
                            )}
                            {hotel.specialRate && (
                              <p className="text-xs text-muted-foreground">
                                {hotel.specialRate}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Action links */}
                        <div className="flex gap-4 border-t border-primary/10 pt-4">
                          {hotel.website && (
                            <a
                              href={hotel.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-1.5 text-primary font-bold text-sm hover:underline tracking-tight"
                            >
                              <Globe className="h-4 w-4" />
                              Visit Website
                            </a>
                          )}
                          <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 text-primary font-bold text-sm hover:underline tracking-tight"
                          >
                            <MapPin className="h-4 w-4" />
                            Directions
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Dot indicators */}
              {hotels.length > 3 && (
                <div className="flex justify-center gap-2 mt-6">
                  {hotels.map((hotel, i) => (
                    <button
                      key={hotel.id}
                      aria-label={`Go to ${hotel.name}`}
                      onClick={() => {
                        const el = scrollRef.current
                        if (!el) return
                        const card = el.children[i] as HTMLElement
                        if (card) {
                          el.scrollTo({
                            left:
                              card.offsetLeft -
                              el.offsetLeft -
                              24,
                            behavior: "smooth",
                          })
                        }
                      }}
                      className="size-2.5 rounded-full bg-primary/30 hover:bg-primary transition-colors"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Our Venue ── */}
          {(venueName || venueAddress) && (
            <div className="mt-16 md:mt-20">
              <div className="text-center mb-8">
                <h2 className="font-heading text-4xl md:text-5xl lg:text-7xl text-black mb-4 drop-shadow-sm">
                  Our Venue
                </h2>
                <div className="w-20 h-0.5 bg-primary mx-auto" />
              </div>

              <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#2d2618] border border-primary/20 shadow-md">
                {/* Map embed */}
                {venueAddress && (
                  <div className="w-full aspect-[16/9] overflow-hidden">
                    {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(fullAddress)}`}
                      />
                    ) : (
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`}
                      />
                    )}
                  </div>
                )}

                {/* Venue details below map */}
                <div className="p-6 md:p-8 text-center space-y-3">
                  {venueName && (
                    <h3 className="font-serif text-xl md:text-2xl text-foreground">
                      {venueName}
                    </h3>
                  )}
                  {venueAddress && (
                    <p className="text-muted-foreground text-sm md:text-base flex items-center justify-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      {venueAddress}
                      {venueCity && `, ${venueCity}`}
                      {venueState && `, ${venueState}`}
                      {venueZip && ` ${venueZip}`}
                    </p>
                  )}
                  <div className="pt-2">
                    <a
                      href={directionsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-8 py-3 bg-[#1a1816] dark:bg-primary text-white dark:text-[#1a1816] font-bold rounded-lg shadow-md hover:opacity-90 transition-all text-sm"
                    >
                      <MapPin className="h-4 w-4" />
                      Get Directions
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
