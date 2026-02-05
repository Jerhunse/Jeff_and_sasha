import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Test the lookup functionality
async function testLookup() {
  console.log("\n🧪 Testing RSVP Lookup Functionality\n")

  const couple = await prisma.couple.findFirst({
    where: { slug: "jeff-and-sasha" },
  })

  if (!couple) {
    console.error("❌ Could not find wedding couple")
    return
  }

  // Test 1: Lookup by phone
  console.log("Test 1: Lookup by phone number")
  const phone = "4049809690" // Jeff & Sasha
  const guestByPhone = await prisma.guest.findFirst({
    where: {
      coupleId: couple.id,
      phone: { contains: phone },
    },
    select: {
      firstName: true,
      lastName: true,
      phone: true,
      maxGuestsAllowed: true,
    },
  })

  if (guestByPhone) {
    console.log(`✅ Found: ${guestByPhone.firstName} ${guestByPhone.lastName}`)
    console.log(`   Phone: ${guestByPhone.phone}`)
    console.log(`   Max Guests: ${guestByPhone.maxGuestsAllowed}\n`)
  } else {
    console.log(`❌ Not found\n`)
  }

  // Test 2: Lookup by name (single match)
  console.log("Test 2: Lookup by name (single match)")
  const guestByNameSingle = await prisma.guest.findMany({
    where: {
      coupleId: couple.id,
      OR: [
        { firstName: { contains: "Walter", mode: "insensitive" } },
        { lastName: { contains: "Walter", mode: "insensitive" } },
      ],
    },
    select: {
      firstName: true,
      lastName: true,
      phone: true,
      maxGuestsAllowed: true,
    },
  })

  console.log(`   Found ${guestByNameSingle.length} match(es)`)
  guestByNameSingle.forEach((g) => {
    console.log(`   - ${g.firstName} ${g.lastName} (${g.maxGuestsAllowed} guests)`)
  })
  console.log()

  // Test 3: Lookup by name (multiple matches)
  console.log("Test 3: Lookup by name (multiple matches)")
  const guestByNameMultiple = await prisma.guest.findMany({
    where: {
      coupleId: couple.id,
      OR: [
        { firstName: { contains: "Martinez", mode: "insensitive" } },
        { lastName: { contains: "Martinez", mode: "insensitive" } },
      ],
    },
    select: {
      firstName: true,
      lastName: true,
      phone: true,
      maxGuestsAllowed: true,
    },
  })

  console.log(`   Found ${guestByNameMultiple.length} match(es)`)
  guestByNameMultiple.forEach((g) => {
    const phoneDisplay = g.phone || "No phone"
    console.log(
      `   - ${g.firstName} ${g.lastName} (${g.maxGuestsAllowed} guests) - ${phoneDisplay}`
    )
  })
  console.log()

  // Test 4: Guests without phone numbers
  console.log("Test 4: Guests without phone numbers (sample)")
  const guestsWithoutPhone = await prisma.guest.findMany({
    where: {
      coupleId: couple.id,
      phone: null,
    },
    take: 5,
    select: {
      firstName: true,
      lastName: true,
      maxGuestsAllowed: true,
    },
  })

  console.log(`   Total without phone: ${guestsWithoutPhone.length}`)
  guestsWithoutPhone.forEach((g) => {
    console.log(`   - ${g.firstName} ${g.lastName} (${g.maxGuestsAllowed} guests)`)
  })
  console.log()

  // Test 5: Party size distribution
  console.log("Test 5: Party size distribution")
  const allGuests = await prisma.guest.findMany({
    where: { coupleId: couple.id },
    select: { maxGuestsAllowed: true },
  })

  const distribution: Record<number, number> = {}
  allGuests.forEach((g) => {
    distribution[g.maxGuestsAllowed] =
      (distribution[g.maxGuestsAllowed] || 0) + 1
  })

  Object.entries(distribution)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([size, count]) => {
      console.log(`   ${size} guest(s): ${count} parties`)
    })
}

testLookup()
  .catch((error) => {
    console.error("Error:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
