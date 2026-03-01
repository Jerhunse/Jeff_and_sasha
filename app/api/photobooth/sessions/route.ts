import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const sessions = await prisma.photoboothSession.findMany({
      include: {
        photos: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Sessions list error:", error)
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}
