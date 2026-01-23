import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { prisma } from "@/lib/prisma"
import { SimpleRsvpFormWrapper } from "./rsvp-form-wrapper"
import { Heart } from "lucide-react"

interface RsvpEmailPageProps {
  params: Promise<{ email: string }>
  searchParams: Promise<{ slug?: string }>
}

async function getRsvpByEmail(email: string) {
  try {
    const { data, error } = await supabase
      .from("rsvp")
      .select("*")
      .eq("email", decodeURIComponent(email).toLowerCase())
      .single()

    if (error || !data) {
      return null
    }

    return data
  } catch (error) {
    return null
  }
}

async function getWeddingBySlug(slug: string) {
  try {
    const wedding = await prisma.couple.findUnique({
      where: { slug },
      include: {
        events: {
          where: { visibility: "PUBLIC" },
          orderBy: { startTime: "asc" },
        },
      },
    })
    return wedding
  } catch (error) {
    return null
  }
}

export default async function RsvpEmailPage({ 
  params, 
  searchParams 
}: RsvpEmailPageProps) {
  const { email } = await params
  const { slug } = await searchParams
  const decodedEmail = decodeURIComponent(email)
  
  const rsvp = await getRsvpByEmail(decodedEmail)

  if (!rsvp) {
    notFound()
  }

  // Get wedding info - either from slug or first published wedding
  let wedding = null
  if (slug) {
    wedding = await getWeddingBySlug(slug)
  }
  
  if (!wedding) {
    // Fallback to first published wedding
    wedding = await prisma.couple.findFirst({
      where: { isPublished: true },
      include: {
        events: {
          where: { visibility: "PUBLIC" },
          orderBy: { startTime: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    })
  }

  if (!wedding) {
    notFound()
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 bg-gradient-to-br from-primary/10 via-secondary to-accent/10">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
            <Heart className="h-8 w-8 text-primary fill-primary" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">
            Update Your RSVP
          </h1>
          <p className="text-xl text-muted-foreground">
            {wedding.partner1Name} & {wedding.partner2Name}
          </p>
        </div>

        <SimpleRsvpFormWrapper
          partner1Name={wedding.partner1Name}
          partner2Name={wedding.partner2Name}
          weddingDate={wedding.weddingDate.toISOString()}
          weddingSlug={wedding.slug}
          weddingDetails={{
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
          }}
          initialData={{
            email: rsvp.email,
            firstName: rsvp.first_name,
            lastName: rsvp.last_name,
            isAttending: rsvp.is_attending,
            numberOfGuests: rsvp.number_of_guests,
            plusOneFirstName: rsvp.plus_one_first_name || "",
            plusOneLastName: rsvp.plus_one_last_name || "",
          }}
        />
      </div>
    </div>
  )
}
