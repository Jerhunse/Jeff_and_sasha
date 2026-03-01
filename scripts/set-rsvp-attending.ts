/**
 * Set RSVP status to Attending for a guest and their household.
 * Usage: npx tsx scripts/set-rsvp-attending.ts "Irvin" "Cruz"
 */
import { prisma } from "@/lib/prisma"

async function main() {
  const firstName = process.argv[2] || "Irvin"
  const lastName = process.argv[3] || "Cruz"

  const primary = await prisma.guest.findFirst({
    where: {
      firstName: { equals: firstName, mode: "insensitive" },
      lastName: { equals: lastName, mode: "insensitive" },
      parentGuestId: null,
    },
    include: {
      household: true,
      couple: { select: { id: true } },
    },
  })

  if (!primary) {
    console.error(`Guest not found: ${firstName} ${lastName}`)
    process.exit(1)
  }

  const coupleId = primary.coupleId
  let guestIds: string[] = [primary.id]

  if (primary.householdId) {
    const householdGuests = await prisma.guest.findMany({
      where: { householdId: primary.householdId, coupleId },
      select: { id: true, firstName: true, lastName: true },
    })
    guestIds = householdGuests.map((g) => g.id)
    console.log(`Found household of ${householdGuests.length}: ${householdGuests.map((g) => `${g.firstName} ${g.lastName}`).join(", ")}`)
  } else {
    console.log(`Found guest: ${primary.firstName} ${primary.lastName} (no household)`)
  }

  for (const guestId of guestIds) {
    const existing = await prisma.rSVPResponse.findFirst({
      where: { guestId, eventId: null },
    })
    if (existing) {
      await prisma.rSVPResponse.update({
        where: { id: existing.id },
        data: { status: "YES", respondedAt: new Date(), updatedAt: new Date() },
      })
      console.log(`  Updated RSVP to Attending for guest ${guestId}`)
    } else {
      await prisma.rSVPResponse.create({
        data: {
          coupleId,
          guestId,
          eventId: null,
          status: "YES",
          respondedAt: new Date(),
          updatedAt: new Date(),
        },
      })
      console.log(`  Created RSVP Attending for guest ${guestId}`)
    }
  }

  console.log("Done. RSVP status set to Attending.")
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
