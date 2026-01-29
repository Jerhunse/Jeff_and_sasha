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

  // Get RSVP response for this guest
  const rsvpResponse = await prisma.rSVPResponse.findFirst({
    where: {
      guestId: guest.id,
      eventId: null,
    },
    orderBy: { respondedAt: "desc" },
  })

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

  // Transform guest to match component interface
  const guestForComponent = {
    id: guest.id,
    firstName: guest.firstName,
    lastName: guest.lastName,
    email: guest.email,
    phone: guest.phone,
    allowPlusOne: guest.allowPlusOne,
    plusOneUsed: !!rsvpResponse?.plusOneName,
    plusOneName: rsvpResponse?.plusOneName || null,
    rsvpStatus: rsvpResponse?.status || "PENDING",
    inviteToken: guest.inviteToken,
  }

  // Transform couple to match component interface (with defaults for fields that don't exist)
  const coupleForComponent = {
    id: wedding.id,
    partner1Name: wedding.partner1Name,
    partner2Name: wedding.partner2Name,
    weddingDate: wedding.weddingDate,
    slug: wedding.slug,
    rsvpDeadline: wedding.rsvpDeadline,
    askMealChoice: true, // Default value - these fields don't exist in Couple model
    mealOptions: null,
    askSongRequest: true,
    askBusTransport: false,
    busRoutes: null,
    maxCapacity: wedding.maxCapacity,
  }

  return (
    <EnvelopeLandingWithCode
      partner1Name={wedding.partner1Name}
      partner2Name={wedding.partner2Name}
      weddingDate={weddingDate}
      redirectTo={`/${wedding.slug}`}
      weddingDetails={weddingDetails}
      guest={guestForComponent}
      couple={coupleForComponent}
    />
  )
}
