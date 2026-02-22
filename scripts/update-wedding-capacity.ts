import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Updating wedding capacity to 300...")

  const updated = await prisma.couple.updateMany({
    data: {
      maxCapacity: 300,
    },
  })

  console.log(`✓ Updated ${updated.count} wedding(s) to capacity 300`)

  // Verify the update
  const weddings = await prisma.couple.findMany({
    select: {
      id: true,
      partner1Name: true,
      partner2Name: true,
      maxCapacity: true,
    },
  })

  console.log("\nCurrent weddings:")
  weddings.forEach((w) => {
    console.log(`- ${w.partner1Name} & ${w.partner2Name}: capacity ${w.maxCapacity}`)
  })
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
