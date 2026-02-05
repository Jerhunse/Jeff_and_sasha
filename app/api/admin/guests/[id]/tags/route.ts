import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

// Add tag to guest
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: guestId } = await context.params
    const { tagId } = await request.json()

    if (!tagId) {
      return NextResponse.json({ error: "Tag ID is required" }, { status: 400 })
    }

    // Verify guest belongs to this couple
    const guest = await prisma.guest.findFirst({
      where: { id: guestId, coupleId: session.user.coupleId },
    })

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 })
    }

    // Verify tag belongs to this couple
    const tag = await prisma.tag.findFirst({
      where: { id: tagId, coupleId: session.user.coupleId },
    })

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 })
    }

    // Check if tag is already assigned
    const existingGuestTag = await prisma.guestTag.findUnique({
      where: {
        guestId_tagId: {
          guestId,
          tagId,
        },
      },
    })

    if (existingGuestTag) {
      return NextResponse.json(
        { error: "Tag already assigned to this guest" },
        { status: 409 }
      )
    }

    // Create the guest tag relationship
    const guestTag = await prisma.guestTag.create({
      data: {
        guestId,
        tagId,
        addedBy: session.user.id,
      },
      include: {
        tag: true,
      },
    })

    return NextResponse.json({ success: true, guestTag })
  } catch (error: any) {
    console.error("Error adding tag to guest:", error)
    return NextResponse.json(
      { error: error.message || "Failed to add tag to guest" },
      { status: 500 }
    )
  }
}

// Remove tag from guest
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: guestId } = await context.params
    const tagId = request.nextUrl.searchParams.get("tagId")

    if (!tagId) {
      return NextResponse.json({ error: "Tag ID is required" }, { status: 400 })
    }

    // Verify guest belongs to this couple
    const guest = await prisma.guest.findFirst({
      where: { id: guestId, coupleId: session.user.coupleId },
    })

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 })
    }

    // Find and delete the guest tag relationship
    const guestTag = await prisma.guestTag.findUnique({
      where: {
        guestId_tagId: {
          guestId,
          tagId,
        },
      },
    })

    if (!guestTag) {
      return NextResponse.json(
        { error: "Tag not assigned to this guest" },
        { status: 404 }
      )
    }

    await prisma.guestTag.delete({
      where: {
        id: guestTag.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error removing tag from guest:", error)
    return NextResponse.json(
      { error: error.message || "Failed to remove tag from guest" },
      { status: 500 }
    )
  }
}

// Get all tags for a guest
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: guestId } = await context.params

    // Verify guest belongs to this couple
    const guest = await prisma.guest.findFirst({
      where: { id: guestId, coupleId: session.user.coupleId },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 })
    }

    return NextResponse.json({ tags: guest.tags })
  } catch (error: any) {
    console.error("Error fetching guest tags:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch guest tags" },
      { status: 500 }
    )
  }
}
