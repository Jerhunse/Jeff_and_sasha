import { prisma } from "../lib/prisma"

async function fixHannahDuplicate() {
  console.log("\n=== Fixing Hannah's duplicate plus-one ===\n")
  
  // Find Hannah's record
  const hannah = await prisma.guest.findFirst({
    where: {
      firstName: "Hannah",
      lastName: "Aiwanseoba",
      parentGuestId: null,
    },
    include: {
      plusOnes: true,
      rsvpResponses: true,
    },
  })

  if (!hannah) {
    console.log("Hannah not found")
    return
  }

  console.log(`Found Hannah: ${hannah.id}`)
  console.log(`Current plus-ones: ${hannah.plusOnes.length}`)
  hannah.plusOnes.forEach(po => {
    console.log(`  - ${po.firstName} ${po.lastName} (${po.id})`)
  })

  // Find the duplicate "Hanna h Aiwanseoba" record
  // The duplicate has lastName starting with "h " (from parsing "Hanna h Aiwanseoba")
  const duplicate = hannah.plusOnes.find(po => {
    const firstName = po.firstName.toLowerCase()
    const lastName = po.lastName.toLowerCase()
    // Match "Hanna" with lastName that starts with "h " or exactly "Aiwanseoba"
    return (firstName === "hanna" && lastName.startsWith("h ")) ||
           (firstName === "hanna" && lastName === "aiwanseoba")
  })

  if (!duplicate) {
    console.log("\nNo duplicate 'Hanna h' found. Plus-ones:")
    hannah.plusOnes.forEach(po => {
      console.log(`  - firstName: "${po.firstName}", lastName: "${po.lastName}"`)
    })
    return
  }

  console.log(`\nFound duplicate: ${duplicate.firstName} ${duplicate.lastName} (${duplicate.id})`)

  // Delete the duplicate guest and its RSVP responses
  console.log("\nDeleting duplicate guest...")
  
  // First delete RSVP responses
  const deletedRsvps = await prisma.rSVPResponse.deleteMany({
    where: { guestId: duplicate.id },
  })
  console.log(`✅ Deleted ${deletedRsvps.count} RSVP response(s)`)

  // Then delete any seats
  const deletedSeats = await prisma.seat.deleteMany({
    where: { guestId: duplicate.id },
  })
  console.log(`✅ Deleted ${deletedSeats.count} seat(s)`)

  // Finally delete the guest
  await prisma.guest.delete({
    where: { id: duplicate.id },
  })
  console.log(`✅ Deleted duplicate guest record`)

  // Update Hannah's RSVP to remove "Hanna h Aiwanseoba" from plusOneName
  if (hannah.rsvpResponses.length > 0) {
    const rsvp = hannah.rsvpResponses[0]
    if (rsvp.plusOneName) {
      const names = rsvp.plusOneName
        .split(",")
        .map(n => n.trim())
        .filter(n => !n.toLowerCase().includes("hanna h"))
      
      const newPlusOneName = names.join(", ")
      
      await prisma.rSVPResponse.update({
        where: { id: rsvp.id },
        data: { plusOneName: newPlusOneName },
      })
      
      console.log(`\n✅ Updated Hannah's RSVP plusOneName:`)
      console.log(`  Old: ${rsvp.plusOneName}`)
      console.log(`  New: ${newPlusOneName}`)
    }
  }

  // Verify final state
  const updatedHannah = await prisma.guest.findUnique({
    where: { id: hannah.id },
    include: {
      plusOnes: true,
    },
  })

  console.log(`\n=== Final State ===`)
  console.log(`Hannah's plus-ones: ${updatedHannah?.plusOnes.length}`)
  updatedHannah?.plusOnes.forEach(po => {
    console.log(`  - ${po.firstName} ${po.lastName}`)
  })

  // Show updated total counts
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

fixHannahDuplicate()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
