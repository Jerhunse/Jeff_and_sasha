import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔧 Fixing plus-ones to inherit parent's household...\n")

  // Get all plus-ones (guests with parentGuestId set)
  const plusOnes = await prisma.guest.findMany({
    where: {
      coupleId: 'cmgn7015b0000y44c73zxrwpc',
      parentGuestId: { not: null },
    },
    include: {
      parentGuest: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          householdId: true,
        },
      },
    },
  })

  console.log(`Found ${plusOnes.length} plus-ones to update\n`)

  let updated = 0
  for (const plusOne of plusOnes) {
    if (!plusOne.parentGuest) {
      console.log(`  ⚠️  ${plusOne.firstName} ${plusOne.lastName} - parent guest not found!`)
      continue
    }

    if (plusOne.householdId === plusOne.parentGuest.householdId) {
      // Already correct
      continue
    }

    await prisma.guest.update({
      where: { id: plusOne.id },
      data: { householdId: plusOne.parentGuest.householdId },
    })

    updated++
    if (updated <= 20) {
      console.log(`  ✓ ${plusOne.firstName} ${plusOne.lastName} → ${plusOne.parentGuest.firstName} ${plusOne.parentGuest.lastName}'s household`)
    }
  }

  if (updated > 20) {
    console.log(`  ... and ${updated - 20} more`)
  }

  console.log(`\n✅ Updated ${updated} plus-ones with correct household`)

  // Now show the corrected stats
  console.log("\n📊 CORRECTED STATS:")
  console.log("─".repeat(70))

  const allGuests = await prisma.guest.findMany({
    where: { coupleId: 'cmgn7015b0000y44c73zxrwpc' },
    include: {
      household: true,
    },
  })

  const households = new Map<string, typeof allGuests>()
  for (const guest of allGuests) {
    const key = guest.householdId || `individual-${guest.id}`
    if (!households.has(key)) {
      households.set(key, [])
    }
    households.get(key)!.push(guest)
  }

  console.log(`Total guests: ${allGuests.length}`)
  console.log(`Total households: ${households.size}`)
  console.log(`Target (from Excel): 181 guests in 90 households`)
  console.log(``)
  console.log(`Difference in guests: ${allGuests.length - 181}`)
  console.log(`Difference in households: ${households.size - 90}`)
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
