import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("📊 Checking guest counts...\n")

  // Get all guests for the couple
  const allGuests = await prisma.guest.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      parentGuestId: true,
      coupleId: true,
    },
  })

  // Assume there's only one couple (or use a specific coupleId)
  const coupleIds = [...new Set(allGuests.map(g => g.coupleId))]
  
  for (const coupleId of coupleIds) {
    const coupleGuests = allGuests.filter(g => g.coupleId === coupleId)
    const primaryGuests = coupleGuests.filter(g => g.parentGuestId === null)
    const plusOnes = coupleGuests.filter(g => g.parentGuestId !== null)
    
    console.log(`Couple ID: ${coupleId}`)
    console.log(`  Primary guests: ${primaryGuests.length}`)
    console.log(`  Plus-ones: ${plusOnes.length}`)
    console.log(`  Total: ${coupleGuests.length}`)
    console.log()
  }

  // Check for any orphaned plus-ones (parentGuestId points to non-existent guest)
  const primaryGuestIds = new Set(allGuests.filter(g => g.parentGuestId === null).map(g => g.id))
  const orphanedPlusOnes = allGuests.filter(g => 
    g.parentGuestId !== null && !primaryGuestIds.has(g.parentGuestId)
  )

  if (orphanedPlusOnes.length > 0) {
    console.log("⚠️  Found orphaned plus-ones (parent guest doesn't exist):")
    for (const guest of orphanedPlusOnes) {
      console.log(`  - ${guest.firstName} ${guest.lastName} (ID: ${guest.id}, parentGuestId: ${guest.parentGuestId})`)
    }
    console.log()
  }

  // Check for duplicates
  const guestNames = allGuests.map(g => `${g.firstName} ${g.lastName}`)
  const duplicates = guestNames.filter((name, index) => guestNames.indexOf(name) !== index)
  const uniqueDuplicates = [...new Set(duplicates)]
  
  if (uniqueDuplicates.length > 0) {
    console.log("⚠️  Found duplicate guest names:")
    for (const name of uniqueDuplicates) {
      const matches = allGuests.filter(g => `${g.firstName} ${g.lastName}` === name)
      console.log(`  - ${name} (${matches.length} instances):`)
      for (const match of matches) {
        console.log(`    ID: ${match.id}, parentGuestId: ${match.parentGuestId || 'null'}`)
      }
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
