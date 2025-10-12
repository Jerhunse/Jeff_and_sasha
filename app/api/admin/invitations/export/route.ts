import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.weddingId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all guests with invitation data
    const guests = await prisma.guest.findMany({
      where: { weddingId: session.user.weddingId },
      include: {
        invitations: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        household: true,
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    })

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

      return [
        guest.firstName,
        guest.lastName,
        guest.email || "",
        guest.phone || "",
        guest.household?.name || "",
        guest.rsvpStatus,
        guest.saveTheDateSent
          ? new Date(guest.saveTheDateSent).toLocaleDateString()
          : "",
        guest.saveTheDateOpened
          ? new Date(guest.saveTheDateOpened).toLocaleDateString()
          : "",
        guest.inviteSent
          ? new Date(guest.inviteSent).toLocaleDateString()
          : "",
        guest.inviteViewed
          ? new Date(guest.inviteViewed).toLocaleDateString()
          : "",
        lastInvitation?.status || "",
        guest.mealChoice || "",
        guest.dietaryRestrictions || "",
        guest.songRequest || "",
        guest.busRequired ? "Yes" : "No",
        guest.allowPlusOne ? "Yes" : "No",
        guest.plusOneName || "",
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

