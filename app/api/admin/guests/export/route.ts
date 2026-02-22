import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function escapeCSV(value: string | null | undefined): string {
  if (!value) return ""
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const format = request.nextUrl.searchParams.get("format") || "csv"

    const guests = await prisma.guest.findMany({
      where: { coupleId: session.user.coupleId },
      include: {
        household: true,
        tags: {
          include: { tag: true },
        },
        rsvpResponses: {
          where: { eventId: null },
          orderBy: { respondedAt: "desc" },
          take: 1,
        },
        address: true,
        parentGuest: {
          select: { id: true, firstName: true, lastName: true },
        },
        plusOnes: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    })

    if (format === "rsvp") {
      // RSVP Summary export
      const headers = [
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "RSVP Status",
        "Responded At",
        "Message",
        "Plus One Name",
        "Party Size",
        "Household",
        "Tags",
      ]

      const rows = guests.map((guest) => {
        const rsvp = guest.rsvpResponses[0]
        const statusMap: Record<string, string> = {
          YES: "Attending",
          NO: "Declined",
          MAYBE: "Maybe",
        }

        return [
          escapeCSV(guest.firstName),
          escapeCSV(guest.lastName),
          escapeCSV(guest.email),
          escapeCSV(guest.phone),
          rsvp ? statusMap[rsvp.status] || "Pending" : "Pending",
          rsvp?.respondedAt
            ? new Date(rsvp.respondedAt).toLocaleDateString()
            : "",
          escapeCSV(rsvp?.message),
          escapeCSV(rsvp?.plusOneName),
          String(guest.maxGuestsAllowed),
          escapeCSV(guest.household?.name),
          escapeCSV(guest.tags.map((t) => t.tag.name).join("; ")),
        ].join(",")
      })

      const csv = [headers.join(","), ...rows].join("\n")

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="rsvp-summary-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    // Full guest list CSV export
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Household",
      "Is Child",
      "Is VIP",
      "Allow Plus One",
      "Party Size",
      "RSVP Status",
      "Tags",
      "Invite Code",
      "Notes",
      "Address Line 1",
      "City",
      "State",
      "ZIP",
      "Parent Guest",
      "Plus Ones",
    ]

    const rows = guests.map((guest) => {
      const rsvp = guest.rsvpResponses[0]
      const statusMap: Record<string, string> = {
        YES: "Attending",
        NO: "Declined",
        MAYBE: "Maybe",
      }

      return [
        escapeCSV(guest.firstName),
        escapeCSV(guest.lastName),
        escapeCSV(guest.email),
        escapeCSV(guest.phone),
        escapeCSV(guest.household?.name),
        guest.isChild ? "Yes" : "No",
        guest.isVIP ? "Yes" : "No",
        guest.allowPlusOne ? "Yes" : "No",
        String(guest.maxGuestsAllowed),
        rsvp ? statusMap[rsvp.status] || "Pending" : "Pending",
        escapeCSV(guest.tags.map((t) => t.tag.name).join("; ")),
        escapeCSV(guest.inviteToken),
        escapeCSV(guest.notes),
        escapeCSV(guest.address?.line1),
        escapeCSV(guest.address?.city),
        escapeCSV(guest.address?.state),
        escapeCSV(guest.address?.postal),
        escapeCSV(guest.parentGuest ? `${guest.parentGuest.firstName} ${guest.parentGuest.lastName}` : ""),
        escapeCSV(guest.plusOnes.map((po) => `${po.firstName} ${po.lastName}`).join("; ")),
      ].join(",")
    })

    const csv = [headers.join(","), ...rows].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="guest-list-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error: any) {
    console.error("Error exporting guests:", error)
    return NextResponse.json(
      { error: error.message || "Failed to export guests" },
      { status: 500 }
    )
  }
}
