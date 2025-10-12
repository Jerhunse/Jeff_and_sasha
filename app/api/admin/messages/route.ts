import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET all messages for a couple
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    const where: any = {
      coupleId: session.user.coupleId,
    }

    if (status) {
      where.status = status
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error("Fetch messages error:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

// POST create new message
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { subject, bodyHTML, bodyText, segmentJSON, scheduledAt } = body

    if (!subject || !bodyHTML) {
      return NextResponse.json(
        { error: "Subject and body are required" },
        { status: 400 }
      )
    }

    const message = await prisma.message.create({
      data: {
        coupleId: session.user.coupleId,
        subject,
        bodyHTML,
        bodyText: bodyText || stripHTML(bodyHTML),
        segmentJSON: segmentJSON ? JSON.stringify(segmentJSON) : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt ? "SCHEDULED" : "DRAFT",
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        coupleId: session.user.coupleId,
        actorId: session.user.id,
        action: "CREATED",
        entityType: "Message",
        entityId: message.id,
        description: `Created message: "${subject}"`,
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error: any) {
    console.error("Create message error:", error)
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    )
  }
}

function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}

