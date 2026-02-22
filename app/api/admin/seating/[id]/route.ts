import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const seatingChart = await prisma.seatingChart.findUnique({
      where: { id },
      include: {
        tables: {
          include: {
            seats: {
              orderBy: { seatNumber: "asc" },
              include: {
                guest: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    allowPlusOne: true,
                    rsvpResponses: {
                      select: {
                        status: true,
                        plusOneName: true,
                      },
                      take: 1,
                    },
                  },
                },
              },
            },
            _count: {
              select: {
                seats: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        },
      },
    })

    if (!seatingChart) {
      return NextResponse.json({ error: "Seating chart not found" }, { status: 404 })
    }

    if (seatingChart.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ seatingChart })
  } catch (error: any) {
    console.error("Fetch seating chart error:", error)
    return NextResponse.json(
      { error: "Failed to fetch seating chart" },
      { status: 500 }
    )
  }
}
