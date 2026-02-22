import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Find Jeffery
  const jeffery = await prisma.guest.findFirst({
    where: {
      firstName: "Jeffery",
      lastName: "Erhunse",
    },
    include: {
      rsvpResponses: true,
      household: true,
    },
  })

  console.log("Jeffery's data:")
  console.log(JSON.stringify(jeffery, null, 2))
  console.log("\n" + "=".repeat(80) + "\n")

  // Find all Contreras guests
  const contreras = await prisma.guest.findMany({
    where: {
      lastName: "Contreras",
    },
    include: {
      rsvpResponses: true,
      household: true,
    },
  })

  console.log("All Contreras guests:")
  console.log(JSON.stringify(contreras, null, 2))
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
