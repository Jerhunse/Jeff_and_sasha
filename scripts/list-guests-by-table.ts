/**
 * Lists all guests assigned to each table across all seating charts.
 * Run: npx tsx scripts/list-guests-by-table.ts
 */
import { prisma } from "@/lib/prisma"

async function main() {
  const seatingCharts = await prisma.seatingChart.findMany({
    include: {
      tables: {
        orderBy: { name: "asc" },
        include: {
          seats: {
            orderBy: [{ seatNumber: "asc" }, { createdAt: "asc" }],
            include: {
              guest: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  })

  if (seatingCharts.length === 0) {
    console.log("No seating charts found.")
    return
  }

  for (const chart of seatingCharts) {
    console.log("\n" + "=".repeat(60))
    console.log(`Seating chart: ${chart.name}`)
    if (chart.description) console.log(`  ${chart.description}`)
    console.log("=".repeat(60))

    if (chart.tables.length === 0) {
      console.log("  (No tables)\n")
      continue
    }

    for (const table of chart.tables) {
      const guestCount = table.seats.length
      const capacity = table.capacity
      console.log(`\n  ${table.name} (${guestCount}/${capacity})`)
      if (table.seats.length === 0) {
        console.log("    — No guests assigned")
      } else {
        for (const seat of table.seats) {
          const g = seat.guest
          const name = `${g.firstName} ${g.lastName}`.trim()
          const seatLabel = seat.seatNumber != null ? ` (seat ${seat.seatNumber})` : ""
          console.log(`    • ${name}${seatLabel}`)
        }
      }
    }
    console.log("")
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
