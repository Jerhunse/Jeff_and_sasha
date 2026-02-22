import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔍 Analyzing guest data for discrepancies...\n")

  const allGuests = await prisma.guest.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      parentGuestId: true,
      coupleId: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  const coupleGuests = allGuests.filter(g => g.coupleId === 'cmgn7015b0000y44c73zxrwpc')
  
  // 1. Check for exact duplicate names
  console.log("1️⃣  Checking for duplicate names...")
  const nameMap = new Map<string, typeof coupleGuests>()
  
  for (const guest of coupleGuests) {
    const key = `${guest.firstName.trim()} ${guest.lastName.trim()}`.toLowerCase()
    if (!nameMap.has(key)) {
      nameMap.set(key, [])
    }
    nameMap.get(key)!.push(guest)
  }
  
  const duplicateNames = Array.from(nameMap.entries())
    .filter(([_, guests]) => guests.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
  
  if (duplicateNames.length > 0) {
    console.log(`\n⚠️  Found ${duplicateNames.length} duplicate names:\n`)
    let totalDuplicates = 0
    for (const [name, guests] of duplicateNames) {
      console.log(`  ${name} (${guests.length} instances):`)
      for (const g of guests) {
        const type = g.parentGuestId ? `plus-one of ${g.parentGuestId}` : 'primary guest'
        console.log(`    - ID: ${g.id} | ${type} | Created: ${g.createdAt.toISOString().split('T')[0]}`)
      }
      totalDuplicates += guests.length - 1 // Count extras
      console.log()
    }
    console.log(`  Total extra guests from duplicates: ${totalDuplicates}\n`)
  } else {
    console.log("  ✅ No duplicate names found\n")
  }

  // 2. Check for guests with same email
  console.log("2️⃣  Checking for duplicate emails...")
  const emailMap = new Map<string, typeof coupleGuests>()
  
  for (const guest of coupleGuests) {
    if (guest.email) {
      const key = guest.email.trim().toLowerCase()
      if (!emailMap.has(key)) {
        emailMap.set(key, [])
      }
      emailMap.get(key)!.push(guest)
    }
  }
  
  const duplicateEmails = Array.from(emailMap.entries())
    .filter(([_, guests]) => guests.length > 1)
  
  if (duplicateEmails.length > 0) {
    console.log(`\n⚠️  Found ${duplicateEmails.length} duplicate emails:\n`)
    for (const [email, guests] of duplicateEmails) {
      console.log(`  ${email}:`)
      for (const g of guests) {
        const type = g.parentGuestId ? 'plus-one' : 'primary'
        console.log(`    - ${g.firstName} ${g.lastName} (${type})`)
      }
      console.log()
    }
  } else {
    console.log("  ✅ No duplicate emails found\n")
  }

  // 3. Check for orphaned plus-ones
  console.log("3️⃣  Checking for orphaned plus-ones...")
  const primaryIds = new Set(coupleGuests.filter(g => !g.parentGuestId).map(g => g.id))
  const orphaned = coupleGuests.filter(g => g.parentGuestId && !primaryIds.has(g.parentGuestId))
  
  if (orphaned.length > 0) {
    console.log(`\n⚠️  Found ${orphaned.length} orphaned plus-ones:\n`)
    for (const g of orphaned) {
      console.log(`  - ${g.firstName} ${g.lastName} (ID: ${g.id}, parent: ${g.parentGuestId})`)
    }
    console.log()
  } else {
    console.log("  ✅ No orphaned plus-ones found\n")
  }

  // 4. Summary
  console.log("📊 SUMMARY")
  console.log("─".repeat(50))
  const primary = coupleGuests.filter(g => !g.parentGuestId).length
  const plusOnes = coupleGuests.filter(g => g.parentGuestId).length
  console.log(`Primary guests: ${primary}`)
  console.log(`Plus-ones: ${plusOnes}`)
  console.log(`Total in database: ${coupleGuests.length}`)
  console.log(`Expected total: 182`)
  console.log(`Difference: ${coupleGuests.length - 182}`)
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
