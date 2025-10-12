import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST assign guest to table
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; tableId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { tableId } = await params
    const body = await req.json()
    const { guestId, seatNumber, notes } = body

    // Verify table belongs to user's couple
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        seatingChart: true,
        _count: {
          select: {
            seats: true,
          },
        },
      },
    })

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 })
    }

    if (table.seatingChart.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check capacity
    if (table._count.seats >= table.capacity) {
      return NextResponse.json(
        { error: "Table is at full capacity" },
        { status: 400 }
      )
    }

    // Check if guest already seated
    const existingSeat = await prisma.seat.findFirst({
      where: {
        guestId,
        table: {
          seatingChart: {
            coupleId: session.user.coupleId,
          },
        },
      },
    })

    if (existingSeat) {
      // Update existing seat (move to new table)
      const seat = await prisma.seat.update({
        where: { id: existingSeat.id },
        data: {
          tableId,
          seatNumber: seatNumber !== undefined ? Number(seatNumber) : undefined,
          notes,
        },
        include: {
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })

      return NextResponse.json({ seat })
    }

    // Create new seat assignment
    const seat = await prisma.seat.create({
      data: {
        tableId,
        guestId,
        seatNumber: seatNumber !== undefined ? Number(seatNumber) : null,
        notes,
      },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        coupleId: session.user.coupleId,
        actorId: session.user.id,
        action: "SEATING_UPDATED",
        entityType: "Seat",
        entityId: seat.id,
        description: `Assigned ${seat.guest.firstName} ${seat.guest.lastName} to ${table.name}`,
      },
    })

    return NextResponse.json({ seat }, { status: 201 })
  } catch (error: any) {
    console.error("Create seat error:", error)
    return NextResponse.json(
      { error: "Failed to assign seat" },
      { status: 500 }
    )
  }
}

// DELETE remove guest from table
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; tableId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const seatId = searchParams.get("seatId")

    if (!seatId) {
      return NextResponse.json(
        { error: "Seat ID is required" },
        { status: 400 }
      )
    }

    // Verify seat belongs to user's couple
    const seat = await prisma.seat.findUnique({
      where: { id: seatId },
      include: {
        table: {
          include: {
            seatingChart: true,
          },
        },
      },
    })

    if (!seat) {
      return NextResponse.json({ error: "Seat not found" }, { status: 404 })
    }

    if (seat.table.seatingChart.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.seat.delete({
      where: { id: seatId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete seat error:", error)
    return NextResponse.json(
      { error: "Failed to remove guest from table" },
      { status: 500 }
    )
  }
}

