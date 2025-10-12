import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET all hotel blocks for a couple
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hotels = await prisma.hotelBlock.findMany({
      where: { coupleId: session.user.coupleId },
      orderBy: { order: "asc" },
    })

    return NextResponse.json({ hotels })
  } catch (error: any) {
    console.error("Fetch hotels error:", error)
    return NextResponse.json(
      { error: "Failed to fetch hotel blocks" },
      { status: 500 }
    )
  }
}

// POST create new hotel block
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      name,
      description,
      address,
      city,
      state,
      zip,
      phone,
      website,
      code,
      startDate,
      endDate,
      deadline,
      specialRate,
      mapPin,
      distanceFromVenue,
      amenities,
      order,
    } = body

    if (!name) {
      return NextResponse.json(
        { error: "Hotel name is required" },
        { status: 400 }
      )
    }

    // Get next order if not specified
    let hotelOrder = order
    if (hotelOrder === undefined) {
      const lastHotel = await prisma.hotelBlock.findFirst({
        where: { coupleId: session.user.coupleId },
        orderBy: { order: "desc" },
      })
      hotelOrder = lastHotel ? lastHotel.order + 1 : 0
    }

    const hotel = await prisma.hotelBlock.create({
      data: {
        coupleId: session.user.coupleId,
        name,
        description,
        address,
        city,
        state,
        zip,
        phone,
        website,
        code,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        deadline: deadline ? new Date(deadline) : null,
        specialRate,
        mapPin,
        distanceFromVenue,
        amenities,
        order: hotelOrder,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        coupleId: session.user.coupleId,
        actorId: session.user.id,
        action: "CREATED",
        entityType: "HotelBlock",
        entityId: hotel.id,
        description: `Created hotel block: "${name}"`,
      },
    })

    return NextResponse.json({ hotel }, { status: 201 })
  } catch (error: any) {
    console.error("Create hotel error:", error)
    return NextResponse.json(
      { error: "Failed to create hotel block" },
      { status: 500 }
    )
  }
}

