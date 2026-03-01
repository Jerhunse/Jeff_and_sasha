/**
 * Add a single guest to the RSVP/guest list.
 * Usage: npx tsx scripts/add-guest.ts "FirstName" "LastName" "phone"
 * Example: npx tsx scripts/add-guest.ts "Tavaris" "Arington" "6787700136"
 */
import { prisma } from "@/lib/prisma"

function normalizePhone(phone: string | null): string | null {
  if (!phone?.trim()) return null
  const digits = phone.replace(/\D/g, "")
  return digits.length >= 10 ? digits : null
}

async function main() {
  const firstName = process.argv[2]?.trim()
  const lastName = process.argv[3]?.trim()
  const phoneRaw = process.argv[4]?.trim()

  if (!firstName || !lastName) {
    console.error("Usage: npx tsx scripts/add-guest.ts \"FirstName\" \"LastName\" [phone]")
    process.exit(1)
  }

  const couple = await prisma.couple.findFirst({
    where: { slug: "jeff-and-sasha" },
  })
  if (!couple) {
    const fallback = await prisma.couple.findFirst()
    if (!fallback) {
      console.error("No couple found in database.")
      process.exit(1)
    }
  }
  const coupleId = couple!.id

  const phone = normalizePhone(phoneRaw || null)

  const existing = await prisma.guest.findFirst({
    where: {
      coupleId,
      OR: [
        {
          AND: [
            { firstName: { equals: firstName, mode: "insensitive" } },
            { lastName: { equals: lastName, mode: "insensitive" } },
          ],
        },
        ...(phone ? [{ phone: { contains: phone } }] : []),
      ],
    },
  })

  if (existing) {
    console.error(`Guest already exists: ${existing.firstName} ${existing.lastName} (id: ${existing.id})`)
    process.exit(1)
  }

  const guest = await prisma.guest.create({
    data: {
      coupleId,
      firstName,
      lastName,
      phone: phone || undefined,
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
      description: `Guest ${firstName} ${lastName} added via script`,
    },
  })

  console.log(`Added guest: ${guest.firstName} ${guest.lastName}`)
  console.log(`  id: ${guest.id}`)
  console.log(`  phone: ${guest.phone ?? "—"}`)
  console.log(`  maxGuestsAllowed: 1, allowPlusOne: false`)
  console.log(`  RSVP link: /rsvp/${guest.inviteToken}`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
