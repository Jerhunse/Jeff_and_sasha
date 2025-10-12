import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PUT update RSVP question
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

    // Verify question belongs to user's couple
    const existingQuestion = await prisma.rSVPQuestion.findUnique({
      where: { id },
    })

    if (!existingQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    if (existingQuestion.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const {
      text,
      description,
      type,
      options,
      placeholder,
      required,
      order,
      visibilityRule,
    } = body

    const question = await prisma.rSVPQuestion.update({
      where: { id },
      data: {
        text: text !== undefined ? text : undefined,
        description: description !== undefined ? description : undefined,
        type: type !== undefined ? type : undefined,
        options: options !== undefined ? options : undefined,
        placeholder: placeholder !== undefined ? placeholder : undefined,
        required: required !== undefined ? required : undefined,
        order: order !== undefined ? order : undefined,
        visibilityRule: visibilityRule !== undefined
          ? visibilityRule ? JSON.stringify(visibilityRule) : null
          : undefined,
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
        action: "UPDATED",
        entityType: "RSVPQuestion",
        entityId: question.id,
        description: `Updated RSVP question: "${question.text}"`,
      },
    })

    return NextResponse.json({ question })
  } catch (error: any) {
    console.error("Update RSVP question error:", error)
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    )
  }
}

// DELETE RSVP question
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

    // Verify question belongs to user's couple
    const existingQuestion = await prisma.rSVPQuestion.findUnique({
      where: { id },
    })

    if (!existingQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    if (existingQuestion.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.rSVPQuestion.delete({
      where: { id },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        coupleId: session.user.coupleId,
        actorId: session.user.id,
        action: "DELETED",
        entityType: "RSVPQuestion",
        entityId: id,
        description: `Deleted RSVP question: "${existingQuestion.text}"`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete RSVP question error:", error)
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    )
  }
}

// PATCH reorder questions
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { order } = body

    if (order === undefined) {
      return NextResponse.json(
        { error: "Order is required" },
        { status: 400 }
      )
    }

    const { id } = await params

    // Verify question belongs to user's couple
    const existingQuestion = await prisma.rSVPQuestion.findUnique({
      where: { id },
    })

    if (!existingQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    if (existingQuestion.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const question = await prisma.rSVPQuestion.update({
      where: { id },
      data: { order },
    })

    return NextResponse.json({ question })
  } catch (error: any) {
    console.error("Reorder RSVP question error:", error)
    return NextResponse.json(
      { error: "Failed to reorder question" },
      { status: 500 }
    )
  }
}

