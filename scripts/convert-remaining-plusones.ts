import { prisma } from "../lib/prisma"

async function convertRemainingPlusOnes() {
  console.log("\n=== Converting remaining text-only plus-ones to Guest records ===\n")
  
  // Find all primary guests with plusOneName in their RSVP but no plusOne Guest records
  const guestsNeedingConversion = await prisma.guest.findMany({
    where: {
      parentGuestId: null, // Primary guests only
      rsvpResponses: {
        some: {
          plusOneName: {
            not: null,
          },
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      coupleId: true,
      householdId: true,
      allowPlusOne: true,
      rsvpResponses: {
        where: {
          plusOneName: { not: null },
        },
        select: {
          id: true,
          status: true,
          plusOneName: true,
          respondedAt: true,
          eventId: true,
        },
        take: 1,
      },
      plusOnes: {
        select: {
          id: true,
        },
      },
    },
  })

  const toConvert = guestsNeedingConversion.filter(g => g.plusOnes.length === 0)

  console.log(`Found ${toConvert.length} guests needing conversion\n`)

  let createdCount = 0
  let skippedCount = 0
  let errorCount = 0

  for (const guest of toConvert) {
    const plusOneName = guest.rsvpResponses[0]?.plusOneName
    if (!plusOneName) continue

    console.log(`\nProcessing: ${guest.firstName} ${guest.lastName}`)
    console.log(`  Plus One Name: ${plusOneName}`)

    // Parse plus-one names (comma-separated)
    const plusOneNames = plusOneName
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n.length > 0 && n !== "null" && n !== "undefined")

    for (const fullName of plusOneNames) {
      // Skip if plus-one name matches the guest's own name (data error)
      const guestFullName = `${guest.firstName} ${guest.lastName}`.trim().toLowerCase()
      if (fullName.trim().toLowerCase() === guestFullName) {
        console.log(`  ⚠️  Skipping self-reference: ${fullName}`)
        skippedCount++
        continue
      }

      // Parse first and last name
      const nameParts = fullName.split(" ")
      const firstName = nameParts[0] || fullName
      const lastName = nameParts.slice(1).join(" ") || ""

      // Check if this guest already exists with this parent
      const existingPlusOne = await prisma.guest.findFirst({
        where: {
          firstName,
          lastName,
          coupleId: guest.coupleId,
          parentGuestId: guest.id,
        },
      })

      if (existingPlusOne) {
        console.log(`  ✓ Plus-one already exists: ${fullName}`)
        skippedCount++
        continue
      }

      try {
        // Create the plus-one as a real guest with parent relationship
        const newGuest = await prisma.guest.create({
          data: {
            firstName,
            lastName,
            email: null,
            coupleId: guest.coupleId,
            householdId: guest.householdId,
            parentGuestId: guest.id, // Link to parent
            allowPlusOne: false,
            isPrimaryContact: false,
            isChild: false,
            isVIP: false,
            notes: `Plus-one of ${guest.firstName} ${guest.lastName}`,
            maxGuestsAllowed: 0, // Plus-ones don't get additional allocations
          },
        })

        console.log(`  ✅ Created: ${fullName} (${newGuest.id})`)
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
          console.log(`    ✅ Created RSVP for ${fullName}`)
        }
      } catch (error: any) {
        console.error(`  ❌ Error creating ${fullName}:`, error.message)
        errorCount++
      }
    }
  }

  console.log("\n=== Conversion Summary ===")
  console.log(`✅ Created: ${createdCount} new plus-one guests`)
  console.log(`⏭️  Skipped: ${skippedCount} (already exist or self-references)`)
  console.log(`❌ Errors: ${errorCount}`)

  // Show updated counts
  const totalPrimaryGuests = await prisma.guest.count({
    where: { parentGuestId: null },
  })

  const totalPlusOneGuests = await prisma.guest.count({
    where: { parentGuestId: { not: null } },
  })

  console.log("\n=== Updated Guest Counts ===")
  console.log(`Primary Guests: ${totalPrimaryGuests}`)
  console.log(`Plus-One Guests: ${totalPlusOneGuests}`)
  console.log(`Total: ${totalPrimaryGuests + totalPlusOneGuests}`)
}

convertRemainingPlusOnes()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
