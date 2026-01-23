import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

/**
 * Generate invite codes for multiple guests
 * POST /api/admin/guests/generate-invite-codes
 * 
 * Body:
 * - guestIds: string[] (optional) - specific guest IDs to generate codes for
 * - regenerate: boolean (optional) - if true, regenerate codes even if they exist
 * - all: boolean (optional) - if true, generate codes for all guests without codes
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { guestIds, regenerate = false, all = false } = body

    // Build query to find guests
    let whereClause: any = {
      coupleId: session.user.coupleId,
    }

    if (guestIds && Array.isArray(guestIds) && guestIds.length > 0) {
      // Generate codes for specific guests
      whereClause.id = { in: guestIds }
    } else if (all) {
      // Generate codes for all guests without codes (or all if regenerate is true)
      if (!regenerate) {
        whereClause.inviteToken = null
      }
    } else {
      return NextResponse.json(
        { error: "Must provide guestIds array or set all=true" },
        { status: 400 }
      )
    }

    // Find guests
    const guests = await prisma.guest.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        inviteToken: true,
      },
    })

    if (guests.length === 0) {
      return NextResponse.json(
        { error: "No guests found matching criteria" },
        { status: 404 }
      )
    }

    const results = {
      success: 0,
      failed: 0,
      updated: [] as any[],
      errors: [] as string[],
    }

    // Generate codes for each guest
    for (const guest of guests) {
      try {
        // Skip if guest already has a code and regenerate is false
        if (!regenerate && guest.inviteToken) {
          continue
        }

        // Generate a new unique invite token
        let newToken: string
        let attempts = 0
        const maxAttempts = 10

        do {
          newToken = nanoid(10)
          attempts++

          // Check if token already exists
          const existing = await prisma.guest.findUnique({
            where: { inviteToken: newToken },
          })

          if (!existing || existing.id === guest.id) {
            break
          }

          if (attempts >= maxAttempts) {
            throw new Error("Failed to generate unique invite code")
          }
        } while (attempts < maxAttempts)

        // Update the guest
        const updatedGuest = await prisma.guest.update({
          where: { id: guest.id },
          data: {
            inviteToken: newToken,
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            inviteToken: true,
          },
        })

        // Log activity
        await prisma.guestActivity.create({
          data: {
            guestId: guest.id,
            action: "UPDATED",
            description: `Invite code generated: ${newToken}`,
            userId: session.user.id,
          },
        })

        results.success++
        results.updated.push(updatedGuest)
      } catch (error: any) {
        results.failed++
        results.errors.push(`${guest.firstName} ${guest.lastName}: ${error.message}`)
        console.error(`Failed to generate code for guest ${guest.id}:`, error)
      }
    }

    // Generate RSVP URLs
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const guestsWithUrls = results.updated.map((guest) => ({
      ...guest,
      rsvpUrl: `${baseUrl}/rsvp/${guest.inviteToken}`,
    }))

    return NextResponse.json({
      success: true,
      summary: {
        total: guests.length,
        success: results.success,
        failed: results.failed,
      },
      guests: guestsWithUrls,
      errors: results.errors.length > 0 ? results.errors : undefined,
    })
  } catch (error: any) {
    console.error("Generate invite codes error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate invite codes" },
      { status: 500 }
    )
  }
}
