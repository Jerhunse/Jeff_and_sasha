import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET guest portal data
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const guest = await prisma.guest.findUnique({
      where: { inviteToken: token },
      include: {
        couple: {
          select: {
            id: true,
            partner1Name: true,
            partner2Name: true,
            weddingDate: true,
            slug: true,
            venueName: true,
            venueCity: true,
            venueState: true,
          },
        },
        household: true,
        rsvpResponses: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
                startTime: true,
              },
            },
          },
          orderBy: { respondedAt: "desc" },
        },
        invitations: {
          include: {
            campaign: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
          orderBy: { sentAt: "desc" },
        },
        seatingAssignments: {
          include: {
            table: {
              select: {
                id: true,
                name: true,
                seatingChart: {
                  select: {
                    id: true,
                    name: true,
                    event: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!guest) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 })
    }

    return NextResponse.json({
      guest: {
        id: guest.id,
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone,
        allowPlusOne: guest.allowPlusOne,
        plusOnePolicy: guest.plusOnePolicy,
      },
      couple: guest.couple,
      household: guest.household,
      rsvpResponses: guest.rsvpResponses,
      invitations: guest.invitations,
      seating: guest.seatingAssignments,
    })
  } catch (error: any) {
    console.error("Fetch portal data error:", error)
    return NextResponse.json(
      { error: "Failed to fetch portal data" },
      { status: 500 }
    )
  }
}

// PUT update guest profile
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await req.json()

    const { email, phone } = body

    const guest = await prisma.guest.findUnique({
      where: { inviteToken: token },
    })

    if (!guest) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 })
    }

    const updatedGuest = await prisma.guest.update({
      where: { id: guest.id },
      data: {
        email: email !== undefined ? email : undefined,
        phone: phone !== undefined ? phone : undefined,
      },
    })

    // Log activity
    await prisma.guestActivity.create({
      data: {
        guestId: guest.id,
        action: "UPDATED",
        description: "Updated contact information via guest portal",
      },
    })

    return NextResponse.json({
      success: true,
      guest: {
        id: updatedGuest.id,
        firstName: updatedGuest.firstName,
        lastName: updatedGuest.lastName,
        email: updatedGuest.email,
        phone: updatedGuest.phone,
      },
    })
  } catch (error: any) {
    console.error("Update portal data error:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}

