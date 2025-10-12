import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PUT update media
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    // Verify media belongs to user's couple
    const existingMedia = await prisma.media.findUnique({
      where: { id },
    })

    if (!existingMedia) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    if (existingMedia.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { alt, caption, tags } = body

    const media = await prisma.media.update({
      where: { id },
      data: {
        alt: alt !== undefined ? alt : undefined,
        caption: caption !== undefined ? caption : undefined,
        tags: tags !== undefined ? tags : undefined,
      },
    })

    return NextResponse.json({ media })
  } catch (error: any) {
    console.error("Update media error:", error)
    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 }
    )
  }
}

// DELETE media
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verify media belongs to user's couple
    const existingMedia = await prisma.media.findUnique({
      where: { id },
    })

    if (!existingMedia) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    if (existingMedia.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Note: In production, also delete from S3/R2
    // await deleteFromStorage(existingMedia.url)

    await prisma.media.delete({
      where: { id },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        coupleId: session.user.coupleId,
        actorId: session.user.id,
        action: "DELETED",
        entityType: "Media",
        entityId: id,
        description: `Deleted media: "${existingMedia.filename}"`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete media error:", error)
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    )
  }
}

