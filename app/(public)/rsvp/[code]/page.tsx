import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { RsvpLookupForm } from "./rsvp-lookup-form"
import { EnvelopeLandingWithCode } from "@/components/wedding/envelope-landing-with-code"

interface RsvpPageProps {
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
      rsvpResponses: {
        where: { eventId: null }, // General RSVP
        orderBy: { respondedAt: "desc" },
        take: 1,
      },
    },
  })

  return guest
}

async function getWeddingBySlug(slug: string) {
  const wedding = await prisma.couple.findUnique({
    where: { slug },
  })

  return wedding
}

export default async function RsvpPage({ params }: RsvpPageProps) {
  const { code } = await params
  
  // If it's a wedding slug (including legacy "sj2026"), show choice: RSVP now or find by email/phone
  const weddingBySlug = await getWeddingBySlug(code)
  if (weddingBySlug) {
    return <RsvpLookupForm slug={code} />
  }

  // First, try to find a guest by invite token
  const guest = await getGuestByCode(code)
  
  if (guest) {
    // It's an invite token - show envelope first, then RSVP form
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

    // Get RSVP response data
    const rsvpResponse = guest.rsvpResponses?.[0] || null
    // Map Prisma enum values back to form values
    // Prisma: YES, NO, MAYBE, PENDING
    // Form: ATTENDING, DECLINED, MAYBE, PENDING
    const statusMap: Record<string, string> = {
      YES: "ATTENDING",
      NO: "DECLINED",
      MAYBE: "MAYBE",
      PENDING: "PENDING",
    }
    const rsvpStatus = rsvpResponse?.status 
      ? (statusMap[rsvpResponse.status] || rsvpResponse.status)
      : "PENDING"
    const plusOneName = rsvpResponse?.plusOneName || null
    const plusOneUsed = !!plusOneName

    return (
      <EnvelopeLandingWithCode
        partner1Name={wedding.partner1Name}
        partner2Name={wedding.partner2Name}
        weddingDate={weddingDate}
        redirectTo={`/${wedding.slug}`}
        weddingDetails={weddingDetails}
        guest={{
          id: guest.id,
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          phone: guest.phone,
          allowPlusOne: guest.allowPlusOne,
          plusOneUsed,
          plusOneName,
          rsvpStatus,
          inviteToken: guest.inviteToken,
        }}
        couple={{
          id: wedding.id,
          partner1Name: wedding.partner1Name,
          partner2Name: wedding.partner2Name,
          weddingDate: wedding.weddingDate,
          slug: wedding.slug,
          rsvpDeadline: wedding.rsvpDeadline,
          askMealChoice: true, // Default - field doesn't exist in Couple model
          mealOptions: null,
          askSongRequest: true, // Default - field doesn't exist in Couple model
          askBusTransport: false, // Default - field doesn't exist in Couple model
          busRoutes: null,
          maxCapacity: wedding.maxCapacity,
        }}
      />
    )
  }

  // Not a guest token and not a wedding slug
  notFound()
}

