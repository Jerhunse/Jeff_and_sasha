import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        household: true,
        address: true,
        parentGuest: {
          select: { id: true, firstName: true, lastName: true }
        },
        plusOnes: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        },
      },
    })

    if (!guest || guest.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 })
    }

    return NextResponse.json({ guest })
  } catch (error) {
    console.error("Error fetching guest:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    // Fetch the existing guest to verify ownership
    const existingGuest = await prisma.guest.findUnique({
      where: { id },
      select: { coupleId: true, firstName: true, lastName: true },
    })

    if (!existingGuest || existingGuest.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 })
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      isChild,
      isVIP,
      allowPlusOne,
      maxGuestsAllowed,
      notes,
      doNotContact,
      isPrimaryContact,
      relationship,
      parentGuestId,
    } = body

    // Validate required fields
    if (firstName !== undefined && !firstName?.trim()) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 }
      )
    }

    if (lastName !== undefined && !lastName?.trim()) {
      return NextResponse.json(
        { error: "Last name is required" },
        { status: 400 }
      )
    }

    // Track changes for activity log
    const changes: Record<string, { from: any; to: any }> = {}
    
    if (firstName && firstName !== existingGuest.firstName) {
      changes.firstName = { from: existingGuest.firstName, to: firstName }
    }
    if (lastName && lastName !== existingGuest.lastName) {
      changes.lastName = { from: existingGuest.lastName, to: lastName }
    }

    // Build update data
    const updateData: any = {}
    if (firstName !== undefined) updateData.firstName = firstName.trim()
    if (lastName !== undefined) updateData.lastName = lastName.trim()
    if (email !== undefined) updateData.email = email?.trim() || null
    if (phone !== undefined) updateData.phone = phone?.trim() || null
    if (isChild !== undefined) updateData.isChild = isChild
    if (isVIP !== undefined) updateData.isVIP = isVIP
    if (allowPlusOne !== undefined) updateData.allowPlusOne = allowPlusOne
    if (maxGuestsAllowed !== undefined) updateData.maxGuestsAllowed = maxGuestsAllowed
    if (notes !== undefined) updateData.notes = notes?.trim() || null
    if (doNotContact !== undefined) updateData.doNotContact = doNotContact
    if (isPrimaryContact !== undefined) updateData.isPrimaryContact = isPrimaryContact
    if (relationship !== undefined) updateData.relationship = relationship?.trim() || null
    if (parentGuestId !== undefined) updateData.parentGuestId = parentGuestId || null

    // Update the guest
    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: updateData,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        household: true,
        address: true,
        parentGuest: {
          select: { id: true, firstName: true, lastName: true }
        },
        plusOnes: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        },
      },
    })

    // Log the activity
    await prisma.guestActivity.create({
      data: {
        guestId: id,
        action: "UPDATED",
        description: `Guest ${updatedGuest.firstName} ${updatedGuest.lastName} updated`,
        changes: Object.keys(changes).length > 0 ? JSON.stringify(changes) : null,
        userId: session.user.id,
        userName: session.user.name || session.user.email || "Unknown",
      },
    })

    return NextResponse.json({ success: true, guest: updatedGuest })
  } catch (error: any) {
    console.error("Error updating guest:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update guest" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    // Fetch the existing guest to verify ownership
    const existingGuest = await prisma.guest.findUnique({
      where: { id },
      select: { coupleId: true, firstName: true, lastName: true },
    })

    if (!existingGuest || existingGuest.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 })
    }

    // Delete the guest (cascading deletes will handle related records)
    await prisma.guest.delete({
      where: { id },
    })

    // Log the activity
    await prisma.activityLog.create({
      data: {
        coupleId: session.user.coupleId,
        actorId: session.user.id,
        action: "DELETED",
        entityType: "Guest",
        entityId: id,
        description: `Guest ${existingGuest.firstName} ${existingGuest.lastName} deleted`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting guest:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete guest" },
      { status: 500 }
    )
  }
}
