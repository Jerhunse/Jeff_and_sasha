import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart } from "lucide-react"
import { RsvpForm } from "@/components/rsvp/rsvp-form"

interface RsvpPageProps {
  params: Promise<{ code: string }>
}

async function getGuestByCode(code: string) {
  const guest = await prisma.guest.findUnique({
    where: { inviteToken: code },
    include: {
      couple: true,
    },
  })

  return guest
}

export default async function RsvpPage({ params }: RsvpPageProps) {
  const { code } = await params
  const guest = await getGuestByCode(code)

  if (!guest) {
    notFound()
  }

  const wedding = guest.couple

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
        </div>

        <RsvpForm guest={guest} couple={wedding} />

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

