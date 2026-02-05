import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tags = await prisma.tag.findMany({
      where: { coupleId: session.user.coupleId },
      include: {
        _count: {
          select: { guests: true },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ tags })
  } catch (error) {
    console.error("Error fetching tags:", error)
    return NextResponse.json(
      { error: "Failed to fetch tags" },
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
    const { name, color = "#6b9c7f", description } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: "Tag name is required" }, { status: 400 })
    }

    // Check for duplicate name
    const existing = await prisma.tag.findUnique({
      where: {
        coupleId_name: {
          coupleId: session.user.coupleId,
          name: name.trim(),
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "A tag with this name already exists" }, { status: 409 })
    }

    const tag = await prisma.tag.create({
      data: {
        coupleId: session.user.coupleId,
        name: name.trim(),
        color,
        description: description?.trim() || null,
      },
    })

    return NextResponse.json({ success: true, tag })
  } catch (error: any) {
    console.error("Error creating tag:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create tag" },
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

    const tagId = request.nextUrl.searchParams.get("id")
    if (!tagId) {
      return NextResponse.json({ error: "Tag ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const { name, color, description } = body

    // Verify tag belongs to this couple
    const existingTag = await prisma.tag.findFirst({
      where: { id: tagId, coupleId: session.user.coupleId },
    })

    if (!existingTag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 })
    }

    // Check for duplicate name (excluding current tag)
    if (name && name.trim() !== existingTag.name) {
      const duplicate = await prisma.tag.findUnique({
        where: {
          coupleId_name: {
            coupleId: session.user.coupleId,
            name: name.trim(),
          },
        },
      })

      if (duplicate) {
        return NextResponse.json(
          { error: "A tag with this name already exists" },
          { status: 409 }
        )
      }
    }

    const tag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        ...(name && { name: name.trim() }),
        ...(color && { color }),
        ...(description !== undefined && { description: description?.trim() || null }),
      },
    })

    return NextResponse.json({ success: true, tag })
  } catch (error: any) {
    console.error("Error updating tag:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update tag" },
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

    const tagId = request.nextUrl.searchParams.get("id")
    if (!tagId) {
      return NextResponse.json({ error: "Tag ID is required" }, { status: 400 })
    }

    // Verify tag belongs to this couple
    const tag = await prisma.tag.findFirst({
      where: { id: tagId, coupleId: session.user.coupleId },
    })

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 })
    }

    await prisma.tag.delete({ where: { id: tagId } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting tag:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete tag" },
      { status: 500 }
    )
  }
}
