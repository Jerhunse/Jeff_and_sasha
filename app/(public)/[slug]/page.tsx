import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { WeddingPageClient } from "@/components/wedding/wedding-page-client"

interface HomePageProps {
  params: Promise<{ slug: string }>
}

async function getAllWeddingData(slug: string) {
  let wedding = null
  try {
    wedding = await prisma.couple.findUnique({
      where: { slug },
      include: {
        events: {
          where: { visibility: "PUBLIC" },
          orderBy: { startTime: "asc" },
        },
        hotels: {
          orderBy: { order: "asc" },
        },
        registryLinks: {
          orderBy: { order: "asc" },
        },
        cashFunds: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
        },
        faqs: {
          orderBy: { order: "asc" },
        },
      },
    })
  } catch (error) {
    console.error("[WeddingHomePage] Failed to load wedding data", { slug, error })
    return null
  }

  if (!wedding || !wedding.isPublished) {
    return null
  }

  // Deduplicate events by startTime + name + location (keep first of each)
  const seen = new Set<string>()
  const uniqueEvents = wedding.events.filter((e) => {
    const key = `${e.startTime.getTime()}-${e.name}-${e.location ?? ""}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return { ...wedding, events: uniqueEvents }
}

export default async function WeddingHomePage({ params }: HomePageProps) {
  const { slug } = await params
  const wedding = await getAllWeddingData(slug)

  if (!wedding) {
    notFound()
  }

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
    <WeddingPageClient wedding={wedding} weddingSchema={weddingSchema} />
  )
}
