import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Track email opens via pixel
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const invitationId = searchParams.get("id")
    const guestId = searchParams.get("guestId")

    if (invitationId) {
      // Update invitation open tracking
      await prisma.invitation.update({
        where: { id: invitationId },
        data: {
          status: "OPENED",
          emailOpenedAt: new Date(),
          openCount: { increment: 1 },
          lastOpenedAt: new Date(),
        },
      })
    }

    if (guestId) {
      // Update guest viewed tracking
      await prisma.guest.update({
        where: { id: guestId },
        data: {
          inviteViewed: new Date(),
        },
      })
    }

    // Return a 1x1 transparent pixel
    const pixel = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    )

    return new NextResponse(pixel, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Tracking error:", error)
    // Still return pixel even on error
    const pixel = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    )
    return new NextResponse(pixel, {
      headers: { "Content-Type": "image/gif" },
    })
  }
}

