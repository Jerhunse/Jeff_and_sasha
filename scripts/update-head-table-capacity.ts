import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Updating head table capacity to 31...")

  const updated = await prisma.table.updateMany({
    where: {
      name: "Head Table",
    },
    data: {
      capacity: 31,
    },
  })

  console.log(`✓ Updated ${updated.count} head table(s) to capacity 31`)
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
