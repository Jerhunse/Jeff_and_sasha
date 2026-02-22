import { prisma } from "../lib/prisma"

async function findGuestsWithUnconvertedPlusOnes() {
  console.log("\n=== Finding guests with text-only plus-ones ===\n")
  
  // Find all primary guests with plusOneName in their RSVP but no plusOne Guest records
  const guestsWithTextPlusOnes = await prisma.guest.findMany({
    where: {
      parentGuestId: null, // Primary guests only
      rsvpResponses: {
        some: {
          plusOneName: {
            not: null,
          },
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      coupleId: true,
      householdId: true,
      allowPlusOne: true,
      rsvpResponses: {
        where: {
          plusOneName: { not: null },
        },
        select: {
          id: true,
          status: true,
          plusOneName: true,
        },
        take: 1,
      },
      plusOnes: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  })

  console.log(`Found ${guestsWithTextPlusOnes.length} guests with text-only plus-ones:\n`)

  const needsConversion = guestsWithTextPlusOnes.filter(g => g.plusOnes.length === 0)

  console.log(`Guests needing conversion: ${needsConversion.length}\n`)

  for (const guest of needsConversion) {
    const plusOneName = guest.rsvpResponses[0]?.plusOneName
    console.log(`\n${guest.firstName} ${guest.lastName}`)
    console.log(`  Plus One Name: ${plusOneName}`)
    console.log(`  Existing Plus One Records: ${guest.plusOnes.length}`)
  }

  return needsConversion
}

findGuestsWithUnconvertedPlusOnes()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
