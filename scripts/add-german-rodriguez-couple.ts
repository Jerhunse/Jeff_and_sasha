/**
 * Add German Rodriguez and his wife Annie Rodriguez as plus one.
 * Phone: +1 (404) 710-9604
 */
import { prisma } from "@/lib/prisma"

function normalizePhone(phone: string | null): string | null {
  if (!phone?.trim()) return null
  const digits = phone.replace(/\D/g, "")
  return digits.length >= 10 ? digits : null
}

async function main() {
  const phone = normalizePhone("+1 (404) 710-9604")

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
      firstName: { equals: "German", mode: "insensitive" },
      lastName: { equals: "Rodriguez", mode: "insensitive" },
      parentGuestId: null,
    },
  })

  if (existing) {
    console.error(`Guest already exists: ${existing.firstName} ${existing.lastName} (id: ${existing.id})`)
    process.exit(1)
  }

  const german = await prisma.guest.create({
    data: {
      coupleId: coupleRecord.id,
      firstName: "German",
      lastName: "Rodriguez",
      phone: phone || undefined,
      allowPlusOne: true,
      plusOnePolicy: "named",
      maxGuestsAllowed: 2,
      importSource: "manual",
    },
  })

  const annie = await prisma.guest.create({
    data: {
      coupleId: coupleRecord.id,
      firstName: "Annie",
      lastName: "Rodriguez",
      parentGuestId: german.id,
      isPrimaryContact: false,
      allowPlusOne: false,
      plusOnePolicy: "none",
      maxGuestsAllowed: 1,
      importSource: "manual",
      notes: "Wife of German Rodriguez",
      relationship: "spouse",
    },
  })

  await prisma.guestActivity.create({
    data: {
      guestId: german.id,
      action: "CREATED",
      description: `Guest German Rodriguez + Annie Rodriguez (wife) added via script`,
    },
  })

  console.log(`Added guest: ${german.firstName} ${german.lastName}`)
  console.log(`  id: ${german.id}`)
  console.log(`  phone: ${german.phone ?? "—"}`)
  console.log(`  plus one: Annie Rodriguez (wife)`)
  console.log(`  RSVP link: /rsvp/${german.inviteToken}`)
  console.log(`\nPlus one: ${annie.firstName} ${annie.lastName} (id: ${annie.id})`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
