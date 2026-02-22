import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔍 Finding the 17 extra guests...\n")

  const allGuests = await prisma.guest.findMany({
    where: { coupleId: 'cmgn7015b0000y44c73zxrwpc' },
    include: {
      parentGuest: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      rsvpResponses: {
        where: { eventId: null },
        take: 1,
      },
    },
    orderBy: [
      { lastName: 'asc' },
      { firstName: 'asc' },
    ],
  })

  console.log(`Current total: ${allGuests.length}`)
  console.log(`Target: 181`)
  console.log(`Need to remove: 17\n`)

  // Strategy 1: Find exact duplicates (same first + last name)
  console.log("1️⃣  EXACT DUPLICATES:")
  console.log("─".repeat(70))
  
  const nameMap = new Map<string, typeof allGuests>()
  for (const guest of allGuests) {
    const key = `${guest.firstName.trim().toLowerCase()}|${guest.lastName.trim().toLowerCase()}`
    if (!nameMap.has(key)) {
      nameMap.set(key, [])
    }
    nameMap.get(key)!.push(guest)
  }

  const duplicates = Array.from(nameMap.entries())
    .filter(([_, guests]) => guests.length > 1)
    .sort((a, b) => b[1].length - a[1].length)

  let duplicateCount = 0
  for (const [name, guests] of duplicates) {
    const [firstName, lastName] = name.split('|')
    console.log(`\n  ${firstName} ${lastName} (${guests.length} instances):`)
    for (const g of guests) {
      const type = g.parentGuestId ? `plus-one of ${g.parentGuest?.firstName} ${g.parentGuest?.lastName}` : 'primary'
      const rsvp = g.rsvpResponses[0]?.status || 'No RSVP'
      console.log(`    - ID: ${g.id.slice(0, 12)}... | ${type} | ${rsvp} | Created: ${g.createdAt.toISOString().split('T')[0]}`)
    }
    duplicateCount += guests.length - 1 // Count extras
  }

  console.log(`\n  Total duplicate extras: ${duplicateCount}`)

  // Strategy 2: Find suspicious guests
  console.log("\n\n2️⃣  SUSPICIOUS GUESTS (no RSVP + primary):")
  console.log("─".repeat(70))
  
  const suspicious = allGuests.filter(g => 
    !g.parentGuestId && // Primary guest
    !g.rsvpResponses[0] // No RSVP
  )

  for (const g of suspicious) {
    console.log(`  - ${g.firstName} ${g.lastName}`)
  }
  console.log(`\n  Total: ${suspicious.length}`)

  // Summary
  console.log("\n\n📊 SUMMARY:")
  console.log("─".repeat(70))
  console.log(`Exact duplicates to remove: ${duplicateCount}`)
  console.log(`Suspicious (no RSVP primaries): ${suspicious.length}`)
  console.log(`Total candidates: ${duplicateCount + suspicious.length}`)
  console.log(`Target to remove: 17`)
  
  if (duplicateCount + suspicious.length >= 17) {
    console.log(`\n✅ Found enough candidates!`)
    console.log(`\nRECOMMENDATION: Remove ${duplicateCount} duplicates + ${17 - duplicateCount} suspicious guests`)
  } else {
    console.log(`\n⚠️  Need to find ${17 - (duplicateCount + suspicious.length)} more candidates`)
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
