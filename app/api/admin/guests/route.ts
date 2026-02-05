import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin access
    if (session.user.role !== "OWNER" && session.user.role !== "COLLABORATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const coupleId = searchParams.get("coupleId")

    if (!coupleId) {
      return NextResponse.json({ error: "Couple ID required" }, { status: 400 })
    }

    // Verify user has access to this couple
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coupleId: true }
    })

    if (user?.coupleId !== coupleId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch guests with RSVP responses
    const guests = await prisma.guest.findMany({
      where: { coupleId },
      include: {
        rsvpResponses: {
          orderBy: { respondedAt: 'desc' },
          take: 1
        }
      },
      orderBy: { lastName: 'asc' }
    })

    return NextResponse.json({ guests })
  } catch (error) {
    console.error("Error fetching guests:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      isChild = false,
      isVIP = false,
      allowPlusOne = false,
      maxGuestsAllowed = 1,
      notes,
    } = body

    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      )
    }

    const guest = await prisma.guest.create({
      data: {
        coupleId: session.user.coupleId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        isChild,
        isVIP,
        allowPlusOne,
        maxGuestsAllowed: maxGuestsAllowed || 1,
        notes: notes?.trim() || null,
        importSource: "manual",
      },
    })

    // Log activity
    await prisma.guestActivity.create({
      data: {
        guestId: guest.id,
        action: "CREATED",
        description: `Guest ${firstName} ${lastName} added manually`,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true, guest })
  } catch (error: any) {
    console.error("Error creating guest:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create guest" },
      { status: 500 }
    )
  }
}
