import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Updating head table capacity to 18...")

  const updated = await prisma.table.updateMany({
    where: {
      name: "Head Table",
    },
    data: {
      capacity: 18,
    },
  })

  console.log(`✓ Updated ${updated.count} head table(s) to capacity 18`)
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
