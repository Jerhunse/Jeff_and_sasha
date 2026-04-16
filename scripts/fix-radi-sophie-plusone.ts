import { prisma } from "../lib/prisma"

/**
 * Makes Radi the main guest and Sophie the plus one.
 * Updates the RSVP plusOneName from "Radi, Sophie" to just "Sophie".
 */
async function fixRadiSophiePlusOne() {
  console.log("\n=== Fixing Radi/Sophie: Radi as main guest, Sophie as plus one ===\n")

  // Find the guest with Radi in the name (case insensitive)
  const guest = await prisma.guest.findFirst({
    where: {
      parentGuestId: null,
      OR: [
        { firstName: { contains: "Radi", mode: "insensitive" } },
        { lastName: { contains: "Radi", mode: "insensitive" } },
      ],
    },
    include: {
      rsvpResponses: {
        where: { eventId: null },
        orderBy: { respondedAt: "desc" },
        take: 1,
      },
      plusOnes: true,
    },
  })

  if (!guest) {
    console.log("No guest matching 'Radi' found.")
    return
  }

  console.log(`Found guest: ${guest.firstName} ${guest.lastName} (${guest.id})`)
  console.log(`  RSVP responses: ${guest.rsvpResponses.length}`)
  console.log(`  Plus-ones (Guest records): ${guest.plusOnes.length}`)

  const rsvp = guest.rsvpResponses[0]
  if (!rsvp) {
    console.log("\nNo RSVP response found for this guest.")
    return
  }

  const currentPlusOneName = rsvp.plusOneName
  console.log(`  Current plusOneName: "${currentPlusOneName || "(empty)"}"`)

  // Remove Radi from plus-one list, keep only Sophie
  const newPlusOneName = "Sophie"

  if (!currentPlusOneName || currentPlusOneName !== newPlusOneName) {
    await prisma.rSVPResponse.update({
      where: { id: rsvp.id },
      data: { plusOneName: newPlusOneName },
    })
    console.log(`\n✅ Updated RSVP plusOneName:`)
    console.log(`  Old: "${currentPlusOneName || "(empty)"}"`)
    console.log(`  New: "${newPlusOneName}"`)
  }

  // Ensure main guest is Radi (firstName) - update if currently combined like "Radi Sophie"
  if (
    guest.firstName.toLowerCase().includes("radi") &&
    guest.firstName.toLowerCase().includes("sophie")
  ) {
    await prisma.guest.update({
      where: { id: guest.id },
      data: {
        firstName: "Radi",
        lastName: guest.lastName || "Sophie",
      },
    })
    console.log(`\n✅ Updated main guest to firstName="Radi"`)
  } else if (guest.firstName.toLowerCase() !== "radi") {
    console.log(`\nUpdating main guest to Radi...`)
    await prisma.guest.update({
      where: { id: guest.id },
      data: {
        firstName: "Radi",
        lastName: guest.lastName || "Sophie",
      },
    })
    console.log(`✅ Main guest: Radi ${guest.lastName || "Sophie"}`)
  }

  console.log("\n=== Done ===")
}

fixRadiSophiePlusOne()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
