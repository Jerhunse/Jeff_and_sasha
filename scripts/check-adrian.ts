import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const adrian = await prisma.guest.findFirst({
    where: {
      firstName: "Adrian",
    },
    include: {
      rsvpResponses: true,
      seats: {
        include: {
          table: true,
        },
      },
    },
  })

  console.log("Adrian's data:")
  console.log(JSON.stringify(adrian, null, 2))
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
