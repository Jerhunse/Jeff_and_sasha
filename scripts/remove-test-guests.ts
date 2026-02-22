import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🗑️  Removing obvious test guests...\n")

  const testGuests = await prisma.guest.findMany({
    where: {
      OR: [
        { firstName: 'Jane', lastName: 'Doe' },
        { firstName: 'John', lastName: 'Smith' },
        { firstName: 'Bob', lastName: 'Johnson' },
      ],
    },
  })

  if (testGuests.length === 0) {
    console.log("✅ No test guests found!")
    return
  }

  console.log(`Found ${testGuests.length} test guests:`)
  for (const g of testGuests) {
    console.log(`  - ${g.firstName} ${g.lastName} (ID: ${g.id})`)
  }

  console.log("\n🗑️  Deleting...")
  
  const deleted = await prisma.guest.deleteMany({
    where: {
      OR: [
        { firstName: 'Jane', lastName: 'Doe' },
        { firstName: 'John', lastName: 'Smith' },
        { firstName: 'Bob', lastName: 'Johnson' },
      ],
    },
  })

  console.log(`✅ Deleted ${deleted.count} test guests`)

  // Show new count
  const remaining = await prisma.guest.count({
    where: { coupleId: 'cmgn7015b0000y44c73zxrwpc' },
  })

  console.log(`\n📊 New total guest count: ${remaining}`)
  console.log(`Target: 182`)
  console.log(`Difference: ${remaining - 182}`)
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
