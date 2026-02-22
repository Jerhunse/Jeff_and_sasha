import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔧 Fixing Head Table capacity to 28...")

  const result = await prisma.table.updateMany({
    where: {
      name: "Head Table",
    },
    data: {
      capacity: 28,
    },
  })

  console.log(`✅ Updated ${result.count} Head Table(s) to capacity 28`)

  // Verify the update
  const headTables = await prisma.table.findMany({
    where: {
      name: "Head Table",
    },
    select: {
      id: true,
      name: true,
      capacity: true,
      shape: true,
      _count: {
        select: {
          seats: true,
        },
      },
    },
  })

  console.log("\n📊 Current Head Table status:")
  for (const table of headTables) {
    console.log(`  - ${table.name}: ${table._count.seats}/${table.capacity} seats (${table.shape})`)
  }
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
