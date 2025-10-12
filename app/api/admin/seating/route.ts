import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET all seating charts for a couple
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get("eventId")

    const where: any = {
      coupleId: session.user.coupleId,
    }

    if (eventId) {
      where.eventId = eventId
    }

    const seatingCharts = await prisma.seatingChart.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
        tables: {
          include: {
            seats: {
              include: {
                guest: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    rsvpResponses: {
                      select: {
                        answersJSON: true,
                      },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            tables: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ seatingCharts })
  } catch (error: any) {
    console.error("Fetch seating charts error:", error)
    return NextResponse.json(
      { error: "Failed to fetch seating charts" },
      { status: 500 }
    )
  }
}

// POST create new seating chart
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, eventId } = body

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    const seatingChart = await prisma.seatingChart.create({
      data: {
        coupleId: session.user.coupleId,
        name,
        description,
        eventId: eventId || null,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        coupleId: session.user.coupleId,
        actorId: session.user.id,
        action: "CREATED",
        entityType: "SeatingChart",
        entityId: seatingChart.id,
        description: `Created seating chart: "${name}"`,
      },
    })

    return NextResponse.json({ seatingChart }, { status: 201 })
  } catch (error: any) {
    console.error("Create seating chart error:", error)
    return NextResponse.json(
      { error: "Failed to create seating chart" },
      { status: 500 }
    )
  }
}

