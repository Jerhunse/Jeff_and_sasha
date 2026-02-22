import { prisma } from "../lib/prisma"

async function checkHannahData() {
  console.log("\n=== Checking Hannah Aiwanseoba Data ===\n")
  
  // Find all Aiwanseoba guests
  const aiwanseobaGuests = await prisma.guest.findMany({
    where: {
      lastName: "Aiwanseoba",
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      parentGuestId: true,
      allowPlusOne: true,
      household: {
        select: {
          id: true,
          name: true,
        },
      },
      parentGuest: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      plusOnes: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      rsvpResponses: {
        select: {
          status: true,
          plusOneName: true,
        },
      },
    },
    orderBy: {
      firstName: 'asc',
    },
  })

  console.log(`Found ${aiwanseobaGuests.length} Aiwanseoba guests:\n`)
  
  for (const guest of aiwanseobaGuests) {
    console.log(`\n--- ${guest.firstName} ${guest.lastName} ---`)
    console.log(`ID: ${guest.id}`)
    console.log(`Parent Guest ID: ${guest.parentGuestId || 'None (primary guest)'}`)
    if (guest.parentGuest) {
      console.log(`  Parent: ${guest.parentGuest.firstName} ${guest.parentGuest.lastName}`)
    }
    console.log(`Household: ${guest.household?.name || 'None'}`)
    console.log(`Allow Plus One: ${guest.allowPlusOne}`)
    console.log(`Plus Ones: ${guest.plusOnes.length}`)
    if (guest.plusOnes.length > 0) {
      guest.plusOnes.forEach(po => {
        console.log(`  - ${po.firstName} ${po.lastName} (${po.id})`)
      })
    }
    console.log(`RSVP Responses: ${guest.rsvpResponses.length}`)
    guest.rsvpResponses.forEach(rsvp => {
      console.log(`  - Status: ${rsvp.status}, Plus One Name: ${rsvp.plusOneName || 'None'}`)
    })
  }

  // Check for total guest count
  const totalPrimaryGuests = await prisma.guest.count({
    where: { parentGuestId: null },
  })

  const totalPlusOneGuests = await prisma.guest.count({
    where: { parentGuestId: { not: null } },
  })

  const totalGuests = await prisma.guest.count()

  console.log("\n\n=== Total Guest Counts ===")
  console.log(`Primary Guests: ${totalPrimaryGuests}`)
  console.log(`Plus One Guests: ${totalPlusOneGuests}`)
  console.log(`Total Guests in DB: ${totalGuests}`)
  console.log(`Expected in UI (primary + plus-ones): ${totalPrimaryGuests + totalPlusOneGuests}`)
}

checkHannahData()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
