/**
 * Consolidate Emmanual to one primary guest with plus-one "Emmanual (GF)"
 */
import { prisma } from "@/lib/prisma"

async function main() {
  const primaryId = "cml8cqbm1000oy41elq0u2lw2" // Emmanuel from Texas (has RSVP, phone)
  const duplicateId = "cmmkwjqk0000224zps875vmi0" // Emmanual we added (no RSVP)

  const primary = await prisma.guest.findUnique({
    where: { id: primaryId },
    include: { plusOnes: true, rsvpResponses: true },
  })

  if (!primary) {
    console.error("Primary Emmanuel not found")
    process.exit(1)
  }

  // 1. Update primary: allow plus-one, use "Emmanual" spelling
  await prisma.guest.update({
    where: { id: primaryId },
    data: {
      firstName: "Emmanual",
      lastName: primary.lastName || "—",
      allowPlusOne: true,
      maxGuestsAllowed: 2,
      plusOnePolicy: "named",
    },
  })

  // 2. Create plus-one "Emmanual (GF)" if not exists
  const existingPlusOne = primary.plusOnes.find(
    (p) => p.firstName === "Emmanual" && p.lastName === "(GF)"
  )

  if (!existingPlusOne) {
    await prisma.guest.create({
      data: {
        coupleId: primary.coupleId,
        firstName: "Emmanual",
        lastName: "(GF)",
        parentGuestId: primaryId,
        isPrimaryContact: false,
        allowPlusOne: false,
        maxGuestsAllowed: 1,
        importSource: "manual",
        notes: "Girlfriend",
        relationship: "girlfriend",
      },
    })
    console.log("Created plus-one: Emmanual (GF)")
  }

  // 3. Clear the self-referential plusOneName from RSVP (was "Emmanuel")
  if (primary.rsvpResponses[0]?.plusOneName) {
    await prisma.rSVPResponse.update({
      where: { id: primary.rsvpResponses[0].id },
      data: { plusOneName: null },
    })
    console.log("Cleared duplicate plusOneName from RSVP")
  }

  // 4. Delete the duplicate Emmanual record
  await prisma.guest.delete({
    where: { id: duplicateId },
  })
  console.log("Deleted duplicate Emmanual record")

  console.log("\nDone. Emmanual now appears once with plus-one Emmanual (GF).")
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
