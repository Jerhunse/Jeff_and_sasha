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
    const { guestId, householdId, seatNumber, notes, force } = body

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

    // Get guest info
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        householdId: true,
      },
    })

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 })
    }

    // Check if guest is already seated (unless force flag is set)
    if (!force) {
      const existingSeat = await prisma.seat.findFirst({
        where: {
          guestId: guest.id,
          table: {
            seatingChart: {
              coupleId: session.user.coupleId,
            },
          },
        },
        include: {
          table: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      if (existingSeat) {
        // Check if trying to add to the same table
        if (existingSeat.tableId === tableId) {
          return NextResponse.json(
            { 
              error: "ALREADY_AT_TABLE",
              message: "Guest already assigned to this table",
            },
            { status: 409 }
          )
        }

        // Return conflict info for frontend confirmation
        return NextResponse.json(
          {
            error: "ALREADY_SEATED",
            currentTable: existingSeat.table.name,
            currentTableId: existingSeat.tableId,
            guests: [{
              name: `${guest.firstName} ${guest.lastName}`,
              currentTable: existingSeat.table.name,
            }],
          },
          { status: 409 }
        )
      }
    }

    // Check capacity
    const availableSeats = table.capacity - table._count.seats
    
    if (1 > availableSeats) {
      return NextResponse.json(
        {
          error: `Insufficient capacity. Table is full (${table._count.seats}/${table.capacity})`,
          needed: 1,
          available: availableSeats,
        },
        { status: 400 }
      )
    }

    // If force flag is set, remove existing seat assignment
    if (force) {
      await prisma.seat.deleteMany({
        where: {
          guestId: guest.id,
          table: {
            seatingChart: {
              coupleId: session.user.coupleId,
            },
          },
        },
      })
    }

    // Create seat for guest
    const seat = await prisma.seat.create({
      data: {
        tableId,
        guestId: guest.id,
        seatNumber: seatNumber !== undefined ? Number(seatNumber) : null,
        notes,
      },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            allowPlusOne: true,
            rsvpResponses: {
              select: {
                status: true,
                plusOneName: true,
              },
              take: 1,
            },
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
        description: `Assigned ${guest.firstName} ${guest.lastName} to ${table.name}`,
      },
    })

    return NextResponse.json({ seats: [seat] }, { status: 201 })
  } catch (error: any) {
    console.error("Create seat error:", error)
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
    })
    
    // Handle specific Prisma errors
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: "Guest is already assigned to this seat" },
        { status: 409 }
      )
    }
    
    if (error?.code === 'P1001' || error?.code === 'P1017') {
      return NextResponse.json(
        { error: "Database connection error. Please try again." },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { 
        error: "Failed to assign seat",
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}

// PATCH update a seat's position (seatNumber) and/or notes (e.g. move to empty slot)
export async function PATCH(
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
    const { seatId, seatNumber, notes } = body

    if (!seatId) {
      return NextResponse.json(
        { error: "Seat ID is required" },
        { status: 400 }
      )
    }

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

    if (seat.tableId !== tableId) {
      return NextResponse.json(
        { error: "Seat does not belong to this table" },
        { status: 400 }
      )
    }

    if (seat.table.seatingChart.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updateData: { seatNumber?: number | null; notes?: string | null } = {}
    if (seatNumber !== undefined) updateData.seatNumber = seatNumber === null ? null : Number(seatNumber)
    if (notes !== undefined) updateData.notes = notes === null ? null : notes

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 })
    }

    await prisma.seat.update({
      where: { id: seatId },
      data: updateData,
    })

    await prisma.activityLog.create({
      data: {
        coupleId: session.user.coupleId,
        actorId: session.user.id,
        action: "SEATING_UPDATED",
        entityType: "Seat",
        entityId: seatId,
        description: `Moved seat at ${seat.table.name}`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Update seat error:", error)
    return NextResponse.json(
      { error: "Failed to update seat" },
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
