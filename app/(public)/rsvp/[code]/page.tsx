import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Mail, Key } from "lucide-react"
import { RsvpForm } from "@/components/rsvp/rsvp-form"
import { RsvpLookupForm } from "./rsvp-lookup-form"
import { EnvelopeLandingWithCode } from "@/components/wedding/envelope-landing-with-code"
import { CountdownTimer } from "@/components/wedding/countdown-timer"

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
  
  // Check for special shared code "sj2026"
  if (code.toLowerCase() === "sj2026") {
    // Get the first published wedding for the shared code
    const wedding = await prisma.couple.findFirst({
      where: { isPublished: true },
      include: {
        events: {
          where: { visibility: "PUBLIC" },
          orderBy: { startTime: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    if (!wedding) {
      notFound()
    }

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

    // Show new RSVP form (not pre-populated)
    return (
      <div className="min-h-screen flex items-center justify-center py-16 px-4 bg-gradient-to-br from-primary/10 via-secondary to-accent/10">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
              <Heart className="h-8 w-8 text-primary fill-primary" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">
              RSVP
            </h1>
            <p className="text-xl text-muted-foreground">
              {wedding.partner1Name} & {wedding.partner2Name}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {new Date(wedding.weddingDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <div className="mt-4">
              <CountdownTimer targetDate={wedding.weddingDate} compact />
            </div>
          </div>

          <RsvpForm 
            guest={null}
            couple={{
              id: wedding.id,
              partner1Name: wedding.partner1Name,
              partner2Name: wedding.partner2Name,
              weddingDate: wedding.weddingDate,
              slug: wedding.slug,
              rsvpDeadline: wedding.rsvpDeadline,
              askMealChoice: wedding.askMealChoice,
              mealOptions: wedding.mealOptions,
              askSongRequest: wedding.askSongRequest,
              askBusTransport: wedding.askBusTransport,
              busRoutes: wedding.busRoutes,
              maxCapacity: wedding.maxCapacity,
            }}
            isNewGuest={true}
            sharedCode="sj2026"
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Have questions? Visit our{" "}
              <a
                href={`/${wedding.slug}`}
                className="text-primary hover:underline font-medium"
              >
                wedding website
              </a>{" "}
              for more details.
            </p>
          </div>
        </div>
      </div>
    )
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
          askMealChoice: wedding.askMealChoice,
          mealOptions: wedding.mealOptions,
          askSongRequest: wedding.askSongRequest,
          askBusTransport: wedding.askBusTransport,
          busRoutes: wedding.busRoutes,
          maxCapacity: wedding.maxCapacity,
        }}
      />
    )
  }

  // If not a guest token, check if it's a wedding slug
  const wedding = await getWeddingBySlug(code)
  
  if (wedding) {
    // It's a wedding slug - show the lookup form
    return <RsvpLookupForm slug={code} />
  }

  // Neither a guest token nor a wedding slug - 404
  notFound()
}

