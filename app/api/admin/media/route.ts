import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET all media for a couple
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const tag = searchParams.get("tag")
    const search = searchParams.get("search")

    const where: any = {
      coupleId: session.user.coupleId,
    }

    if (tag) {
      where.tags = {
        has: tag,
      }
    }

    if (search) {
      where.OR = [
        { filename: { contains: search, mode: "insensitive" } },
        { caption: { contains: search, mode: "insensitive" } },
        { alt: { contains: search, mode: "insensitive" } },
      ]
    }

    const media = await prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ media })
  } catch (error: any) {
    console.error("Fetch media error:", error)
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    )
  }
}

// POST create media record (after upload)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { url, thumbnailUrl, filename, mimeType, size, width, height, alt, caption, tags } = body

    if (!url || !filename) {
      return NextResponse.json(
        { error: "URL and filename are required" },
        { status: 400 }
      )
    }

    const media = await prisma.media.create({
      data: {
        coupleId: session.user.coupleId,
        url,
        thumbnailUrl,
        filename,
        mimeType: mimeType || "image/jpeg",
        size: size || 0,
        width,
        height,
        alt,
        caption,
        tags: tags || [],
        uploadedBy: session.user.id,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        coupleId: session.user.coupleId,
        actorId: session.user.id,
        action: "CREATED",
        entityType: "Media",
        entityId: media.id,
        description: `Uploaded media: "${filename}"`,
      },
    })

    return NextResponse.json({ media }, { status: 201 })
  } catch (error: any) {
    console.error("Create media error:", error)
    return NextResponse.json(
      { error: "Failed to create media record" },
      { status: 500 }
    )
  }
}

