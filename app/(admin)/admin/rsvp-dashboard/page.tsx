import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { RSVPDashboardClient } from "./rsvp-dashboard-client"

export default async function RSVPDashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Check if user has admin access (OWNER or COLLABORATOR)
  if (session.user.role !== "OWNER" && session.user.role !== "COLLABORATOR") {
    redirect("/")
  }

  // Get the couple ID
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { coupleId: true }
  })

  if (!user?.coupleId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No wedding site found for your account.</p>
      </div>
    )
  }

  // Fetch couple info
  const couple = await prisma.couple.findUnique({
    where: { id: user.coupleId },
    select: {
      id: true,
      partner1Name: true,
      partner2Name: true,
      weddingDate: true,
      slug: true,
      primaryColor: true,
      secondaryColor: true
    }
  })

  if (!couple) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Wedding not found.</p>
      </div>
    )
  }

  // Fetch initial guest data with RSVP responses
  const guests = await prisma.guest.findMany({
    where: { coupleId: couple.id },
    include: {
      rsvpResponses: {
        orderBy: { respondedAt: 'desc' },
        take: 1
      }
    },
    orderBy: { lastName: 'asc' }
  })

  return <RSVPDashboardClient initialGuests={guests} couple={couple} />
}
