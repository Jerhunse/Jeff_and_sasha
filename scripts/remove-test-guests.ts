import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function removeTestGuests() {
  try {
    console.log("🔍 Searching for test guests...")

    // Find test guests by email or name
    const testGuestEmails = [
      "jane@example.com",
      "bob@example.com", 
      "john@example.com"
    ]

    const testGuestNames = [
      { firstName: "Jane", lastName: "Doe" },
      { firstName: "Bob", lastName: "Johnson" },
      { firstName: "John", lastName: "Smith" }
    ]

    // Find guests by email
    const guestsByEmail = await prisma.guest.findMany({
      where: {
        email: {
          in: testGuestEmails
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    })

    // Find guests by name (in case email doesn't match exactly)
    const guestsByName = await prisma.guest.findMany({
      where: {
        OR: testGuestNames.map(name => ({
          firstName: name.firstName,
          lastName: name.lastName
        }))
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    })

    // Combine and deduplicate
    const allTestGuests = [...guestsByEmail, ...guestsByName]
    const uniqueGuests = Array.from(
      new Map(allTestGuests.map(g => [g.id, g])).values()
    )

    if (uniqueGuests.length === 0) {
      console.log("✅ No test guests found. Database is already clean!")
      return
    }

    console.log(`\n📋 Found ${uniqueGuests.length} test guest(s):`)
    uniqueGuests.forEach(guest => {
      console.log(`   - ${guest.firstName} ${guest.lastName} (${guest.email || "no email"})`)
    })

    console.log("\n🗑️  Deleting test guests...")

    // Delete the guests
    const deleteResult = await prisma.guest.deleteMany({
      where: {
        id: {
          in: uniqueGuests.map(g => g.id)
        }
      }
    })

    console.log(`\n✅ Successfully deleted ${deleteResult.count} test guest(s)!`)

  } catch (error) {
    console.error("❌ Error removing test guests:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

removeTestGuests()
  .then(() => {
    console.log("\n✨ Cleanup complete!")
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
