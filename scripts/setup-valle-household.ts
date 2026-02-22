import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🏠 Setting up Valle's household for testing...")

  // Get the couple record
  const couple = await prisma.couple.findFirst({
    where: { slug: "jeff-and-sasha" },
  })

  if (!couple) {
    console.error("❌ Could not find wedding couple with slug 'jeff-and-sasha'")
    process.exit(1)
  }

  console.log(`✅ Found wedding: ${couple.partner1Name} & ${couple.partner2Name}`)

  // Check if Valle's household already exists
  let household = await prisma.household.findFirst({
    where: {
      coupleId: couple.id,
      name: "Valle's",
    },
    include: {
      guests: true,
    },
  })

  if (household) {
    console.log(`\n✅ Valle's household already exists with ${household.guests.length} members`)
    console.log("   Members:")
    household.guests.forEach((guest) => {
      console.log(`   - ${guest.firstName} ${guest.lastName}`)
    })
    
    if (household.guests.length === 3) {
      console.log("\n✨ Household is already set up correctly!")
      return
    }
    
    console.log("\n⚠️  Household exists but doesn't have 3 members. Updating...")
  } else {
    // Create Valle's household
    const createdHousehold = await prisma.household.create({
      data: {
        coupleId: couple.id,
        name: "Valle's",
        maxGuests: 3,
        notes: "Primary contact: Valle (214) 477-6734",
      },
      include: {
        guests: true,
      },
    })
    household = createdHousehold
    console.log("✅ Created Valle's household")
  }

  // Define the three household members
  const householdMembers = [
    {
      firstName: "Valle",
      lastName: "",
      email: null as string | null,
      phone: "(214) 477-6734",
      isPrimary: true,
    },
    {
      firstName: "Becky",
      lastName: "Valle",
      email: null as string | null,
      phone: null as string | null,
      isPrimary: false,
    },
    {
      firstName: "Rigo",
      lastName: "Valle",
      email: null as string | null,
      phone: null as string | null,
      isPrimary: false,
    },
  ]

  let created = 0
  let updated = 0

  for (const member of householdMembers) {
    // Check if guest already exists
    const existingGuest = await prisma.guest.findFirst({
      where: {
        coupleId: couple.id,
        firstName: { equals: member.firstName, mode: "insensitive" },
        lastName: { equals: member.lastName, mode: "insensitive" },
      },
    })

    if (existingGuest) {
      // Update existing guest to add to household
      await prisma.guest.update({
        where: { id: existingGuest.id },
        data: {
          householdId: household.id,
          phone: member.phone || existingGuest.phone,
          allowPlusOne: false, // Household members don't get plus ones
          plusOnePolicy: "none",
        },
      })
      console.log(`✅ Updated existing guest: ${member.firstName} ${member.lastName}`)
      updated++
    } else {
      // Create new guest
      await prisma.guest.create({
        data: {
          coupleId: couple.id,
          householdId: household.id,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          phone: member.phone,
          allowPlusOne: false, // Household members don't get plus ones
          plusOnePolicy: "none",
          maxGuestsAllowed: 1, // Each household member is 1 person
        },
      })
      console.log(`✅ Created new guest: ${member.firstName} ${member.lastName}`)
      created++
    }
  }

  // Get the final household with all members
  const finalHousehold = await prisma.household.findUnique({
    where: { id: household.id },
    include: {
      guests: {
        orderBy: [
          { firstName: "asc" },
        ],
      },
    },
  })

  console.log("\n✨ Valle's household setup complete!")
  console.log(`   Household ID: ${finalHousehold!.id}`)
  console.log(`   Total members: ${finalHousehold!.guests.length}`)
  console.log("\n   Members:")
  finalHousehold!.guests.forEach((guest) => {
    console.log(`   - ${guest.firstName} ${guest.lastName} (ID: ${guest.id})`)
  })
  
  console.log(`\n📊 Summary:`)
  console.log(`   ✅ Created: ${created} guests`)
  console.log(`   🔄 Updated: ${updated} guests`)
  
  console.log("\n🎯 Next steps:")
  console.log("   1. Navigate to http://localhost:3002/admin/seating")
  console.log("   2. Look for 'Valle's' household in the Guest Directory")
  console.log("   3. Follow the test plan in docs/HOUSEHOLD_SEATING_TEST_PLAN.md")
}

main()
  .catch((error) => {
    console.error("❌ Fatal error:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
