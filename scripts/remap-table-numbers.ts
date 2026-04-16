/**
 * Remaps table numbers while keeping guests at their respective tables.
 * Run: npx tsx scripts/remap-table-numbers.ts [--slug=your-wedding-slug]
 *
 * Mapping applied:
 *   Table 5  → Table 3   |  Table 11 → Table 4   |  Table 6  → Table 5
 *   Table 12 → Table 6   |  Table 3  → Table 7   |  Table 10 → Table 8
 *   Table 4  → Table 9   |  Table 15 → Table 10  |  Table 7  → Table 11
 *   Table 8  → Table 12  |  Table 9  → Table 13  |  Table 13 → Table 14
 *   Table 14 → Table 15
 */
import { prisma } from "@/lib/prisma"

const REMAP: Array<{ from: number; to: number }> = [
  { from: 5, to: 3 },
  { from: 11, to: 4 },
  { from: 6, to: 5 },
  { from: 12, to: 6 },
  { from: 3, to: 7 },
  { from: 10, to: 8 },
  { from: 4, to: 9 },
  { from: 15, to: 10 },
  { from: 7, to: 11 },
  { from: 8, to: 12 },
  { from: 9, to: 13 },
  { from: 13, to: 14 },
  { from: 14, to: 15 },
]

async function main() {
  const slug = process.argv
    .find((a) => a.startsWith("--slug="))
    ?.split("=")[1]

  const seatingCharts = await prisma.seatingChart.findMany({
    where: slug ? { couple: { slug } } : undefined,
    include: {
      couple: { select: { slug: true, partner1Name: true, partner2Name: true } },
      tables: true,
    },
  })

  if (seatingCharts.length === 0) {
    console.log(
      slug
        ? `No seating charts found for slug "${slug}".`
        : "No seating charts found."
    )
    return
  }

  const fromNames = new Set(REMAP.map((r) => `Table ${r.from}`))
  const fromToTemp = new Map(REMAP.map((r) => [`Table ${r.from}`, `Table ${r.from}_temp`]))
  const tempToFinal = new Map(
    REMAP.map((r) => [`Table ${r.from}_temp`, `Table ${r.to}`])
  )

  let updated = 0

  for (const chart of seatingCharts) {
    const tablesToUpdate = chart.tables.filter((t) => fromNames.has(t.name))
    if (tablesToUpdate.length === 0) continue

    const coupleLabel = chart.couple
      ? `${chart.couple.partner1Name} & ${chart.couple.partner2Name} (${chart.couple.slug})`
      : "Unknown"
    console.log(`\nSeating chart: ${chart.name} [${coupleLabel}]`)

    for (const table of tablesToUpdate) {
      const tempName = fromToTemp.get(table.name)!
      await prisma.table.update({
        where: { id: table.id },
        data: { name: tempName },
      })
      console.log(`  Phase 1: ${table.name} → ${tempName}`)
    }
  }

  // Re-fetch to get tables with temp names, then apply final names
  const chartsAgain = await prisma.seatingChart.findMany({
    where: slug ? { couple: { slug } } : undefined,
    include: { tables: true },
  })

  for (const chart of chartsAgain) {
    const tablesWithTemp = chart.tables.filter((t) => t.name.endsWith("_temp"))
    for (const table of tablesWithTemp) {
      const finalName = tempToFinal.get(table.name)!
      await prisma.table.update({
        where: { id: table.id },
        data: { name: finalName },
      })
      console.log(`  Phase 2: ${table.name} → ${finalName}`)
      updated++
    }
  }

  console.log(`\nDone. Updated ${updated} table(s).`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
