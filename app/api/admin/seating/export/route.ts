import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const chartId = searchParams.get("chartId")
    const format = searchParams.get("format") || "csv"

    if (!chartId) {
      return NextResponse.json(
        { error: "Seating chart ID is required" },
        { status: 400 }
      )
    }

    // Fetch seating chart with all data
    const seatingChart = await prisma.seatingChart.findUnique({
      where: { id: chartId },
      include: {
        event: true,
        tables: {
          include: {
            seats: {
              include: {
                guest: {
                  include: {
                    rsvpResponses: {
                      select: {
                        answersJSON: true,
                      },
                      take: 1,
                    },
                  },
                },
              },
              orderBy: { seatNumber: "asc" },
            },
          },
          orderBy: { name: "asc" },
        },
      },
    })

    if (!seatingChart) {
      return NextResponse.json(
        { error: "Seating chart not found" },
        { status: 404 }
      )
    }

    if (seatingChart.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (format === "csv") {
      // Generate CSV
      const headers = [
        "Table Name",
        "Seat Number",
        "Guest First Name",
        "Guest Last Name",
        "Email",
        "Meal Choice",
        "Dietary Restrictions",
        "Notes",
      ]

      const rows = seatingChart.tables.flatMap((table) =>
        table.seats.map((seat) => {
          const answers = seat.guest.rsvpResponses[0]?.answersJSON
            ? JSON.parse(seat.guest.rsvpResponses[0].answersJSON)
            : {}

          return [
            table.name,
            seat.seatNumber || "",
            seat.guest.firstName,
            seat.guest.lastName,
            seat.guest.email || "",
            answers.mealChoice || "",
            answers.dietaryRestrictions || "",
            seat.notes || "",
          ]
        })
      )

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row
            .map((cell) => {
              const cellStr = String(cell)
              if (cellStr.includes(",") || cellStr.includes('"')) {
                return `"${cellStr.replace(/"/g, '""')}"`
              }
              return cellStr
            })
            .join(",")
        ),
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="seating-chart-${seatingChart.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    // JSON format (for other uses)
    return NextResponse.json({ seatingChart })
  } catch (error: any) {
    console.error("Export seating error:", error)
    return NextResponse.json(
      { error: "Failed to export seating chart" },
      { status: 500 }
    )
  }
}

