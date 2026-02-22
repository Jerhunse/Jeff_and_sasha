import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST swap two seats within the same table
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
    const { seatId1, seatId2 } = body

    if (!seatId1 || !seatId2) {
      return NextResponse.json(
        { error: "Both seat IDs are required" },
        { status: 400 }
      )
    }

    // Verify both seats exist and belong to the same table
    const [seat1, seat2] = await Promise.all([
      prisma.seat.findUnique({
        where: { id: seatId1 },
        include: {
          table: {
            include: {
              seatingChart: true,
            },
          },
        },
      }),
      prisma.seat.findUnique({
        where: { id: seatId2 },
        include: {
          table: {
            include: {
              seatingChart: true,
            },
          },
        },
      }),
    ])

    if (!seat1 || !seat2) {
      return NextResponse.json({ error: "Seat not found" }, { status: 404 })
    }

    if (seat1.tableId !== tableId || seat2.tableId !== tableId) {
      return NextResponse.json(
        { error: "Both seats must be from the same table" },
        { status: 400 }
      )
    }

    if (
      seat1.table.seatingChart.coupleId !== session.user.coupleId ||
      seat2.table.seatingChart.coupleId !== session.user.coupleId
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Swap seat numbers
    const tempSeatNumber = seat1.seatNumber
    const tempNotes = seat1.notes

    await prisma.$transaction([
      prisma.seat.update({
        where: { id: seatId1 },
        data: {
          seatNumber: seat2.seatNumber,
          notes: seat2.notes,
        },
      }),
      prisma.seat.update({
        where: { id: seatId2 },
        data: {
          seatNumber: tempSeatNumber,
          notes: tempNotes,
        },
      }),
    ])

    // Log activity
    await prisma.activityLog.create({
      data: {
        coupleId: session.user.coupleId,
        actorId: session.user.id,
        action: "SEATING_UPDATED",
        entityType: "Seat",
        entityId: seatId1,
        description: `Swapped seats at ${seat1.table.name}`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Swap seats error:", error)
    return NextResponse.json(
      { error: "Failed to swap seats" },
      { status: 500 }
    )
  }
}
