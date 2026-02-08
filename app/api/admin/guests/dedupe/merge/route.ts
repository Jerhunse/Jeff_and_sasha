import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { buildMergeData, type MergeStrategy } from "@/lib/dedupe-algorithm"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { guest1Id, guest2Id, strategy, keepGuestId } = body as {
      guest1Id: string
      guest2Id: string
      strategy: MergeStrategy
      keepGuestId: "guest1" | "guest2"
    }

    if (!guest1Id || !guest2Id) {
      return NextResponse.json(
        { error: "Both guest IDs are required" },
        { status: 400 }
      )
    }

    if (!strategy) {
      return NextResponse.json(
        { error: "Merge strategy is required" },
        { status: 400 }
      )
    }

    // Fetch both guests with all relations
    const [guest1, guest2] = await Promise.all([
      prisma.guest.findUnique({
        where: { id: guest1Id },
        include: {
          tags: true,
          invitations: true,
          rsvpResponses: true,
          seats: true,
          activities: true,
        },
      }),
      prisma.guest.findUnique({
        where: { id: guest2Id },
        include: {
          tags: true,
          invitations: true,
          rsvpResponses: true,
          seats: true,
          activities: true,
        },
      }),
    ])

    if (!guest1 || !guest2) {
      return NextResponse.json({ error: "Guest(s) not found" }, { status: 404 })
    }

    // Verify both belong to user's couple
    if (
      guest1.coupleId !== session.user.coupleId ||
      guest2.coupleId !== session.user.coupleId
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const keepGuest = keepGuestId === "guest1" ? guest1 : guest2
    const removeGuest = keepGuestId === "guest1" ? guest2 : guest1

    // Build merged data
    const mergedData = buildMergeData(guest1, guest2, strategy)

    // Create backup of both guests for undo
    const undoData = {
      guest1: {
        id: guest1.id,
        data: guest1,
      },
      guest2: {
        id: guest2.id,
        data: guest2,
      },
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the guest we're keeping with merged data
      const updatedGuest = await tx.guest.update({
        where: { id: keepGuest.id },
        data: mergedData,
      })

      // Merge tags
      if (strategy.tags === "merge") {
        const tag2Ids = removeGuest.tags.map((t) => t.tagId)
        for (const tagId of tag2Ids) {
          // Only add if not already present
          const existing = await tx.guestTag.findUnique({
            where: {
              guestId_tagId: {
                guestId: keepGuest.id,
                tagId,
              },
            },
          })

          if (!existing) {
            await tx.guestTag.create({
              data: {
                guestId: keepGuest.id,
                tagId,
              },
            })
          }
        }
      }

      // Reassign invitations from removed guest to kept guest
      if (strategy.invitations === "merge" || strategy.invitations === "guest1") {
        await tx.invitation.updateMany({
          where: { guestId: removeGuest.id },
          data: { guestId: keepGuest.id },
        })
      } else if (strategy.invitations === "guest2") {
        // Delete invitations from guest1 if keeping guest2's
        if (keepGuest.id === guest2.id) {
          await tx.invitation.deleteMany({
            where: { guestId: guest1.id },
          })
        }
      }

      // Reassign RSVP responses
      if (strategy.rsvpResponses === "merge") {
        // Keep all responses, update guestId
        await tx.rSVPResponse.updateMany({
          where: { guestId: removeGuest.id },
          data: { guestId: keepGuest.id },
        })
      } else if (strategy.rsvpResponses === "guest1" && keepGuest.id === guest1.id) {
        // Delete guest2's responses
        await tx.rSVPResponse.deleteMany({
          where: { guestId: guest2.id },
        })
      } else if (strategy.rsvpResponses === "guest2" && keepGuest.id === guest2.id) {
        // Delete guest1's responses
        await tx.rSVPResponse.deleteMany({
          where: { guestId: guest1.id },
        })
      }

      // Reassign seating
      await tx.seat.updateMany({
        where: { guestId: removeGuest.id },
        data: { guestId: keepGuest.id },
      })

      // Create merge activity log
      await tx.guestActivity.create({
        data: {
          guestId: keepGuest.id,
          action: "MERGED",
          description: `Merged with ${removeGuest.firstName} ${removeGuest.lastName}`,
          changes: JSON.stringify({
            mergedGuestId: removeGuest.id,
            strategy,
          }),
          userId: session.user.id,
          userName: session.user.name || undefined,
          canUndo: true,
          undoData: JSON.stringify(undoData),
        },
      })

      // Delete the removed guest
      await tx.guest.delete({
        where: { id: removeGuest.id },
      })

      return updatedGuest
    })

    // Log couple activity
    await prisma.activityLog.create({
      data: {
        coupleId: session.user.coupleId,
        actorId: session.user.id,
        action: "MERGED",
        entityType: "Guest",
        entityId: keepGuest.id,
        description: `Merged duplicate guests: ${guest1.firstName} ${guest1.lastName} and ${guest2.firstName} ${guest2.lastName}`,
        meta: JSON.stringify({ guest1Id, guest2Id, keepGuestId }),
      },
    })

    return NextResponse.json({
      success: true,
      mergedGuest: result,
    })
  } catch (error: any) {
    console.error("Merge guests error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to merge guests" },
      { status: 500 }
    )
  }
}

