import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { HeroSection } from "@/components/wedding/hero-section"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, MapPin, Gift, Book } from "lucide-react"

interface HomePageProps {
  params: Promise<{ slug: string }>
}

async function getWeddingData(slug: string) {
  const wedding = await prisma.wedding.findUnique({
    where: { slug },
    include: {
      events: {
        where: { isPublic: true },
        orderBy: { startTime: "asc" },
        take: 3,
      },
    },
  })

  if (!wedding || !wedding.isPublished) {
    return null
  }

  return wedding
}

export default async function WeddingHomePage({ params }: HomePageProps) {
  const { slug } = await params
  const wedding = await getWeddingData(slug)

  if (!wedding) {
    notFound()
  }

  const quickLinks = [
    {
      icon: Calendar,
      title: "Schedule",
      description: "View our wedding day timeline",
      href: `/${slug}/schedule`,
    },
    {
      icon: MapPin,
      title: "Travel & Stay",
      description: "Hotels and directions",
      href: `/${slug}/travel`,
    },
    {
      icon: Gift,
      title: "Registry",
      description: "View our registry",
      href: `/${slug}/registry`,
    },
    {
      icon: Book,
      title: "Our Story",
      description: "How we met and fell in love",
      href: `/${slug}/story`,
    },
  ]

  return (
    <div className="flex flex-col gap-0">
      <HeroSection
        partner1Name={wedding.partner1Name}
        partner2Name={wedding.partner2Name}
        weddingDate={wedding.weddingDate}
        venueName={wedding.venueName}
        venueCity={wedding.venueCity}
        venueState={wedding.venueState}
        heroImageUrl={wedding.heroImageUrl}
        weddingSlug={wedding.slug}
      />

      {/* Quick Links Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link key={link.href} href={link.href}>
                  <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                    <CardContent className="pt-6 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-serif text-xl font-bold mb-2">{link.title}</h3>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      {wedding.events.length > 0 && (
        <section className="py-16">
          <div className="container">
            <h2 className="font-serif text-4xl font-bold text-center mb-12">
              Wedding Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {wedding.events.map((event) => (
                <Card key={event.id} className="card-hover">
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <h3 className="font-serif text-2xl font-bold mb-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.startTime).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                        {" at "}
                        {new Date(event.startTime).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {event.description && (
                      <p className="text-sm mb-4">{event.description}</p>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Button asChild variant="outline" size="lg">
                <Link href={`/${slug}/schedule`}>View Full Schedule</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* RSVP CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-secondary to-accent/10 bg-floral-pattern">
        <div className="container text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Join Our Celebration
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            We can't wait to celebrate with you! Please let us know if you'll be able to join us.
          </p>
          <Button asChild size="lg" className="rounded-full text-lg px-12 py-6">
            <Link href={`/rsvp/${wedding.slug}`}>
              RSVP Now
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

