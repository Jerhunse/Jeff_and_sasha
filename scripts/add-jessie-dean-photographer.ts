/**
 * Add Jessie Dean as the photographer guest.
 * Usage: npx tsx scripts/add-jessie-dean-photographer.ts
 */
import { prisma } from "@/lib/prisma"

async function main() {
  const firstName = "Jessie"
  const lastName = "Dean"
  const notes = "Photographer"

  const couple = await prisma.couple.findFirst({
    where: { slug: "jeff-and-sasha" },
  })
  const coupleRecord = couple ?? (await prisma.couple.findFirst())
  if (!coupleRecord) {
    console.error("No couple found in database.")
    process.exit(1)
  }

  const existing = await prisma.guest.findFirst({
    where: {
      coupleId: coupleRecord.id,
      firstName: { equals: firstName, mode: "insensitive" },
      lastName: { equals: lastName, mode: "insensitive" },
      parentGuestId: null,
    },
  })

  if (existing) {
    console.error(`Guest already exists: ${existing.firstName} ${existing.lastName} (id: ${existing.id})`)
    process.exit(1)
  }

  const guest = await prisma.guest.create({
    data: {
      coupleId: coupleRecord.id,
      firstName,
      lastName,
      notes,
      relationship: "photographer",
      allowPlusOne: false,
      plusOnePolicy: "none",
      maxGuestsAllowed: 1,
      importSource: "manual",
    },
  })

  await prisma.guestActivity.create({
    data: {
      guestId: guest.id,
      action: "CREATED",
      description: `Guest ${firstName} ${lastName} (photographer) added via script`,
    },
  })

  // Create Photographer tag if it doesn't exist and assign to guest
  const photographerTag = await prisma.tag.upsert({
    where: {
      coupleId_name: {
        coupleId: coupleRecord.id,
        name: "Photographer",
      },
    },
    update: {},
    create: {
      coupleId: coupleRecord.id,
      name: "Photographer",
      color: "#6366f1",
      description: "Wedding photographer/videographer",
      isSystem: false,
    },
  })

  await prisma.guestTag.create({
    data: {
      guestId: guest.id,
      tagId: photographerTag.id,
    },
  })

  console.log(`Added guest: ${guest.firstName} ${guest.lastName}`)
  console.log(`  id: ${guest.id}`)
  console.log(`  notes: ${notes}`)
  console.log(`  relationship: photographer`)
  console.log(`  tag: Photographer`)
  console.log(`  RSVP link: /rsvp/${guest.inviteToken}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
