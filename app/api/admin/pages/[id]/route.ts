import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET single page
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const page = await prisma.page.findUnique({
      where: { id },
      include: {
        seo: true,
      },
    })

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    if (page.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ page })
  } catch (error: any) {
    console.error("Fetch page error:", error)
    return NextResponse.json(
      { error: "Failed to fetch page" },
      { status: 500 }
    )
  }
}

// PUT update page
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

    // Verify page belongs to user's couple
    const existingPage = await prisma.page.findUnique({
      where: { id },
    })

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    if (existingPage.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { title, contentJSON, isPublished, order, seo } = body

    const page = await prisma.page.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        contentJSON: contentJSON !== undefined
          ? JSON.stringify(contentJSON)
          : undefined,
        isPublished: isPublished !== undefined ? isPublished : undefined,
        order: order !== undefined ? order : undefined,
        seo: seo
          ? {
              upsert: {
                create: {
                  metaTitle: seo.metaTitle,
                  metaDescription: seo.metaDescription,
                  ogImage: seo.ogImage,
                  keywords: seo.keywords,
                },
                update: {
                  metaTitle: seo.metaTitle,
                  metaDescription: seo.metaDescription,
                  ogImage: seo.ogImage,
                  keywords: seo.keywords,
                },
              },
            }
          : undefined,
      },
      include: {
        seo: true,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        coupleId: session.user.coupleId,
        actorId: session.user.id,
        action: "UPDATED",
        entityType: "Page",
        entityId: page.id,
        description: `Updated page: "${page.title}"`,
      },
    })

    return NextResponse.json({ page })
  } catch (error: any) {
    console.error("Update page error:", error)
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 }
    )
  }
}

// DELETE page
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

    // Verify page belongs to user's couple
    const existingPage = await prisma.page.findUnique({
      where: { id },
    })

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    if (existingPage.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Don't allow deleting HOME page
    if (existingPage.type === "HOME") {
      return NextResponse.json(
        { error: "Cannot delete HOME page" },
        { status: 400 }
      )
    }

    await prisma.page.delete({
      where: { id },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        coupleId: session.user.coupleId,
        actorId: session.user.id,
        action: "DELETED",
        entityType: "Page",
        entityId: id,
        description: `Deleted page: "${existingPage.title}"`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete page error:", error)
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
    )
  }
}

