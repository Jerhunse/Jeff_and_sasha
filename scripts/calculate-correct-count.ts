import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("📊 Calculating CORRECT guest count from RSVP responses...\n")

  // Get all primary guests (not plus-ones)
  const primaryGuests = await prisma.guest.findMany({
    where: {
      coupleId: 'cmgn7015b0000y44c73zxrwpc',
      parentGuestId: null,
    },
    include: {
      rsvpResponses: {
        where: { eventId: null },
        orderBy: { respondedAt: 'desc' },
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

  let yesCount = 0
  let noCount = 0
  let noResponseCount = 0
  let totalPeople = 0

  console.log("BREAKDOWN BY PRIMARY GUEST:")
  console.log("─".repeat(80))

  for (const guest of primaryGuests) {
    const rsvp = guest.rsvpResponses[0]
    
    if (!rsvp) {
      noResponseCount++
      console.log(`❓ ${guest.firstName} ${guest.lastName} - No RSVP yet`)
      continue
    }

    if (rsvp.status === 'NO') {
      noCount++
      console.log(`❌ ${guest.firstName} ${guest.lastName} - Declined`)
      continue
    }

    if (rsvp.status === 'YES') {
      // Count this guest
      let guestPartySize = 1
      
      // Count plus-ones from the Guest records (converted plus-ones)
      const plusOneCount = guest.plusOnes.length
      guestPartySize += plusOneCount
      
      totalPeople += guestPartySize
      yesCount++
      
      if (plusOneCount > 0) {
        const plusOneNames = guest.plusOnes.map(p => `${p.firstName} ${p.lastName}`).join(', ')
        console.log(`✅ ${guest.firstName} ${guest.lastName} + ${plusOneCount} (+${plusOneNames})`)
      } else {
        console.log(`✅ ${guest.firstName} ${guest.lastName}`)
      }
    }
  }

  console.log("\n📊 FINAL COUNT:")
  console.log("─".repeat(80))
  console.log(`Primary guests who RSVP'd YES: ${yesCount}`)
  console.log(`Primary guests who RSVP'd NO: ${noCount}`)
  console.log(`Primary guests with no response: ${noResponseCount}`)
  console.log(``)
  console.log(`TOTAL PEOPLE ATTENDING: ${totalPeople}`)
  console.log(``)
  console.log(`Excel shows: 181`)
  console.log(`Difference: ${totalPeople - 181}`)

  // Show breakdown
  const allGuestRecords = await prisma.guest.count({
    where: { coupleId: 'cmgn7015b0000y44c73zxrwpc' },
  })
  
  console.log(`\n📊 DATABASE RECORDS:`)
  console.log(`─`.repeat(80))
  console.log(`Total Guest records in database: ${allGuestRecords}`)
  console.log(`  - Primary guests: ${primaryGuests.length}`)
  console.log(`  - Plus-one records: ${allGuestRecords - primaryGuests.length}`)
  console.log(``)
  console.log(`Actual people attending (from RSVPs): ${totalPeople}`)
  console.log(``)
  console.log(`The UI should show ${totalPeople}, not ${allGuestRecords}`)
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
