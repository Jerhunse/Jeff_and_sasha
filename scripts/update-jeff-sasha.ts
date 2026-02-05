import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function updateJeffAndSasha() {
  const couple = await prisma.couple.findFirst({
    where: { slug: "jeff-and-sasha" },
  })

  if (!couple) {
    console.error("❌ Could not find wedding couple")
    return
  }

  // Find Jeff & Sasha guest record
  const guest = await prisma.guest.findFirst({
    where: {
      coupleId: couple.id,
      firstName: { contains: "Jeffery", mode: "insensitive" },
      lastName: { contains: "Erhunse", mode: "insensitive" },
    },
  })

  if (!guest) {
    console.error("❌ Could not find Jeff & Sasha guest record")
    return
  }

  console.log("\n📝 Current Data:")
  console.log(`   Name: ${guest.firstName} ${guest.lastName}`)
  console.log(`   Phone: ${guest.phone}`)
  console.log(`   Max Guests: ${guest.maxGuestsAllowed}`)

  // Update to 2 guests
  await prisma.guest.update({
    where: { id: guest.id },
    data: {
      maxGuestsAllowed: 2,
    },
  })

  console.log("\n✅ Updated to 2 guests\n")
}

updateJeffAndSasha()
  .catch((error) => {
    console.error("Error:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
