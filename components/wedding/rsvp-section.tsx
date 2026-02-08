"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Calendar } from "lucide-react"

interface RsvpSectionProps {
  weddingSlug: string
  partner1Name?: string
  partner2Name?: string
  rsvpDeadline?: Date | null
}

export function RsvpSection({
  weddingSlug,
  partner1Name = "",
  partner2Name = "",
  rsvpDeadline,
}: RsvpSectionProps) {

  const coupleNames =
    partner1Name && partner2Name
      ? `${partner1Name.toUpperCase()} & ${partner2Name.toUpperCase()}`
      : ""

  return (
    <section id="rsvp" className="scroll-mt-20 relative">
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <header className="text-center mb-16 md:mb-24">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/20 mb-6">
            <Heart className="h-8 w-8 text-gold fill-gold" />
          </div>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-7xl text-black mb-4 drop-shadow-sm">
            RSVP
          </h2>
          {coupleNames && (
            <p className="font-sans text-base md:text-xl lg:text-2xl tracking-[0.2em] uppercase text-foreground/90">
              {coupleNames}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-8 md:w-12 bg-gold" />
            <p className="font-serif italic text-base md:text-lg text-muted-foreground">
              Join Us in Celebration
            </p>
            <div className="h-px w-8 md:w-12 bg-gold" />
          </div>
        </header>

        {/* Content */}
        <div className="space-y-12">
          {/* Call to Action */}
          <div className="text-center space-y-6">
            <p className="font-serif text-lg md:text-xl text-foreground/90 max-w-2xl mx-auto">
              We would be honored by your presence at our wedding celebration. 
              Please let us know if you can join us by submitting your RSVP.
            </p>

            {rsvpDeadline && (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gold/10 rounded-lg border border-gold/30">
                <Calendar className="h-5 w-5 text-gold" />
                <p className="font-sans text-sm md:text-base text-foreground">
                  Please respond by{" "}
                  <span className="font-semibold">
                    {new Date(rsvpDeadline).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </p>
              </div>
            )}

            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link href={`/rsvp/${weddingSlug}`}>
                <Heart className="mr-2 h-5 w-5" />
                RSVP Now
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center">
          <div className="h-px w-32 bg-gold/30 mx-auto mb-8" />
          <p className="font-serif italic text-muted-foreground text-base md:text-lg">
            We can&apos;t wait to celebrate with you!
          </p>
        </footer>
      </div>
    </section>
  )
}
