import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET theme settings
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const couple = await prisma.couple.findUnique({
      where: { id: session.user.coupleId },
      select: {
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        fontHeading: true,
        fontBody: true,
        cornerRadius: true,
        showFlorals: true,
        heroImageUrl: true,
        logoImageUrl: true,
      },
    })

    if (!couple) {
      return NextResponse.json({ error: "Couple not found" }, { status: 404 })
    }

    return NextResponse.json({ theme: couple })
  } catch (error: any) {
    console.error("Fetch theme error:", error)
    return NextResponse.json(
      { error: "Failed to fetch theme" },
      { status: 500 }
    )
  }
}

// PUT update theme
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      primaryColor,
      secondaryColor,
      accentColor,
      fontHeading,
      fontBody,
      cornerRadius,
      showFlorals,
      heroImageUrl,
      logoImageUrl,
    } = body

    const couple = await prisma.couple.update({
      where: { id: session.user.coupleId },
      data: {
        primaryColor: primaryColor !== undefined ? primaryColor : undefined,
        secondaryColor: secondaryColor !== undefined ? secondaryColor : undefined,
        accentColor: accentColor !== undefined ? accentColor : undefined,
        fontHeading: fontHeading !== undefined ? fontHeading : undefined,
        fontBody: fontBody !== undefined ? fontBody : undefined,
        cornerRadius: cornerRadius !== undefined ? cornerRadius : undefined,
        showFlorals: showFlorals !== undefined ? showFlorals : undefined,
        heroImageUrl: heroImageUrl !== undefined ? heroImageUrl : undefined,
        logoImageUrl: logoImageUrl !== undefined ? logoImageUrl : undefined,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        coupleId: session.user.coupleId,
        actorId: session.user.id,
        action: "UPDATED",
        entityType: "Couple",
        entityId: couple.id,
        description: "Updated theme settings",
        meta: JSON.stringify(body),
      },
    })

    return NextResponse.json({ theme: couple })
  } catch (error: any) {
    console.error("Update theme error:", error)
    return NextResponse.json(
      { error: "Failed to update theme" },
      { status: 500 }
    )
  }
}

