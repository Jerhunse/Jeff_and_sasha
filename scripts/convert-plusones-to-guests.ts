/**
 * Script to convert plus-ones from RSVP metadata into actual Guest records
 * This allows each plus-one to be assigned to tables independently
 */

import { prisma } from "../lib/prisma"

async function main() {
  console.log("Starting plus-one to guest conversion...")

  // Find all guests with plus-ones in their RSVP responses
  const guestsWithPlusOnes = await prisma.guest.findMany({
    where: {
      allowPlusOne: true,
      rsvpResponses: {
        some: {
          plusOneName: {
            not: null,
          },
        },
      },
    },
    include: {
      rsvpResponses: {
        where: {
          plusOneName: {
            not: null,
          },
        },
        take: 1,
      },
      household: true,
    },
  })

  console.log(`Found ${guestsWithPlusOnes.length} guests with plus-ones`)

  let createdCount = 0
  let skippedCount = 0

  for (const guest of guestsWithPlusOnes) {
    const plusOneName = guest.rsvpResponses[0]?.plusOneName
    if (!plusOneName) continue

    // Parse plus-one names (comma-separated)
    const plusOneNames = plusOneName
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n.length > 0 && n !== "null" && n !== "undefined")

    for (const fullName of plusOneNames) {
      // Parse first and last name
      const nameParts = fullName.split(" ")
      const firstName = nameParts[0] || fullName
      const lastName = nameParts.slice(1).join(" ") || ""

      // Check if this guest already exists
      const existingGuest = await prisma.guest.findFirst({
        where: {
          firstName,
          lastName,
          coupleId: guest.coupleId,
        },
      })

      if (existingGuest) {
        console.log(`  ✓ Guest already exists: ${fullName}`)
        skippedCount++
        continue
      }

      // Create the plus-one as a real guest
      const newGuest = await prisma.guest.create({
        data: {
          firstName,
          lastName,
          email: null, // Plus-ones typically don't have emails
          coupleId: guest.coupleId,
          householdId: guest.householdId, // Same household as primary guest
          allowPlusOne: false, // Plus-ones typically can't bring their own plus-ones
          isPrimaryContact: false,
          isChild: false,
          isVIP: false,
          notes: `Plus-one of ${guest.firstName} ${guest.lastName}`,
        },
      })

      console.log(`  ✓ Created guest: ${fullName} (${newGuest.id})`)
      createdCount++

      // Create RSVP response matching the primary guest's status
      if (guest.rsvpResponses.length > 0) {
        const primaryRsvp = guest.rsvpResponses[0]
        await prisma.rSVPResponse.create({
          data: {
            guestId: newGuest.id,
            coupleId: guest.coupleId,
            eventId: primaryRsvp.eventId,
            status: primaryRsvp.status,
            plusOneName: null,
            message: `Attending with ${guest.firstName} ${guest.lastName}`,
            respondedAt: primaryRsvp.respondedAt,
          },
        })
        console.log(`    ✓ Created RSVP response for ${fullName}`)
      }
    }
  }

  console.log("\n=== Conversion Complete ===")
  console.log(`Created: ${createdCount} new guests`)
  console.log(`Skipped: ${skippedCount} existing guests`)
  console.log("\nNote: Original plus-one names are preserved in RSVP responses for reference")
}

main()
  .catch((e) => {
    console.error("Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
