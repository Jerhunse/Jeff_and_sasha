import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET all campaigns for a couple
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")

    const where: any = {
      coupleId: session.user.coupleId,
    }

    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        invitations: {
          select: {
            id: true,
            status: true,
            guest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            invitations: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ campaigns })
  } catch (error: any) {
    console.error("Fetch campaigns error:", error)
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    )
  }
}

// POST create new campaign
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      name,
      type,
      subject,
      customHTML,
      customText,
      smsMessage,
      segmentJSON,
      scheduledAt,
    } = body

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: "Campaign name is required" },
        { status: 400 }
      )
    }

    if (!type) {
      return NextResponse.json(
        { error: "Campaign type is required" },
        { status: 400 }
      )
    }

    const validTypes = ["SAVE_THE_DATE", "INVITATION", "REMINDER", "UPDATE", "THANK_YOU"]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid campaign type" },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.create({
      data: {
        coupleId: session.user.coupleId,
        name,
        type,
        status: scheduledAt ? "SCHEDULED" : "DRAFT",
        subject,
        customHTML,
        customText,
        smsMessage,
        segmentJSON: segmentJSON ? JSON.stringify(segmentJSON) : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        coupleId: session.user.coupleId,
        actorId: session.user.id,
        action: "CREATED",
        entityType: "Campaign",
        entityId: campaign.id,
        description: `Created campaign: "${name}"`,
      },
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error: any) {
    console.error("Create campaign error:", error)
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    )
  }
}

