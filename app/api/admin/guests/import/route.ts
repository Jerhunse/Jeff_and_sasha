import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { guests } = await request.json()

    if (!Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json({ error: "Invalid guest data" }, { status: 400 })
    }

    // Create guests in database
    const createdGuests = await prisma.$transaction(
      guests.map((guest: any) =>
        prisma.guest.create({
          data: {
            coupleId: session.user.coupleId!,
            firstName: guest.firstName,
            lastName: guest.lastName,
            email: guest.email || undefined,
            phone: guest.phone || undefined,
            importSource: "csv",
            importedAt: new Date(),
            originalData: JSON.stringify(guest),
          },
        })
      )
    )

    // Log activity for each guest
    await prisma.guestActivity.createMany({
      data: createdGuests.map((guest) => ({
        guestId: guest.id,
        action: "IMPORTED",
        description: `Guest imported from CSV`,
        userId: session.user.id,
        userName: session.user.name || session.user.email,
      })),
    })

    return NextResponse.json({
      success: true,
      count: createdGuests.length,
      guests: createdGuests,
    })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json(
      { error: "Failed to import guests" },
      { status: 500 }
    )
  }
}

