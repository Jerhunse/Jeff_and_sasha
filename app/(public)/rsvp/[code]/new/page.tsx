import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Heart } from "lucide-react"
import { RsvpForm } from "@/components/rsvp/rsvp-form"
import { CountdownTimer } from "@/components/wedding/countdown-timer"

interface RsvpNewPageProps {
  params: Promise<{ code: string }>
}

/**
 * RSVP form with no code required. The `code` param is the wedding slug.
 * Linked from the RSVP choice page ("RSVP now").
 */
export default async function RsvpNewPage({ params }: RsvpNewPageProps) {
  const { code } = await params

  const wedding = await prisma.couple.findUnique({
    where: { slug: code, isPublished: true },
    include: {
      events: {
        where: { visibility: "PUBLIC" },
        orderBy: { startTime: "asc" },
      },
    },
  })

  if (!wedding) {
    notFound()
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
            <Heart className="h-8 w-8 text-gold fill-gold" />
          </div>
          <h1 className="font-cursive text-4xl md:text-5xl text-black mb-2">
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
            askMealChoice: true,
            mealOptions: null,
            askSongRequest: true,
            askBusTransport: false,
            busRoutes: null,
            maxCapacity: wedding.maxCapacity,
          }}
          isNewGuest={true}
          sharedCode={wedding.slug}
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Have questions? Visit our{" "}
            <a
              href={`/${wedding.slug}`}
              className="text-gold hover:underline font-medium"
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
