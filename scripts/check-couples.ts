import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const couples = await prisma.couple.findMany({
    select: {
      id: true,
      slug: true,
      partner1Name: true,
      partner2Name: true,
    },
  })

  console.log("\n📋 Found Couples:")
  if (couples.length === 0) {
    console.log("  ❌ No couples found in database")
  } else {
    couples.forEach((couple) => {
      console.log(`  ✅ ${couple.partner1Name} & ${couple.partner2Name}`)
      console.log(`     Slug: ${couple.slug}`)
      console.log(`     ID: ${couple.id}`)
    })
  }
}

main()
  .catch((error) => {
    console.error("Error:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
