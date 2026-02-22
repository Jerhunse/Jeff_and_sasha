import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("📊 Breaking down guest counts by RSVP status...\n")

  const guests = await prisma.guest.findMany({
    where: {
      coupleId: 'cmgn7015b0000y44c73zxrwpc',
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      parentGuestId: true,
      rsvpResponses: {
        where: { eventId: null },
        select: {
          status: true,
        },
        orderBy: { respondedAt: 'desc' },
        take: 1,
      },
    },
  })

  const primary = guests.filter(g => !g.parentGuestId)
  const plusOnes = guests.filter(g => g.parentGuestId)

  console.log("PRIMARY GUESTS:")
  console.log("─".repeat(50))
  const primaryYes = primary.filter(g => g.rsvpResponses[0]?.status === 'YES').length
  const primaryNo = primary.filter(g => g.rsvpResponses[0]?.status === 'NO').length
  const primaryMaybe = primary.filter(g => g.rsvpResponses[0]?.status === 'MAYBE').length
  const primaryNoResponse = primary.filter(g => !g.rsvpResponses[0]).length
  
  console.log(`  YES: ${primaryYes}`)
  console.log(`  NO: ${primaryNo}`)
  console.log(`  MAYBE: ${primaryMaybe}`)
  console.log(`  No response: ${primaryNoResponse}`)
  console.log(`  Total primary: ${primary.length}`)

  console.log("\nPLUS-ONES:")
  console.log("─".repeat(50))
  const plusOneYes = plusOnes.filter(g => g.rsvpResponses[0]?.status === 'YES').length
  const plusOneNo = plusOnes.filter(g => g.rsvpResponses[0]?.status === 'NO').length
  const plusOneMaybe = plusOnes.filter(g => g.rsvpResponses[0]?.status === 'MAYBE').length
  const plusOneNoResponse = plusOnes.filter(g => !g.rsvpResponses[0]).length
  
  console.log(`  YES: ${plusOneYes}`)
  console.log(`  NO: ${plusOneNo}`)
  console.log(`  MAYBE: ${plusOneMaybe}`)
  console.log(`  No response: ${plusOneNoResponse}`)
  console.log(`  Total plus-ones: ${plusOnes.length}`)

  console.log("\nOVERALL:")
  console.log("─".repeat(50))
  console.log(`  Total attending (YES): ${primaryYes + plusOneYes}`)
  console.log(`  Total declined (NO): ${primaryNo + plusOneNo}`)
  console.log(`  Total maybe: ${primaryMaybe + plusOneMaybe}`)
  console.log(`  Total no response: ${primaryNoResponse + plusOneNoResponse}`)
  console.log(`  `)
  console.log(`  Total in system: ${guests.length}`)
  console.log(`  Attending + No Response: ${primaryYes + plusOneYes + primaryNoResponse + plusOneNoResponse}`)
  console.log(`  Everyone except NO: ${guests.length - primaryNo - plusOneNo}`)

  // Show some examples of NO responses
  if (primaryNo + plusOneNo > 0) {
    console.log("\nGUESTS WHO DECLINED:")
    console.log("─".repeat(50))
    const declined = guests.filter(g => g.rsvpResponses[0]?.status === 'NO')
    for (const g of declined.slice(0, 10)) {
      const type = g.parentGuestId ? '(plus-one)' : '(primary)'
      console.log(`  - ${g.firstName} ${g.lastName} ${type}`)
    }
    if (declined.length > 10) {
      console.log(`  ... and ${declined.length - 10} more`)
    }
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
