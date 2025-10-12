import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET single campaign
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

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        invitations: {
          include: {
            guest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
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
    })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    if (campaign.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ campaign })
  } catch (error: any) {
    console.error("Fetch campaign error:", error)
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    )
  }
}

// PUT update campaign
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

    // Verify campaign belongs to user's couple
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
    })

    if (!existingCampaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    if (existingCampaign.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Don't allow editing sent campaigns
    if (existingCampaign.status === "SENT") {
      return NextResponse.json(
        { error: "Cannot edit sent campaigns" },
        { status: 400 }
      )
    }

    const {
      name,
      subject,
      customHTML,
      customText,
      smsMessage,
      segmentJSON,
      scheduledAt,
      status,
    } = body

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        subject: subject !== undefined ? subject : undefined,
        customHTML: customHTML !== undefined ? customHTML : undefined,
        customText: customText !== undefined ? customText : undefined,
        smsMessage: smsMessage !== undefined ? smsMessage : undefined,
        segmentJSON: segmentJSON !== undefined
          ? JSON.stringify(segmentJSON)
          : undefined,
        scheduledAt: scheduledAt !== undefined
          ? scheduledAt ? new Date(scheduledAt) : null
          : undefined,
        status: status !== undefined ? status : undefined,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        coupleId: session.user.coupleId,
        actorId: session.user.id,
        action: "UPDATED",
        entityType: "Campaign",
        entityId: campaign.id,
        description: `Updated campaign: "${campaign.name}"`,
      },
    })

    return NextResponse.json({ campaign })
  } catch (error: any) {
    console.error("Update campaign error:", error)
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    )
  }
}

// DELETE campaign
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

    // Verify campaign belongs to user's couple
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            invitations: true,
          },
        },
      },
    })

    if (!existingCampaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    if (existingCampaign.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Don't allow deleting campaigns with invitations
    if (existingCampaign._count.invitations > 0) {
      return NextResponse.json(
        { error: "Cannot delete campaign with invitations. Delete invitations first or set status to CANCELLED." },
        { status: 400 }
      )
    }

    await prisma.campaign.delete({
      where: { id },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        coupleId: session.user.coupleId,
        actorId: session.user.id,
        action: "DELETED",
        entityType: "Campaign",
        entityId: id,
        description: `Deleted campaign: "${existingCampaign.name}"`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete campaign error:", error)
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    )
  }
}

