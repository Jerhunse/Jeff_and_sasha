import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const households = await prisma.household.findMany({
      where: { coupleId: session.user.coupleId },
      include: {
        _count: {
          select: { guests: true },
        },
        guests: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
          take: 10,
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ households })
  } catch (error) {
    console.error("Error fetching households:", error)
    return NextResponse.json(
      { error: "Failed to fetch households" },
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
    const { name, maxGuests, notes } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Household name is required" },
        { status: 400 }
      )
    }

    const household = await prisma.household.create({
      data: {
        coupleId: session.user.coupleId,
        name: name.trim(),
        maxGuests: maxGuests || null,
        notes: notes?.trim() || null,
      },
    })

    return NextResponse.json({ success: true, household })
  } catch (error: any) {
    console.error("Error creating household:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create household" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const householdId = request.nextUrl.searchParams.get("id")
    if (!householdId) {
      return NextResponse.json(
        { error: "Household ID is required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, maxGuests, notes } = body

    // Verify household belongs to this couple
    const existing = await prisma.household.findFirst({
      where: { id: householdId, coupleId: session.user.coupleId },
    })

    if (!existing) {
      return NextResponse.json({ error: "Household not found" }, { status: 404 })
    }

    const household = await prisma.household.update({
      where: { id: householdId },
      data: {
        ...(name && { name: name.trim() }),
        ...(maxGuests !== undefined && { maxGuests: maxGuests || null }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
      },
    })

    return NextResponse.json({ success: true, household })
  } catch (error: any) {
    console.error("Error updating household:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update household" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const householdId = request.nextUrl.searchParams.get("id")
    if (!householdId) {
      return NextResponse.json(
        { error: "Household ID is required" },
        { status: 400 }
      )
    }

    // Verify household belongs to this couple
    const household = await prisma.household.findFirst({
      where: { id: householdId, coupleId: session.user.coupleId },
    })

    if (!household) {
      return NextResponse.json({ error: "Household not found" }, { status: 404 })
    }

    // Unlink guests from household before deleting
    await prisma.guest.updateMany({
      where: { householdId },
      data: { householdId: null },
    })

    await prisma.household.delete({ where: { id: householdId } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting household:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete household" },
      { status: 500 }
    )
  }
}
