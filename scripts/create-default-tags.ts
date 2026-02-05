import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🏷️  Creating default tags...")

  try {
    // Get the first couple (adjust if you need a specific couple)
    const couple = await prisma.couple.findFirst()

    if (!couple) {
      console.error("❌ No couple found. Please create a couple first.")
      process.exit(1)
    }

    console.log(`✅ Found couple: ${couple.partner1Name} & ${couple.partner2Name}`)

    // Create Family tag
    const familyTag = await prisma.tag.upsert({
      where: {
        coupleId_name: {
          coupleId: couple.id,
          name: "Family",
        },
      },
      update: {},
      create: {
        coupleId: couple.id,
        name: "Family",
        color: "#6b9c7f",
        description: "Family members",
        isSystem: false,
      },
    })

    console.log(`✅ Created/Updated tag: Family (${familyTag.id})`)

    // Create Friends tag
    const friendsTag = await prisma.tag.upsert({
      where: {
        coupleId_name: {
          coupleId: couple.id,
          name: "Friends",
        },
      },
      update: {},
      create: {
        coupleId: couple.id,
        name: "Friends",
        color: "#2a9d8f",
        description: "Friends of the couple",
        isSystem: false,
      },
    })

    console.log(`✅ Created/Updated tag: Friends (${friendsTag.id})`)

    console.log("\n🎉 Default tags created successfully!")
  } catch (error) {
    console.error("❌ Error creating tags:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
