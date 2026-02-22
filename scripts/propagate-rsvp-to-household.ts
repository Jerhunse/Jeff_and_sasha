import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔄 Propagating primary guest RSVP status to their plus-ones...\n")

  const primaryGuests = await prisma.guest.findMany({
    where: {
      coupleId: 'cmgn7015b0000y44c73zxrwpc',
      parentGuestId: null,
    },
    include: {
      rsvpResponses: {
        where: { eventId: null },
        orderBy: { respondedAt: 'desc' },
        take: 1,
      },
      plusOnes: {
        include: {
          rsvpResponses: {
            where: { eventId: null },
            orderBy: { respondedAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  })

  let updatedCount = 0
  let createdCount = 0

  for (const primary of primaryGuests) {
    // Skip if primary guest hasn't RSVP'd
    if (!primary.rsvpResponses[0]) {
      continue
    }

    const primaryStatus = primary.rsvpResponses[0].status

    // Update all plus-ones to have the same RSVP status
    for (const plusOne of primary.plusOnes) {
      if (!plusOne.rsvpResponses[0]) {
        // Create new RSVP response for plus-one
        await prisma.rSVPResponse.create({
          data: {
            guestId: plusOne.id,
            coupleId: primary.coupleId,
            status: primaryStatus,
            respondedAt: primary.rsvpResponses[0].respondedAt,
          },
        })
        createdCount++
        console.log(`  ✓ Created ${primaryStatus} RSVP for ${plusOne.firstName} ${plusOne.lastName} (parent: ${primary.firstName} ${primary.lastName})`)
      } else if (plusOne.rsvpResponses[0].status !== primaryStatus) {
        // Update existing RSVP response
        await prisma.rSVPResponse.update({
          where: { id: plusOne.rsvpResponses[0].id },
          data: {
            status: primaryStatus,
            respondedAt: primary.rsvpResponses[0].respondedAt,
          },
        })
        updatedCount++
        console.log(`  ✓ Updated ${plusOne.firstName} ${plusOne.lastName} from ${plusOne.rsvpResponses[0].status} to ${primaryStatus}`)
      }
    }
  }

  console.log(`\n✅ Done!`)
  console.log(`  Created: ${createdCount} new RSVP responses`)
  console.log(`  Updated: ${updatedCount} existing RSVP responses`)

  // Show new stats
  console.log("\n📊 NEW STATS:")
  console.log("─".repeat(50))
  
  const allGuests = await prisma.guest.findMany({
    where: { coupleId: 'cmgn7015b0000y44c73zxrwpc' },
    include: {
      rsvpResponses: {
        where: { eventId: null },
        orderBy: { respondedAt: 'desc' },
        take: 1,
      },
    },
  })

  const attending = allGuests.filter(g => g.rsvpResponses[0]?.status === 'YES').length
  const declined = allGuests.filter(g => g.rsvpResponses[0]?.status === 'NO').length
  const noResponse = allGuests.filter(g => !g.rsvpResponses[0]).length

  console.log(`  Total guests: ${allGuests.length}`)
  console.log(`  Attending (YES): ${attending}`)
  console.log(`  Declined (NO): ${declined}`)
  console.log(`  No response: ${noResponse}`)
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
