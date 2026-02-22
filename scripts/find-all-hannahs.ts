import { prisma } from "../lib/prisma"

async function findAllHannahRecords() {
  console.log("\n=== Finding ALL Hannah/Hanna records ===\n")
  
  // Find all guests with names similar to Hannah
  const hannahVariants = await prisma.guest.findMany({
    where: {
      OR: [
        { firstName: { contains: "Hanna", mode: "insensitive" } },
        { firstName: { contains: "Hannah", mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      parentGuestId: true,
      householdId: true,
      parentGuest: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      seats: true,
    },
    orderBy: [
      { parentGuestId: 'asc' },
      { firstName: 'asc' },
    ],
  })

  console.log(`Found ${hannahVariants.length} guest(s) with names containing "Hanna":\n`)

  for (const guest of hannahVariants) {
    console.log(`${guest.firstName} ${guest.lastName}`)
    console.log(`  ID: ${guest.id}`)
    console.log(`  Parent Guest ID: ${guest.parentGuestId || 'None (primary guest)'}`)
    if (guest.parentGuest) {
      console.log(`  Parent: ${guest.parentGuest.firstName} ${guest.parentGuest.lastName}`)
    }
    console.log(`  Household ID: ${guest.householdId || 'None'}`)
    console.log(`  Seated: ${guest.seats.length > 0 ? 'Yes' : 'No'}`)
    console.log()
  }
}

findAllHannahRecords()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
