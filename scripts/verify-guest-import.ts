import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const couple = await prisma.couple.findFirst({
    where: { slug: "jeff-and-sasha" },
  })

  if (!couple) {
    console.error("❌ Could not find wedding couple")
    process.exit(1)
  }

  console.log(`\n📊 Guest Statistics for ${couple.partner1Name} & ${couple.partner2Name}\n`)

  // Total guests
  const totalGuests = await prisma.guest.count({
    where: { coupleId: couple.id },
  })
  console.log(`📋 Total Guest Parties: ${totalGuests}`)

  // Guests with phone numbers
  const guestsWithPhone = await prisma.guest.count({
    where: {
      coupleId: couple.id,
      phone: { not: null },
    },
  })
  console.log(`📞 Parties with Phone Numbers: ${guestsWithPhone}`)

  // Guests without phone numbers
  const guestsWithoutPhone = totalGuests - guestsWithPhone
  console.log(`❓ Parties without Phone Numbers: ${guestsWithoutPhone}`)

  // Total capacity (sum of maxGuestsAllowed)
  const guests = await prisma.guest.findMany({
    where: { coupleId: couple.id },
    select: { maxGuestsAllowed: true },
  })
  const totalCapacity = guests.reduce((sum, g) => sum + g.maxGuestsAllowed, 0)
  console.log(`\n👥 Total Guest Capacity: ${totalCapacity} people`)

  // Breakdown by location
  console.log(`\n📍 Breakdown by Location:`)
  const tags = await prisma.tag.findMany({
    where: { coupleId: couple.id },
    include: {
      guests: {
        include: {
          guest: {
            select: { maxGuestsAllowed: true },
          },
        },
      },
    },
  })

  for (const tag of tags) {
    const partyCount = tag.guests.length
    const guestCount = tag.guests.reduce(
      (sum, gt) => sum + gt.guest.maxGuestsAllowed,
      0
    )
    console.log(`   ${tag.name}: ${partyCount} parties, ${guestCount} guests`)
  }

  // RSVP status
  console.log(`\n✉️  RSVP Status:`)
  const rsvpResponses = await prisma.rSVPResponse.count({
    where: { coupleId: couple.id },
  })
  console.log(`   Responses: ${rsvpResponses}`)

  const attending = await prisma.rSVPResponse.count({
    where: {
      coupleId: couple.id,
      status: "YES",
    },
  })
  console.log(`   Attending: ${attending}`)

  const declined = await prisma.rSVPResponse.count({
    where: {
      coupleId: couple.id,
      status: "NO",
    },
  })
  console.log(`   Declined: ${declined}`)

  const pending = totalGuests - rsvpResponses
  console.log(`   Pending: ${pending}`)

  // Sample guests
  console.log(`\n📝 Sample Guests:`)
  const sampleGuests = await prisma.guest.findMany({
    where: { coupleId: couple.id },
    take: 5,
    select: {
      firstName: true,
      lastName: true,
      phone: true,
      maxGuestsAllowed: true,
    },
  })

  for (const guest of sampleGuests) {
    const phoneDisplay = guest.phone ? guest.phone : "No phone"
    console.log(
      `   ${guest.firstName} ${guest.lastName} - ${guest.maxGuestsAllowed} guests - ${phoneDisplay}`
    )
  }
}

main()
  .catch((error) => {
    console.error("Error:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
