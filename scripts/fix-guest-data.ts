import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔧 Fixing guest data issues...")
  console.log("=" .repeat(60))

  const couple = await prisma.couple.findFirst({
    where: { slug: "jeff-and-sasha" },
  })

  if (!couple) {
    console.error("❌ Could not find wedding couple.")
    process.exit(1)
  }

  console.log(`✅ Found wedding: ${couple.partner1Name} & ${couple.partner2Name}\n`)

  // Get Georgia tag
  const georgiaTag = await prisma.tag.findFirst({
    where: {
      coupleId: couple.id,
      name: "Georgia",
    },
  })

  if (!georgiaTag) {
    console.error("❌ Could not find Georgia tag.")
    process.exit(1)
  }

  // Fix 1: Add Georgia tag to "Jeffery Erhunse" (Jeff & Sasha)
  const jeffSasha = await prisma.guest.findFirst({
    where: {
      coupleId: couple.id,
      firstName: "Jeffery",
      lastName: "Erhunse",
    },
  })

  if (jeffSasha) {
    const existingTag = await prisma.guestTag.findFirst({
      where: {
        guestId: jeffSasha.id,
        tagId: georgiaTag.id,
      },
    })

    if (!existingTag) {
      await prisma.guestTag.create({
        data: {
          guestId: jeffSasha.id,
          tagId: georgiaTag.id,
        },
      })
      console.log("✅ Added Georgia tag to Jeff & Sasha (Jeffery Erhunse)")
    } else {
      console.log("✓  Jeff & Sasha already has Georgia tag")
    }
  } else {
    console.log("⚠️  Jeff & Sasha (Jeffery Erhunse) not found")
  }

  // Fix 2: Add Carmen Rivera
  const carmen = await prisma.guest.findFirst({
    where: {
      coupleId: couple.id,
      firstName: { equals: "Carmen", mode: "insensitive" },
      lastName: { equals: "Rivera", mode: "insensitive" },
    },
  })

  if (!carmen) {
    const newCarmen = await prisma.guest.create({
      data: {
        coupleId: couple.id,
        firstName: "Carmen",
        lastName: "Rivera",
        maxGuestsAllowed: 1,
        allowPlusOne: false,
        plusOnePolicy: "none",
        notes: "Party size: 1 guest(s)\nOriginal name: Carmen Rivera\nLocation: Georgia",
      },
    })

    await prisma.guestTag.create({
      data: {
        guestId: newCarmen.id,
        tagId: georgiaTag.id,
      },
    })

    console.log("✅ Added Carmen Rivera to database")
  } else {
    console.log("✓  Carmen Rivera already exists")
  }

  // Fix 3: Rename spacing issues for guests with "/" or "&"
  const fixNameMapping = [
    { oldFirst: "Daisy/Adrian", oldLast: "Carrions", newFirst: "Daisy / Adrian", newLast: "Carrions" },
    { oldFirst: "Dem&Maria", oldLast: "Tsouclos", newFirst: "Dem & Maria", newLast: "Tsouclos" },
    { oldFirst: "Ashley/Deavin", oldLast: "Rencher", newFirst: "Ashley / Deavin", newLast: "Rencher" },
    { oldFirst: "Paul/", oldLast: "Lauren Tsouclos", newFirst: "Paul / Lauren", newLast: "Tsouclos" },
  ]

  for (const mapping of fixNameMapping) {
    const guest = await prisma.guest.findFirst({
      where: {
        coupleId: couple.id,
        firstName: mapping.oldFirst,
        lastName: mapping.oldLast,
      },
    })

    if (guest) {
      await prisma.guest.update({
        where: { id: guest.id },
        data: {
          firstName: mapping.newFirst,
          lastName: mapping.newLast,
        },
      })
      console.log(`✅ Renamed: ${mapping.oldFirst} ${mapping.oldLast} → ${mapping.newFirst} ${mapping.newLast}`)
    }
  }

  console.log("\n" + "=".repeat(60))
  console.log("🔍 Verifying database totals...")
  console.log("=".repeat(60))

  const allGuests = await prisma.guest.findMany({
    where: { coupleId: couple.id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

  const locationSummary: Record<string, number> = {}
  allGuests.forEach((guest) => {
    const locationTag = guest.tags.find((t) =>
      ["Texas", "New York", "Georgia", "Nashville", "Spain"].includes(t.tag.name)
    )
    if (locationTag) {
      const location = locationTag.tag.name
      if (!locationSummary[location]) {
        locationSummary[location] = 0
      }
      locationSummary[location] += guest.maxGuestsAllowed
    }
  })

  console.log("\n📊 Current Database Totals by Location:")
  console.log("=".repeat(60))
  let dbTotal = 0
  Object.entries(locationSummary)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([location, count]) => {
      console.log(`   ${location}: ${count} guests`)
      dbTotal += count
    })
  console.log("   " + "-".repeat(40))
  console.log(`   Total: ${dbTotal} guests`)
  console.log("=".repeat(60))

  // Expected totals
  const expected = {
    Texas: 24,
    "New York": 10,
    Georgia: 129,
    Nashville: 11,
    Spain: 5,
    Total: 179,
  }

  console.log("\n📋 Expected Totals:")
  console.log("=".repeat(60))
  console.log(`   Texas: ${expected.Texas} guests`)
  console.log(`   New York: ${expected["New York"]} guests`)
  console.log(`   Georgia: ${expected.Georgia} guests`)
  console.log(`   Nashville: ${expected.Nashville} guests`)
  console.log(`   Spain: ${expected.Spain} guests`)
  console.log("   " + "-".repeat(40))
  console.log(`   Total: ${expected.Total} guests`)
  console.log("=".repeat(60))

  console.log("\n✅ Verification:")
  const georgiaMatch = locationSummary["Georgia"] === expected.Georgia
  const nyMatch = locationSummary["New York"] === expected["New York"]
  const totalMatch = dbTotal === expected.Total

  console.log(`   Georgia: ${georgiaMatch ? "✅" : "⚠️"} ${locationSummary["Georgia"]} (expected: ${expected.Georgia})`)
  console.log(`   New York: ${nyMatch ? "✅" : "⚠️"} ${locationSummary["New York"]} (expected: ${expected["New York"]})`)
  console.log(`   Total: ${totalMatch ? "✅" : "⚠️"} ${dbTotal} (expected: ${expected.Total})`)
}

main()
  .catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
