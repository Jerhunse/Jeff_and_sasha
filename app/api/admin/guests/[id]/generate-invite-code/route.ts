import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

/**
 * Generate or regenerate an invite code for a specific guest
 * POST /api/admin/guests/[id]/generate-invite-code
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Find the guest and verify they belong to the couple
    const guest = await prisma.guest.findFirst({
      where: {
        id,
        coupleId: session.user.coupleId,
      },
    })

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 })
    }

    // Generate a new unique invite token
    // Using nanoid(10) for a short, URL-friendly code
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

      if (!existing) {
        break
      }

      if (attempts >= maxAttempts) {
        return NextResponse.json(
          { error: "Failed to generate unique invite code. Please try again." },
          { status: 500 }
        )
      }
    } while (attempts < maxAttempts)

    // Update the guest with the new invite token
    const updatedGuest = await prisma.guest.update({
      where: { id },
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

    // Generate the RSVP URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const rsvpUrl = `${baseUrl}/rsvp/${newToken}`

    return NextResponse.json({
      success: true,
      guest: updatedGuest,
      inviteCode: newToken,
      rsvpUrl,
    })
  } catch (error: any) {
    console.error("Generate invite code error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate invite code" },
      { status: 500 }
    )
  }
}
