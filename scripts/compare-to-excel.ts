import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Based on the Excel screenshot - 90 groups with 181 total guests
// The database currently has 198 guests, so 17 are extra

async function main() {
  console.log("📊 Comparing database to Excel source of truth...\n")
  
  const allGuests = await prisma.guest.findMany({
    where: { coupleId: 'cmgn7015b0000y44c73zxrwpc' },
    include: {
      household: true,
      rsvpResponses: {
        where: { eventId: null },
        take: 1,
      },
    },
    orderBy: [
      { householdId: 'asc' },
      { lastName: 'asc' },
      { firstName: 'asc' },
    ],
  })

  console.log(`Database total: ${allGuests.length}`)
  console.log(`Excel total: 181`)
  console.log(`Difference: ${allGuests.length - 181}\n`)

  // Group by household
  const byHousehold = new Map<string, typeof allGuests>()
  
  for (const guest of allGuests) {
    const key = guest.household?.name || `${guest.firstName} ${guest.lastName}`
    if (!byHousehold.has(key)) {
      byHousehold.set(key, [])
    }
    byHousehold.get(key)!.push(guest)
  }

  console.log(`Households in database: ${byHousehold.size}`)
  console.log(`Households in Excel: 90\n`)

  // Show households with their counts
  console.log("HOUSEHOLDS AND GUEST COUNTS:")
  console.log("─".repeat(70))
  
  const sortedHouseholds = Array.from(byHousehold.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
  
  let totalCount = 0
  for (const [household, guests] of sortedHouseholds) {
    const primaryGuest = guests.find(g => !g.parentGuestId)
    const rsvpStatus = primaryGuest?.rsvpResponses[0]?.status || 'No RSVP'
    console.log(`  ${household.padEnd(35)} | Count: ${guests.length} | ${rsvpStatus}`)
    totalCount += guests.length
    
    // Show individual guests if more than 1
    if (guests.length > 1) {
      for (const g of guests) {
        const type = g.parentGuestId ? '  +' : '  *'
        console.log(`    ${type} ${g.firstName} ${g.lastName}`)
      }
    }
  }
  
  console.log(`\nTotal guests: ${totalCount}`)
  
  // Find guests with no RSVP
  console.log("\n\nGUESTS TO POTENTIALLY REMOVE:")
  console.log("─".repeat(70))
  
  const candidates = allGuests.filter(g => {
    // Primary guests with no RSVP
    if (!g.parentGuestId && !g.rsvpResponses[0]) {
      return true
    }
    return false
  })
  
  console.log(`\nPrimary guests with no RSVP (${candidates.length}):`)
  for (const g of candidates) {
    console.log(`  - ${g.firstName} ${g.lastName} (household: ${g.household?.name || 'none'})`)
  }
  
  console.log(`\nIf we remove these ${candidates.length}, new total would be: ${allGuests.length - candidates.length}`)
  console.log(`Target: 181`)
  console.log(`Still need to remove: ${(allGuests.length - candidates.length) - 181} more`)
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
