import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Common test/placeholder names
const testNames = [
  'jane doe', 'john doe', 'john smith', 'bob johnson', 'test user',
  'sample guest', 'placeholder', 'dummy', 'example'
]

async function main() {
  console.log("🔍 Looking for potential test/placeholder guests...\n")

  const allGuests = await prisma.guest.findMany({
    where: { coupleId: 'cmgn7015b0000y44c73zxrwpc' },
    include: {
      rsvpResponses: {
        where: { eventId: null },
        orderBy: { respondedAt: 'desc' },
        take: 1,
      },
      seats: true,
    },
    orderBy: [
      { createdAt: 'desc' }, // Most recent first
    ],
  })

  // Find potential test guests
  const suspicious = allGuests.filter(g => {
    const fullName = `${g.firstName} ${g.lastName}`.toLowerCase()
    return testNames.some(test => fullName.includes(test)) ||
           !g.email || // No email
           g.firstName.toLowerCase().includes('test') ||
           g.lastName.toLowerCase().includes('test')
  })

  if (suspicious.length > 0) {
    console.log(`⚠️  Found ${suspicious.length} suspicious/test guests:\n`)
    for (const g of suspicious) {
      const type = g.parentGuestId ? '(plus-one)' : '(primary)'
      const rsvp = g.rsvpResponses[0]?.status || 'No RSVP'
      const seated = g.seats.length > 0 ? '✓ seated' : '  not seated'
      console.log(`  - ${g.firstName} ${g.lastName} ${type} | ${rsvp} | ${seated} | Created: ${g.createdAt.toISOString().split('T')[0]}`)
    }
    console.log(`\n  If we remove these: ${allGuests.length} - ${suspicious.length} = ${allGuests.length - suspicious.length}`)
  }

  // Also look for recently added guests (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  const recentGuests = allGuests.filter(g => g.createdAt > weekAgo)
  console.log(`\n📅 Recently added guests (last 7 days): ${recentGuests.length}`)
  if (recentGuests.length > 0 && recentGuests.length <= 25) {
    for (const g of recentGuests) {
      const type = g.parentGuestId ? '(plus-one)' : '(primary)'
      const rsvp = g.rsvpResponses[0]?.status || 'No RSVP'
      console.log(`  - ${g.firstName} ${g.lastName} ${type} | ${rsvp}`)
    }
  }

  // Check for guests with no RSVP and not seated
  const noRsvpNotSeated = allGuests.filter(g => !g.rsvpResponses[0] && g.seats.length === 0)
  console.log(`\n🤔 Guests with no RSVP and not seated: ${noRsvpNotSeated.length}`)
  if (noRsvpNotSeated.length > 0) {
    for (const g of noRsvpNotSeated) {
      const type = g.parentGuestId ? '(plus-one)' : '(primary)'
      console.log(`  - ${g.firstName} ${g.lastName} ${type}`)
    }
    console.log(`\n  If we exclude these: ${allGuests.length} - ${noRsvpNotSeated.length} = ${allGuests.length - noRsvpNotSeated.length}`)
  }

  console.log(`\n📊 SUMMARY:`)
  console.log(`  Current total: ${allGuests.length}`)
  console.log(`  Target total: 182`)
  console.log(`  Difference: ${allGuests.length - 182}`)
  console.log(`  `)
  console.log(`  Suspicious/test guests: ${suspicious.length}`)
  console.log(`  No RSVP + not seated: ${noRsvpNotSeated.length}`)
  console.log(`  `)
  console.log(`  Removing suspicious: ${allGuests.length - suspicious.length}`)
  console.log(`  Removing no-RSVP-not-seated: ${allGuests.length - noRsvpNotSeated.length}`)
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
