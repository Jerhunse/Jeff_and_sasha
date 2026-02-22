import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("📊 Investigating the 182 vs 201 discrepancy...\n")

  const allGuests = await prisma.guest.findMany({
    where: { coupleId: 'cmgn7015b0000y44c73zxrwpc' },
    include: {
      rsvpResponses: {
        where: { eventId: null },
        orderBy: { respondedAt: 'desc' },
        take: 1,
      },
      household: true,
    },
  })

  // Method 1: Count all guests
  console.log("METHOD 1: All guests in system")
  console.log(`  Total: ${allGuests.length}`)

  // Method 2: Count only attending
  const attending = allGuests.filter(g => g.rsvpResponses[0]?.status === 'YES')
  console.log("\nMETHOD 2: Only attending guests")
  console.log(`  Total: ${attending.length}`)

  // Method 3: Count households
  const households = new Set(allGuests.map(g => g.household?.id || `individual-${g.id}`))
  console.log("\nMETHOD 3: By household")
  console.log(`  Total households: ${households.size}`)

  // Method 4: Primary guests + attending plus-ones only
  const primary = allGuests.filter(g => !g.parentGuestId)
  const plusOnesAttending = allGuests.filter(g => g.parentGuestId && g.rsvpResponses[0]?.status === 'YES')
  console.log("\nMETHOD 4: Primary + only attending plus-ones")
  console.log(`  Primary: ${primary.length}`)
  console.log(`  Plus-ones attending: ${plusOnesAttending.length}`)
  console.log(`  Total: ${primary.length + plusOnesAttending.length}`)

  // Method 5: Check if 182 matches anything
  console.log("\nPOSSIBLE MATCHES FOR 182:")
  
  // Maybe 182 = attending + no response (excluding NO)?
  const notDeclined = allGuests.filter(g => g.rsvpResponses[0]?.status !== 'NO')
  console.log(`  Attending + No response (exclude NO): ${notDeclined.length}`)
  
  // Maybe 182 = attending + some portion of no-response?
  const noResponse = allGuests.filter(g => !g.rsvpResponses[0])
  console.log(`  No response guests: ${noResponse.length}`)
  console.log(`  If 182 = 190 attending + X no-response, then X = ${182 - 190} (but we have ${noResponse.length} no-response)`)
  
  // Maybe there were 19 guests added by mistake?
  console.log(`\nDifference: ${allGuests.length} - 182 = ${allGuests.length - 182}`)
  
  // Show the 9 no-response guests
  console.log("\nGUESTS WITH NO RSVP:")
  console.log("─".repeat(70))
  for (const g of noResponse) {
    const type = g.parentGuestId ? '(plus-one)' : '(primary)'
    console.log(`  - ${g.firstName} ${g.lastName} ${type}`)
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
