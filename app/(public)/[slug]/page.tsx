import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { HeroSection } from "@/components/wedding/hero-section"
import { PaperCard } from "@/components/ui/paper-card"
import { FloralDivider } from "@/components/wedding"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, MapPin, Gift, ExternalLink } from "lucide-react"

interface HomePageProps {
  params: Promise<{ slug: string }>
}

async function getWeddingData(slug: string) {
  const wedding = await prisma.couple.findUnique({
    where: { slug },
    include: {
      events: {
        where: { visibility: "PUBLIC" },
        orderBy: { startTime: "asc" },
        take: 3,
      },
      registryLinks: {
        orderBy: { order: "asc" },
        take: 3,
      },
      cashFunds: {
        orderBy: { createdAt: "desc" },
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
  ]

  // Generate Schema.org structured data for the wedding event
  const weddingSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${wedding.partner1Name} & ${wedding.partner2Name}'s Wedding`,
    description: `Join us in celebrating the wedding of ${wedding.partner1Name} and ${wedding.partner2Name}`,
    startDate: new Date(wedding.weddingDate).toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(wedding.venueName && {
      location: {
        "@type": "Place",
        name: wedding.venueName,
        ...(wedding.venueAddress && {
          address: {
            "@type": "PostalAddress",
            streetAddress: wedding.venueAddress,
            addressLocality: wedding.venueCity || undefined,
            addressRegion: wedding.venueState || undefined,
            postalCode: wedding.venueZip || undefined,
          },
        }),
      },
    }),
    organizer: {
      "@type": "Person",
      name: `${wedding.partner1Name} & ${wedding.partner2Name}`,
    },
  }

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

        <PaperCard>
          <h1 className="font-cursive text-4xl text-gold text-center mb-2">
            {wedding.partner1Name} & {wedding.partner2Name}
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            {new Date(wedding.weddingDate).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link key={link.href} href={link.href}>
                  <Card className="h-full card-hover border-border/50 bg-card/50">
                    <CardContent className="pt-6 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                        <Icon className="h-6 w-6 text-gold" />
                      </div>
                      <h3 className="font-cursive text-xl text-gold mb-2">{link.title}</h3>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          {wedding.events.length > 0 && (
            <>
              <FloralDivider />
              <h2 className="font-cursive text-3xl text-gold text-center mb-8">
                Wedding Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {wedding.events.map((event) => (
                  <Card key={event.id} className="card-hover border-border/50 bg-card/50">
                    <CardContent className="pt-6">
                      <h3 className="font-cursive text-2xl text-gold mb-2">{event.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {new Date(event.startTime).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(event.startTime).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                      {event.description && (
                        <p className="text-sm mb-4">{event.description}</p>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 text-gold" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mb-8">
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link href={`/${slug}/schedule`}>View Full Schedule</Link>
                </Button>
              </div>
            </>
          )}

          {(wedding.registryLinks.length > 0 || wedding.cashFunds.length > 0) && (
            <>
              <FloralDivider />
              <h2 className="font-cursive text-3xl text-gold text-center mb-4">
                Registry
              </h2>
              <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-8">
                Your presence is the greatest gift. We&rsquo;ve also registered at these
                locations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {wedding.registryLinks.map((item) => (
                  <Card
                    key={item.id}
                    className="card-hover overflow-hidden border-border/50 bg-card/50"
                  >
                    {item.imageUrl && (
                      <div className="aspect-video w-full overflow-hidden bg-muted">
                        <img
                          src={item.imageUrl}
                          alt={item.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="pt-6">
                      <h3 className="font-cursive text-xl text-gold mb-2">{item.label}</h3>
                      {item.description && (
                        <p className="text-sm mb-4 line-clamp-2">{item.description}</p>
                      )}
                      <Button asChild size="sm" className="w-full rounded-full">
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          View Registry
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mb-8">
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link href={`/${slug}/registry`}>View All Registries</Link>
                </Button>
              </div>
            </>
          )}

          <FloralDivider />
          <h2 className="font-cursive text-3xl md:text-4xl text-gold text-center mb-4">
            Join Our Celebration
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            We can&rsquo;t wait to celebrate with you. Please let us know if you&rsquo;ll
            be able to join us.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="rounded-full text-lg px-12 py-6">
              <Link href={`/rsvp/${wedding.slug}`}>RSVP Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link href={`/${slug}/schedule`}>View Schedule</Link>
            </Button>
          </div>
        </PaperCard>
      </div>
    </>
  )
}

