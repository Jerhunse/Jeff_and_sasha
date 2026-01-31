import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const wedding = await prisma.couple.findFirst({
      where: { isPublished: true },
      orderBy: { createdAt: "asc" },
      select: {
        slug: true,
        partner1Name: true,
        partner2Name: true,
      },
    })

    if (!wedding) {
      return NextResponse.json({ error: "No published wedding found" }, { status: 404 })
    }

    return NextResponse.json(wedding)
  } catch (error) {
    console.error("Error fetching wedding data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
