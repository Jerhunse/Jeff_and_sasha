import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { findDuplicates } from "@/lib/dedupe-algorithm"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const confidence = searchParams.get("confidence") || "medium"

    // Fetch all guests for this couple
    const guests = await prisma.guest.findMany({
      where: { coupleId: session.user.coupleId },
      include: {
        household: true,
        rsvpResponses: {
          take: 1,
          orderBy: { respondedAt: "desc" },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    // Find duplicates
    const allMatches = findDuplicates(guests as any)

    // Filter by confidence level
    const filteredMatches = allMatches.filter((match) => {
      if (confidence === "high") return match.confidence === "high"
      if (confidence === "medium")
        return match.confidence === "high" || match.confidence === "medium"
      return true // Show all
    })

    return NextResponse.json({
      matches: filteredMatches,
      total: filteredMatches.length,
      byConfidence: {
        high: allMatches.filter((m) => m.confidence === "high").length,
        medium: allMatches.filter((m) => m.confidence === "medium").length,
        low: allMatches.filter((m) => m.confidence === "low").length,
      },
    })
  } catch (error: any) {
    console.error("Find duplicates error:", error)
    return NextResponse.json(
      { error: "Failed to find duplicates" },
      { status: 500 }
    )
  }
}

