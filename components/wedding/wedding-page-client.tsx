"use client"

import { useState, useEffect } from "react"
import { HeroCodeGate } from "@/components/wedding/hero-code-gate"
import { HeroWithVideo } from "@/components/wedding/hero-with-video"
import { WeddingCalendar } from "@/components/wedding/wedding-calendar"
import { ScheduleSection } from "@/components/wedding/schedule-section"
import { DresscodeSection } from "@/components/wedding/dresscode-section"
import { TravelSection } from "@/components/wedding/travel-section"
import { RsvpSection } from "@/components/wedding/rsvp-section"
import { RegistrySection } from "@/components/wedding/registry-section"
import { FaqSection } from "@/components/wedding/faq-section"
import { ContactSection } from "@/components/wedding/contact-section"

interface WeddingPageClientProps {
  wedding: any
  weddingSchema: any
}

export function WeddingPageClient({ wedding, weddingSchema }: WeddingPageClientProps) {
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    // Check if user has already entered the code in this session
    const accessGranted = sessionStorage.getItem("wedding_site_access")
    if (accessGranted === "true") {
      setHasAccess(true)
    }
  }, [])

  const handleAccessGranted = () => {
    sessionStorage.setItem("wedding_site_access", "true")
    setHasAccess(true)
  }

  // If no access, show only the hero code gate
  if (!hasAccess) {
    return (
      <>
        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(weddingSchema),
          }}
        />
        
        <HeroCodeGate
          partner1Name={wedding.partner1Name}
          partner2Name={wedding.partner2Name}
          weddingDate={wedding.weddingDate}
          location="175 Pollard Rd, Temple, GA 30179"
          weddingSlug={wedding.slug}
          onAccessGranted={handleAccessGranted}
        />
      </>
    )
  }

  // Once access is granted, show hero with video plus all sections
  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(weddingSchema),
        }}
      />
      
      <div className="flex flex-col gap-0">
        {/* Hero Section with Video Background */}
        <HeroWithVideo
          partner1Name={wedding.partner1Name}
          partner2Name={wedding.partner2Name}
          weddingDate={wedding.weddingDate}
          location="175 Pollard Rd, Temple, GA 30179"
          weddingSlug={wedding.slug}
        />

        {/* Wedding Calendar */}
        <WeddingCalendar 
          weddingDate={wedding.weddingDate}
          partner1Name={wedding.partner1Name}
          partner2Name={wedding.partner2Name}
          venueName={wedding.venueName}
          venueAddress={wedding.venueAddress}
          venueCity={wedding.venueCity}
          venueState={wedding.venueState}
          venueZip={wedding.venueZip}
        />

        {/* Schedule Section */}
        <ScheduleSection
          events={wedding.events}
          weddingDate={wedding.weddingDate}
          partner1Name={wedding.partner1Name}
          partner2Name={wedding.partner2Name}
          attire={wedding.events[0]?.attire ?? undefined}
        />

        {/* Registry Section */}
        <RegistrySection
          registryLinks={wedding.registryLinks}
          cashFunds={wedding.cashFunds}
          slug={wedding.slug}
        />

        {/* Dresscode Section */}
        <DresscodeSection
          partner1Name={wedding.partner1Name}
          partner2Name={wedding.partner2Name}
        />

        {/* Travel Section */}
        <TravelSection
          venueName={wedding.venueName}
          venueAddress={wedding.venueAddress}
          venueCity={wedding.venueCity}
          venueState={wedding.venueState}
          venueZip={wedding.venueZip}
          hotels={wedding.hotels}
        />

        {/* RSVP Section */}
        <RsvpSection
          weddingSlug={wedding.slug}
          partner1Name={wedding.partner1Name}
          partner2Name={wedding.partner2Name}
          rsvpDeadline={wedding.rsvpDeadline}
        />

        {/* FAQ Section */}
        <FaqSection faqs={wedding.faqs} />

        {/* Contact Section */}
        <ContactSection
          slug={wedding.slug}
          venueName={wedding.venueName}
          venueCity={wedding.venueCity}
          venueState={wedding.venueState}
        />
      </div>
    </>
  )
}
