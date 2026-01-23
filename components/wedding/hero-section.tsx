import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, MapPin } from "lucide-react"
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
  const formattedDate = new Date(weddingDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const location = [venueName, venueCity, venueState].filter(Boolean).join(", ")

  return (
    <section className="relative w-full">
      {/* Countdown Section - Moved to Top */}
      <div className="container py-16">
        <div className="text-center mb-8">
          <h2 className="font-serif text-4xl font-bold mb-2">Counting Down</h2>
          <p className="text-muted-foreground">Until we say "I do"</p>
        </div>
        <CountdownTimer targetDate={weddingDate} />
      </div>

      {/* Hero Image */}
      <div className="relative h-[600px] w-full overflow-hidden">
        {heroImageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-background" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary to-accent/10 bg-floral-pattern">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          </div>
        )}

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex items-center justify-center text-center">
          <div className="container px-4">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <h1 className="font-serif text-6xl md:text-8xl font-bold mb-6 text-foreground drop-shadow-lg">
                {partner1Name} & {partner2Name}
              </h1>

              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-8 text-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium">{formattedDate}</span>
                </div>
                {location && (
                  <>
                    <span className="hidden md:inline text-muted-foreground">•</span>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span className="font-medium">{location}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="mb-8">
                <Button asChild size="lg" className="rounded-full text-lg px-8 py-6">
                  <Link href={`/rsvp/${weddingSlug}`}>
                    RSVP Now
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

