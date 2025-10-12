import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET all RSVP questions for a couple
export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get("eventId")

    const where: any = {
      coupleId: session.user.coupleId,
    }

    if (eventId) {
      where.OR = [
        { eventId: null }, // Global questions
        { eventId },
      ]
    }

    const questions = await prisma.rSVPQuestion.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    })

    return NextResponse.json({ questions })
  } catch (error: any) {
    console.error("Fetch RSVP questions error:", error)
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    )
  }
}

// POST create new RSVP question
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      eventId,
      text,
      description,
      type,
      options,
      placeholder,
      required,
      order,
      visibilityRule,
    } = body

    // Validation
    if (!text) {
      return NextResponse.json(
        { error: "Question text is required" },
        { status: 400 }
      )
    }

    if (!type) {
      return NextResponse.json(
        { error: "Question type is required" },
        { status: 400 }
      )
    }

    const validTypes = [
      "TEXT",
      "TEXTAREA",
      "SINGLE_SELECT",
      "MULTI_SELECT",
      "YES_NO",
      "MEAL_CHOICE",
      "DIETARY",
      "PLUS_ONE",
      "NUMBER",
      "DATE",
      "EMAIL",
      "PHONE",
    ]

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid question type" },
        { status: 400 }
      )
    }

    // Validate options for select types
    if (
      ["SINGLE_SELECT", "MULTI_SELECT", "MEAL_CHOICE"].includes(type) &&
      (!options || options.length === 0)
    ) {
      return NextResponse.json(
        { error: "Options are required for select type questions" },
        { status: 400 }
      )
    }

    // Get next order number if not specified
    let questionOrder = order
    if (questionOrder === undefined) {
      const lastQuestion = await prisma.rSVPQuestion.findFirst({
        where: {
          coupleId: session.user.coupleId,
          eventId: eventId || null,
        },
        orderBy: { order: "desc" },
      })
      questionOrder = lastQuestion ? lastQuestion.order + 1 : 0
    }

    const question = await prisma.rSVPQuestion.create({
      data: {
        coupleId: session.user.coupleId,
        eventId: eventId || null,
        text,
        description,
        type,
        options: options || [],
        placeholder,
        required: required || false,
        order: questionOrder,
        visibilityRule: visibilityRule ? JSON.stringify(visibilityRule) : null,
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        coupleId: session.user.coupleId,
        actorId: session.user.id,
        action: "CREATED",
        entityType: "RSVPQuestion",
        entityId: question.id,
        description: `Created RSVP question: "${text}"`,
      },
    })

    return NextResponse.json({ question }, { status: 201 })
  } catch (error: any) {
    console.error("Create RSVP question error:", error)
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    )
  }
}

