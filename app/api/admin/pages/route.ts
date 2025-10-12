import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET all pages for a couple
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")

    const where: any = {
      coupleId: session.user.coupleId,
    }

    if (type) {
      where.type = type
    }

    const pages = await prisma.page.findMany({
      where,
      include: {
        seo: true,
      },
      orderBy: { order: "asc" },
    })

    return NextResponse.json({ pages })
  } catch (error: any) {
    console.error("Fetch pages error:", error)
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    )
  }
}

// POST create new page
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { type, slug, title, contentJSON, order, isPublished, seo } = body

    // Validation
    if (!type || !slug || !title) {
      return NextResponse.json(
        { error: "Type, slug, and title are required" },
        { status: 400 }
      )
    }

    // Check if slug already exists for this couple
    const existing = await prisma.page.findUnique({
      where: {
        coupleId_slug: {
          coupleId: session.user.coupleId,
          slug,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "A page with this slug already exists" },
        { status: 400 }
      )
    }

    // Get next order number if not specified
    let pageOrder = order
    if (pageOrder === undefined) {
      const lastPage = await prisma.page.findFirst({
        where: { coupleId: session.user.coupleId },
        orderBy: { order: "desc" },
      })
      pageOrder = lastPage ? lastPage.order + 1 : 0
    }

    const page = await prisma.page.create({
      data: {
        coupleId: session.user.coupleId,
        type,
        slug,
        title,
        contentJSON: contentJSON ? JSON.stringify(contentJSON) : JSON.stringify({ sections: [] }),
        order: pageOrder,
        isPublished: isPublished !== undefined ? isPublished : true,
        seo: seo
          ? {
              create: {
                metaTitle: seo.metaTitle,
                metaDescription: seo.metaDescription,
                ogImage: seo.ogImage,
                keywords: seo.keywords,
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
        action: "CREATED",
        entityType: "Page",
        entityId: page.id,
        description: `Created page: "${title}"`,
      },
    })

    return NextResponse.json({ page }, { status: 201 })
  } catch (error: any) {
    console.error("Create page error:", error)
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    )
  }
}

