/**
 * Split Radi and Sophie into two individual guest cards.
 * - Radi's card: only her name
 * - Sophie's card: only her name (new primary guest)
 */
import { prisma } from "../lib/prisma"

async function main() {
  console.log("\n=== Splitting Radi and Sophie into individual guests ===\n")

  // Find Radi's guest record
  const radiGuest = await prisma.guest.findFirst({
    where: {
      parentGuestId: null,
      OR: [
        { firstName: { contains: "Radi", mode: "insensitive" } },
        { firstName: { contains: "Radie", mode: "insensitive" } },
      ],
    },
    include: {
      rsvpResponses: { where: { eventId: null }, take: 1 },
      plusOnes: true,
    },
  })

  if (!radiGuest) {
    console.error("No guest matching 'Radi' found.")
    process.exit(1)
  }

  console.log(`Found: ${radiGuest.firstName} ${radiGuest.lastName} (${radiGuest.id})`)

  // 1. Update Radi to have only her name (firstName Radi, keep lastName)
  const radiLastName = radiGuest.lastName || "Sophie"
  await prisma.guest.update({
    where: { id: radiGuest.id },
    data: {
      firstName: "Radi",
      lastName: radiLastName,
    },
  })
  console.log(`✅ Radi's card: Radi ${radiLastName}`)

  // 2. Clear plusOneName from Radi's RSVP
  const radiRsvp = radiGuest.rsvpResponses[0]
  if (radiRsvp?.plusOneName) {
    await prisma.rSVPResponse.update({
      where: { id: radiRsvp.id },
      data: { plusOneName: null },
    })
    console.log(`✅ Cleared plusOneName from Radi's RSVP`)
  }

  // 3. Check if Sophie exists as a plus-one Guest record
  const sophiePlusOne = radiGuest.plusOnes.find(
    (p) => p.firstName.toLowerCase().includes("sophie") || p.firstName.toLowerCase().includes("sophi")
  )

  if (sophiePlusOne) {
    // Promote Sophie from plus-one to primary guest
    await prisma.guest.update({
      where: { id: sophiePlusOne.id },
      data: {
        parentGuestId: null,
        isPrimaryContact: true,
        notes: sophiePlusOne.notes?.replace(/Plus-one of .+/, "").trim() || null,
      },
    })
    console.log(`✅ Sophie promoted to individual guest: ${sophiePlusOne.firstName} ${sophiePlusOne.lastName}`)
  } else {
    // Create Sophie as new primary guest (she was only in plusOneName)
    const existingSophie = await prisma.guest.findFirst({
      where: {
        coupleId: radiGuest.coupleId,
        parentGuestId: null,
        firstName: { equals: "Sophie", mode: "insensitive" },
      },
    })

    if (existingSophie) {
      console.log(`✅ Sophie already exists as individual: ${existingSophie.firstName} ${existingSophie.lastName}`)
    } else {
      const sophieGuest = await prisma.guest.create({
        data: {
          coupleId: radiGuest.coupleId,
          firstName: "Sophie",
          lastName: radiLastName, // Use same last name if they're a couple
          allowPlusOne: false,
          plusOnePolicy: "none",
          maxGuestsAllowed: 1,
          importSource: "manual",
          parentGuestId: null,
        },
      })

      // Copy RSVP status from Radi if she was attending with Radi
      if (radiRsvp) {
        await prisma.rSVPResponse.create({
          data: {
            guestId: sophieGuest.id,
            coupleId: radiGuest.coupleId,
            eventId: radiRsvp.eventId,
            status: radiRsvp.status,
            plusOneName: null,
            message: "Split from Radi's RSVP",
            respondedAt: radiRsvp.respondedAt,
          },
        })
      }

      await prisma.guestActivity.create({
        data: {
          guestId: sophieGuest.id,
          action: "CREATED",
          description: "Sophie added as individual guest (split from Radi)",
        },
      })

      console.log(`✅ Created Sophie as individual guest: Sophie ${radiLastName}`)
      console.log(`   id: ${sophieGuest.id}`)
      console.log(`   RSVP link: /rsvp/${sophieGuest.inviteToken}`)
    }
  }

  console.log("\n=== Done ===")
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
