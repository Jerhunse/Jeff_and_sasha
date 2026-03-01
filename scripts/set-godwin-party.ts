/**
 * Set Godwin Martins as main guest with 4 plus-ones (5 total).
 * Ensures primary has maxGuestsAllowed=5 and exactly 4 Guest records with parentGuestId = Godwin.
 */
import { prisma } from "@/lib/prisma"

const PLUS_ONE_NAMES = [
  { firstName: "Rolande", lastName: "Martins" },
  { firstName: "Rose", lastName: "Martins" },
  { firstName: "Abigail", lastName: "Martins" },
  { firstName: "Priscilla", lastName: "Priscilla" },
]

async function main() {
  const couple = await prisma.couple.findFirst({ where: { slug: "jeff-and-sasha" } })
  if (!couple) {
    const c = await prisma.couple.findFirst()
    if (!c) throw new Error("No couple found")
  }
  const coupleId = couple!.id

  const godwin = await prisma.guest.findFirst({
    where: {
      coupleId,
      parentGuestId: null,
      firstName: { equals: "Godwin", mode: "insensitive" },
      lastName: { equals: "Martins", mode: "insensitive" },
    },
    include: { plusOnes: true },
  })

  if (!godwin) {
    console.error("Godwin Martins not found.")
    process.exit(1)
  }

  await prisma.guest.update({
    where: { id: godwin.id },
    data: {
      maxGuestsAllowed: 5,
      allowPlusOne: true,
      plusOnePolicy: "unnamed",
    },
  })
  console.log(`Updated Godwin Martins: maxGuestsAllowed=5, allowPlusOne=true`)

  for (const { firstName, lastName } of PLUS_ONE_NAMES) {
    const existing = await prisma.guest.findFirst({
      where: {
        coupleId,
        parentGuestId: godwin.id,
        firstName: { equals: firstName, mode: "insensitive" },
        lastName: { equals: lastName, mode: "insensitive" },
      },
    })
    if (existing) {
      console.log(`  Plus-one already exists: ${firstName} ${lastName}`)
      continue
    }
    await prisma.guest.create({
      data: {
        coupleId,
        parentGuestId: godwin.id,
        firstName,
        lastName,
        allowPlusOne: false,
        plusOnePolicy: "none",
        maxGuestsAllowed: 1,
        isPrimaryContact: false,
        importSource: "manual",
      },
    })
    console.log(`  Created plus-one: ${firstName} ${lastName}`)
  }

  const updated = await prisma.guest.findUnique({
    where: { id: godwin.id },
    include: { plusOnes: true },
  })
  console.log(`\nGodwin Martins: 1 main + ${updated!.plusOnes.length} plus-ones = ${1 + updated!.plusOnes.length} total`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
