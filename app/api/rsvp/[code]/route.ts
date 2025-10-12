import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await req.json()

    // Find the guest
    const guest = await prisma.guest.findUnique({
      where: { inviteToken: code },
      include: {
        couple: true,
      },
    })

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 })
    }

    const {
      status,
      email,
      phone,
      mealChoice,
      dietaryRestrictions,
      songRequest,
      busRequired,
      busRoute,
      message,
      hasPlusOne,
      plusOneName,
      plusOneEmail,
      plusOneMealChoice,
      plusOneDietary,
    } = body

    // Validate status
    if (!["ATTENDING", "DECLINED", "MAYBE"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Check capacity if accepting
    if (status === "ATTENDING" && guest.couple.maxCapacity) {
      const currentAttending = await prisma.guest.count({
        where: {
          coupleId: guest.coupleId,
          rsvpStatus: "ATTENDING",
        },
      })

      const additionalGuests = hasPlusOne ? 2 : 1
      if (currentAttending + additionalGuests > guest.couple.maxCapacity) {
        return NextResponse.json(
          { error: "Sorry, we've reached maximum capacity" },
          { status: 400 }
        )
      }
    }

    // Check plus one policy
    if (hasPlusOne && !guest.allowPlusOne) {
      return NextResponse.json(
        { error: "Plus ones are not allowed for this guest" },
        { status: 400 }
      )
    }

    if (hasPlusOne && !plusOneName) {
      return NextResponse.json(
        { error: "Plus one name is required" },
        { status: 400 }
      )
    }

    // Update guest
    await prisma.guest.update({
      where: { id: guest.id },
      data: {
        rsvpStatus: status,
        rsvpDate: new Date(),
        email: email || guest.email,
        phone: phone || guest.phone,
        mealChoice: mealChoice || null,
        dietaryRestrictions: dietaryRestrictions || null,
        songRequest: songRequest || null,
        busRequired: busRequired || false,
        busRoute: busRoute || null,
        plusOneUsed: hasPlusOne,
        plusOneName: plusOneName || null,
        plusOneEmail: plusOneEmail || null,
      },
    })

    // Create RSVP response record
    await prisma.rsvpResponse.create({
      data: {
        coupleId: guest.coupleId,
        guestId: guest.id,
        status,
        message: message || null,
      },
    })

    // Create a virtual "guest" for the plus one if needed (storing in notes)
    if (hasPlusOne && plusOneName) {
      // Store plus one details in guest notes
      const plusOneDetails = {
        name: plusOneName,
        email: plusOneEmail,
        mealChoice: plusOneMealChoice,
        dietaryRestrictions: plusOneDietary,
      }

      await prisma.guest.update({
        where: { id: guest.id },
        data: {
          notes: guest.notes
            ? `${guest.notes}\n\nPlus One: ${JSON.stringify(plusOneDetails, null, 2)}`
            : `Plus One: ${JSON.stringify(plusOneDetails, null, 2)}`,
        },
      })
    }

    // Log activity
    await prisma.guestActivity.create({
      data: {
        guestId: guest.id,
        type: "RSVP_CHANGED",
        description: `RSVP status changed to ${status}`,
      },
    })

    // Update invitation status to REPLIED if exists
    await prisma.invitation.updateMany({
      where: {
        guestId: guest.id,
        status: { in: ["SENT", "OPENED"] },
      },
      data: {
        status: "REPLIED",
      },
    })

    return NextResponse.json({
      success: true,
      message: "RSVP submitted successfully",
    })
  } catch (error: any) {
    console.error("RSVP submission error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to submit RSVP" },
      { status: 500 }
    )
  }
}

