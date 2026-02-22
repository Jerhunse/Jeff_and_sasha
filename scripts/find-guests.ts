import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Find all guests with "Sasha" or "Contreras" in their name
  const guests = await prisma.guest.findMany({
    where: {
      OR: [
        { firstName: { contains: "Sasha", mode: "insensitive" } },
        { lastName: { contains: "Contreras", mode: "insensitive" } },
        { firstName: { contains: "Jeffery", mode: "insensitive" } },
        { lastName: { contains: "Erhunse", mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  })

  console.log("Found guests:")
  console.log(JSON.stringify(guests, null, 2))
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
