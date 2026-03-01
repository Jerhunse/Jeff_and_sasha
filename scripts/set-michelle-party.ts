/**
 * Set Michelle Abdegmele as main guest with 4 plus-ones (5 total).
 * Party: Michelle, Seun Abdegmele, Joanna Abdegmele, Winifred Akpan, Esther Akpan.
 */
import { prisma } from "@/lib/prisma"

const PLUS_ONE_NAMES = [
  { firstName: "Seun", lastName: "Abdegmele" },
  { firstName: "Joanna", lastName: "Abdegmele" },
  { firstName: "Winifred", lastName: "Akpan" },
  { firstName: "Esther", lastName: "Akpan" },
]

async function main() {
  const couple = await prisma.couple.findFirst({ where: { slug: "jeff-and-sasha" } })
  if (!couple) {
    const c = await prisma.couple.findFirst()
    if (!c) throw new Error("No couple found")
  }
  const coupleId = couple!.id

  const michelle = await prisma.guest.findFirst({
    where: {
      coupleId,
      parentGuestId: null,
      firstName: { equals: "Michelle", mode: "insensitive" },
      lastName: { equals: "Abdegmele", mode: "insensitive" },
    },
    include: { plusOnes: true },
  })

  if (!michelle) {
    console.error("Michelle Abdegmele not found.")
    process.exit(1)
  }

  await prisma.guest.update({
    where: { id: michelle.id },
    data: {
      maxGuestsAllowed: 5,
      allowPlusOne: true,
      plusOnePolicy: "unnamed",
    },
  })
  console.log(`Updated Michelle Abdegmele: maxGuestsAllowed=5, allowPlusOne=true`)

  for (const { firstName, lastName } of PLUS_ONE_NAMES) {
    const existing = await prisma.guest.findFirst({
      where: {
        coupleId,
        parentGuestId: michelle.id,
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
        parentGuestId: michelle.id,
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
    where: { id: michelle.id },
    include: { plusOnes: true },
  })
  console.log(`\nMichelle Abdegmele: 1 main + ${updated!.plusOnes.length} plus-ones = ${1 + updated!.plusOnes.length} total`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
