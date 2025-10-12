import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST create table in seating chart
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: seatingChartId } = await params
    const body = await req.json()
    const { name, capacity, shape, x, y } = body

    // Verify seating chart belongs to user's couple
    const seatingChart = await prisma.seatingChart.findUnique({
      where: { id: seatingChartId },
    })

    if (!seatingChart) {
      return NextResponse.json(
        { error: "Seating chart not found" },
        { status: 404 }
      )
    }

    if (seatingChart.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (!name || !capacity) {
      return NextResponse.json(
        { error: "Name and capacity are required" },
        { status: 400 }
      )
    }

    const table = await prisma.table.create({
      data: {
        seatingChartId,
        name,
        capacity: Number(capacity),
        shape: shape || "round",
        x: x !== undefined ? Number(x) : null,
        y: y !== undefined ? Number(y) : null,
      },
    })

    return NextResponse.json({ table }, { status: 201 })
  } catch (error: any) {
    console.error("Create table error:", error)
    return NextResponse.json(
      { error: "Failed to create table" },
      { status: 500 }
    )
  }
}

