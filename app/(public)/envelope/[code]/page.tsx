import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EnvelopeLandingWithCode } from "@/components/wedding/envelope-landing-with-code"

interface EnvelopePageProps {
  params: Promise<{ code: string }>
}

async function getGuestByCode(code: string) {
  const guest = await prisma.guest.findUnique({
    where: { inviteToken: code },
    include: {
      couple: {
        include: {
          events: {
            where: { visibility: "PUBLIC" },
            orderBy: { startTime: "asc" },
          },
        },
      },
    },
  })

  return guest
}

export default async function EnvelopePage({ params }: EnvelopePageProps) {
  const { code } = await params

  // Find guest by invite token
  const guest = await getGuestByCode(code)

  if (!guest) {
    notFound()
  }

  const wedding = guest.couple
  const weddingDate = wedding.weddingDate.toISOString()

  // Prepare wedding details
  const weddingDetails = {
    venueName: wedding.venueName,
    venueAddress: wedding.venueAddress,
    venueCity: wedding.venueCity,
    venueState: wedding.venueState,
    venueZip: wedding.venueZip,
    events: wedding.events.map((event) => ({
      name: event.name,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime?.toISOString() || null,
      location: event.location,
      address: event.address,
      venue: event.venue,
    })),
  }

  return (
    <EnvelopeLandingWithCode
      partner1Name={wedding.partner1Name}
      partner2Name={wedding.partner2Name}
      weddingDate={weddingDate}
      redirectTo={`/${wedding.slug}`}
      weddingDetails={weddingDetails}
      guest={guest}
      couple={wedding}
    />
  )
}
