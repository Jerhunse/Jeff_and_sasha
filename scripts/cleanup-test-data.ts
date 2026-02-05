#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function cleanupTestData() {
  console.log("🧹 Cleaning up test data and resetting RSVP statuses...\n")

  try {
    // Test email addresses to remove
    const testEmails = [
      "jane@example.com",
      "bob@example.com", 
      "john@example.com"
    ]

    // Delete test guests and their RSVP responses
    console.log("1️⃣ Removing test guests...")
    const deleteResult = await prisma.guest.deleteMany({
      where: {
        email: {
          in: testEmails
        }
      }
    })
    console.log(`   ✓ Removed ${deleteResult.count} test guest(s)`)

    // Reset all remaining RSVP responses to pending
    console.log("\n2️⃣ Resetting all RSVP statuses to PENDING...")
    const updateResult = await prisma.rSVPResponse.updateMany({
      data: {
        status: "PENDING"
      }
    })
    console.log(`   ✓ Reset ${updateResult.count} RSVP response(s) to PENDING`)

    // Optional: Delete all RSVP responses instead of updating them
    // Uncomment the code below if you want to completely remove all RSVP responses
    /*
    console.log("\n3️⃣ Deleting all RSVP responses...")
    const deleteRsvpResult = await prisma.rSVPResponse.deleteMany({})
    console.log(`   ✓ Deleted ${deleteRsvpResult.count} RSVP response(s)`)
    */

    console.log("\n✅ Cleanup complete!")
    console.log("\n📊 Summary:")
    console.log(`   - Removed test guests: ${deleteResult.count}`)
    console.log(`   - Reset RSVP statuses: ${updateResult.count}`)

    // Show remaining guest count
    const remainingGuests = await prisma.guest.count()
    console.log(`   - Remaining guests: ${remainingGuests}`)

  } catch (error) {
    console.error("❌ Error during cleanup:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupTestData()
