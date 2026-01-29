import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all guests with invitation data
    const guests = await prisma.guest.findMany({
      where: { coupleId: session.user.coupleId },
      include: {
        invitations: {
          orderBy: { createdAt: "desc" },
        },
        household: true,
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    })

    // Fetch all RSVP responses for these guests
    const rsvpResponses = await prisma.rSVPResponse.findMany({
      where: {
        coupleId: session.user.coupleId,
        guestId: { in: guests.map(g => g.id) },
        eventId: null,
      },
      orderBy: { respondedAt: "desc" },
    })

    // Create a map of guestId -> RSVP response
    const rsvpMap = new Map(rsvpResponses.map(r => [r.guestId, r]))

    // Generate CSV
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Household",
      "RSVP Status",
      "Save the Date Sent",
      "Save the Date Opened",
      "Invitation Sent",
      "Invitation Viewed",
      "Last Invitation Status",
      "Meal Choice",
      "Dietary Restrictions",
      "Song Request",
      "Bus Required",
      "Plus One Allowed",
      "Plus One Name",
    ]

    const rows = guests.map((guest) => {
      const lastInvitation = guest.invitations[0]
      const rsvpResponse = rsvpMap.get(guest.id)

      // Find save the date and invitation from invitations
      const saveTheDateInv = guest.invitations.find(inv => {
        const metadata = inv.metadata ? JSON.parse(inv.metadata) : {}
        return metadata.type === "SAVE_THE_DATE"
      })
      const regularInv = guest.invitations.find(inv => {
        const metadata = inv.metadata ? JSON.parse(inv.metadata) : {}
        return metadata.type === "INVITATION" || !metadata.type
      })

      const answers = rsvpResponse?.answersJSON ? JSON.parse(rsvpResponse.answersJSON) : {}

      return [
        guest.firstName,
        guest.lastName,
        guest.email || "",
        guest.phone || "",
        guest.household?.name || "",
        rsvpResponse?.status || "PENDING",
        saveTheDateInv?.sentAt
          ? new Date(saveTheDateInv.sentAt).toLocaleDateString()
          : "",
        saveTheDateInv?.openedAt
          ? new Date(saveTheDateInv.openedAt).toLocaleDateString()
          : "",
        regularInv?.sentAt
          ? new Date(regularInv.sentAt).toLocaleDateString()
          : "",
        regularInv?.openedAt
          ? new Date(regularInv.openedAt).toLocaleDateString()
          : "",
        lastInvitation?.status || "",
        answers.mealChoice || "",
        answers.dietaryRestrictions || "",
        answers.songRequest || "",
        answers.busRequired ? "Yes" : "No",
        guest.allowPlusOne ? "Yes" : "No",
        rsvpResponse?.plusOneName || "",
      ]
    })

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escape quotes and wrap in quotes if contains comma
            const cellStr = String(cell)
            if (cellStr.includes(",") || cellStr.includes('"')) {
              return `"${cellStr.replace(/"/g, '""')}"`
            }
            return cellStr
          })
          .join(",")
      ),
    ].join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="guest-invitations-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error: any) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    )
  }
}

