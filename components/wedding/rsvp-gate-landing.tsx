"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FloralDivider } from "@/components/wedding/floral-divider"

interface RsvpGateLandingProps {
  /** Wedding slug for the RSVP lookup page (e.g. /rsvp/[slug]) */
  rsvpSlug: string
  partner1Name?: string
  partner2Name?: string
  /** Optional background image URL */
  imageUrl?: string
}

/**
 * Landing page shown before the wedding site. Users must complete RSVP
 * (via the linked RSVP page) before they can access the rest of the website.
 * Access is granted by setting wedding_access cookie on successful RSVP submit.
 */
export function RsvpGateLanding({
  rsvpSlug,
  partner1Name,
  partner2Name,
  imageUrl,
}: RsvpGateLandingProps) {
  const rsvpHref = `/rsvp/${encodeURIComponent(rsvpSlug)}`
  const backgroundStyle = imageUrl
    ? { backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : undefined

  return (
    <div
      className="min-h-screen min-h-dvh flex flex-col items-center justify-center px-6 py-16 text-center bg-[var(--bg-linen)]"
      style={backgroundStyle}
    >
      <div className="absolute inset-0 bg-[var(--bg-linen)]/85 pointer-events-none" aria-hidden />
      <div className="relative z-10 w-full max-w-lg mx-auto">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/15 mb-8">
          <Heart className="h-10 w-10 text-gold fill-gold" aria-hidden />
        </div>
        <h1 className="font-cursive text-4xl md:text-5xl text-gold mb-3">
          You&apos;re Invited
        </h1>
        {(partner1Name || partner2Name) && (
          <p className="font-serif text-xl text-foreground/90 mb-2">
            {partner1Name} & {partner2Name}
          </p>
        )}
        <FloralDivider className="my-6 opacity-80" />
        <p className="font-[var(--font-eb-garamond)] text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          Please RSVP to view our wedding website and all the details.
        </p>
        <Link href={rsvpHref}>
          <Button
            size="lg"
            className="min-w-[200px] font-[var(--font-eb-garamond)] text-base tracking-wide"
            style={{
              background: "var(--gold-leaf)",
              color: "var(--ink-main)",
            }}
          >
            RSVP Now
          </Button>
        </Link>
        <p className="mt-6 text-sm text-muted-foreground font-[var(--font-eb-garamond)]">
          You&apos;ll need your invite code or email to continue.
        </p>
      </div>
    </div>
  )
}
