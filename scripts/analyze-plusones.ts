import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔍 Analyzing plus-one assignments...\n")

  // Get primary guests with their plus-one info
  const primaryGuests = await prisma.guest.findMany({
    where: {
      coupleId: 'cmgn7015b0000y44c73zxrwpc',
      parentGuestId: null,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      allowPlusOne: true,
      rsvpResponses: {
        where: { eventId: null },
        select: {
          status: true,
          plusOneName: true,
        },
        orderBy: { respondedAt: 'desc' },
        take: 1,
      },
      plusOnes: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rsvpResponses: {
            where: { eventId: null },
            select: {
              status: true,
            },
            take: 1,
          },
        },
      },
    },
  })

  console.log("PLUS-ONE ANALYSIS:")
  console.log("─".repeat(70))

  let allowedPlusOne = 0
  let hasPlusOneRecord = 0
  let plusOneNameOnly = 0
  let plusOnesAttending = 0
  let plusOnesNotAttending = 0
  let plusOnesNoResponse = 0

  for (const guest of primaryGuests) {
    if (guest.allowPlusOne) {
      allowedPlusOne++
    }

    if (guest.plusOnes.length > 0) {
      hasPlusOneRecord += guest.plusOnes.length
      
      for (const plusOne of guest.plusOnes) {
        if (plusOne.rsvpResponses[0]?.status === 'YES') {
          plusOnesAttending++
        } else if (plusOne.rsvpResponses[0]?.status === 'NO') {
          plusOnesNotAttending++
        } else {
          plusOnesNoResponse++
        }
      }
    }

    // Check for name-only plus-ones (not converted to records)
    if (guest.rsvpResponses[0]?.plusOneName && guest.plusOnes.length === 0) {
      plusOneNameOnly++
    }
  }

  console.log(`Primary guests allowed plus-one: ${allowedPlusOne}`)
  console.log(`Plus-one Guest records created: ${hasPlusOneRecord}`)
  console.log(`Plus-ones attending (YES): ${plusOnesAttending}`)
  console.log(`Plus-ones not attending (NO): ${plusOnesNotAttending}`)
  console.log(`Plus-ones no response: ${plusOnesNoResponse}`)
  console.log(`Plus-ones as name only (not converted): ${plusOneNameOnly}`)

  console.log("\nPOTENTIAL EXPLANATION:")
  console.log("─".repeat(70))
  console.log(`If expected count (182) = Primary (93) + Plus-ones actually attending:`)
  console.log(`  ${primaryGuests.length} primary + X plus-ones = 182`)
  console.log(`  X = 182 - ${primaryGuests.length} = ${182 - primaryGuests.length}`)
  console.log(``)
  console.log(`Current plus-ones attending: ${plusOnesAttending}`)
  console.log(`Current plus-ones with no response: ${plusOnesNoResponse}`)
  console.log(``)
  console.log(`If we assume only ${182 - primaryGuests.length} plus-ones will actually attend:`)
  console.log(`  That would be ${hasPlusOneRecord - (182 - primaryGuests.length)} fewer than currently in system`)

  // Find guests with multiple plus-ones
  console.log("\n\nGUESTS WITH MULTIPLE PLUS-ONES:")
  console.log("─".repeat(70))
  const multiPlusOne = primaryGuests.filter(g => g.plusOnes.length > 1)
  if (multiPlusOne.length > 0) {
    for (const g of multiPlusOne) {
      console.log(`  ${g.firstName} ${g.lastName}: ${g.plusOnes.length} plus-ones`)
      for (const po of g.plusOnes) {
        const status = po.rsvpResponses[0]?.status || 'No response'
        console.log(`    - ${po.firstName} ${po.lastName} (${status})`)
      }
    }
  } else {
    console.log("  None found")
  }
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
