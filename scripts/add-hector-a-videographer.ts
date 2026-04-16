/**
 * Add Hector A as the videographer guest.
 * Usage: npx tsx scripts/add-hector-a-videographer.ts
 */
import { prisma } from "@/lib/prisma"

async function main() {
  const firstName = "Hector"
  const lastName = "A"
  const notes = "Videographer"

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
      relationship: "videographer",
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
      description: `Guest ${firstName} ${lastName} (videographer) added via script`,
    },
  })

  const videographerTag = await prisma.tag.upsert({
    where: {
      coupleId_name: {
        coupleId: coupleRecord.id,
        name: "Videographer",
      },
    },
    update: {},
    create: {
      coupleId: coupleRecord.id,
      name: "Videographer",
      color: "#8b5cf6",
      description: "Wedding videographer",
      isSystem: false,
    },
  })

  await prisma.guestTag.create({
    data: {
      guestId: guest.id,
      tagId: videographerTag.id,
    },
  })

  console.log(`Added guest: ${guest.firstName} ${guest.lastName}`)
  console.log(`  id: ${guest.id}`)
  console.log(`  notes: ${notes}`)
  console.log(`  relationship: videographer`)
  console.log(`  tag: Videographer`)
  console.log(`  RSVP link: /rsvp/${guest.inviteToken}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
