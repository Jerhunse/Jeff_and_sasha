import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart } from "lucide-react"

interface RsvpPageProps {
  params: Promise<{ code: string }>
}

async function getGuestByCode(code: string) {
  const guest = await prisma.guest.findUnique({
    where: { inviteCode: code },
    include: {
      wedding: {
        select: {
          partner1Name: true,
          partner2Name: true,
          weddingDate: true,
          slug: true,
          rsvpDeadline: true,
        },
      },
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

  const wedding = guest.wedding

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 bg-gradient-to-br from-primary/10 via-secondary to-accent/10 bg-floral-pattern">
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

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">
              Welcome, {guest.firstName} {guest.lastName}!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {guest.rsvpStatus === "ATTENDING" ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                <Badge variant="default" className="mb-2">Confirmed</Badge>
                <p className="font-medium">You've already RSVPed!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  We're so excited to celebrate with you!
                </p>
              </div>
            ) : guest.rsvpStatus === "DECLINED" ? (
              <div className="bg-muted border rounded-lg p-6 text-center">
                <Badge variant="secondary" className="mb-2">Declined</Badge>
                <p className="font-medium">You've declined this invitation</p>
                <p className="text-sm text-muted-foreground mt-2">
                  We'll miss you! If your plans change, please reach out.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-lg mb-6">
                  RSVP form coming soon! We'll send you a link to respond to your invitation.
                </p>
                {wedding.rsvpDeadline && (
                  <p className="text-sm text-muted-foreground">
                    Please respond by{" "}
                    {new Date(wedding.rsvpDeadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            <div className="border-t pt-6">
              <p className="text-sm text-muted-foreground text-center">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

