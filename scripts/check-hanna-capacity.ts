import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function checkCapacity() {
  try {
    // Find Aunt Hanna
    const hanna = await prisma.guest.findFirst({
      where: {
        OR: [
          { firstName: { contains: "Hanna", mode: "insensitive" } },
          { lastName: { contains: "Hanna", mode: "insensitive" } },
        ]
      },
      include: {
        couple: true,
        rsvpResponses: true,
      },
    })

    console.log("\n=== AUNT HANNA DETAILS ===")
    if (hanna) {
      console.log(`Name: ${hanna.firstName} ${hanna.lastName}`)
      console.log(`Email: ${hanna.email}`)
      console.log(`Phone: ${hanna.phone}`)
      console.log(`Max Guests Allowed: ${hanna.maxGuestsAllowed}`)
      console.log(`Invite Token: ${hanna.inviteToken}`)
      console.log(`RSVP Responses:`, hanna.rsvpResponses)
    } else {
      console.log("Aunt Hanna not found!")
      
      // Search for all guests with similar names
      const similarGuests = await prisma.guest.findMany({
        where: {
          OR: [
            { firstName: { contains: "hanna", mode: "insensitive" } },
            { firstName: { contains: "hannah", mode: "insensitive" } },
            { lastName: { contains: "hanna", mode: "insensitive" } },
            { lastName: { contains: "hannah", mode: "insensitive" } },
          ]
        },
      })
      
      console.log("\nSimilar guests found:", similarGuests.length)
      similarGuests.forEach(g => {
        console.log(`- ${g.firstName} ${g.lastName} (${g.email})`)
      })
      
      return
    }

    // Check current attending count
    const currentAttending = await prisma.rSVPResponse.count({
      where: {
        coupleId: hanna.coupleId,
        status: "YES",
      },
    })

    // Get actual sum of guest counts for more accuracy
    const attendingResponses = await prisma.rSVPResponse.findMany({
      where: {
        coupleId: hanna.coupleId,
        status: "YES",
      },
      select: {
        answersJSON: true,
      },
    })

    let totalAttendingPeople = 0
    attendingResponses.forEach(response => {
      if (response.answersJSON) {
        try {
          const answers = JSON.parse(response.answersJSON)
          totalAttendingPeople += answers.confirmedGuestCount || 1
        } catch (e) {
          totalAttendingPeople += 1
        }
      } else {
        totalAttendingPeople += 1
      }
    })

    console.log("\n=== CAPACITY STATUS ===")
    console.log(`Wedding maxCapacity: ${hanna.couple.maxCapacity}`)
    console.log(`RSVP Responses with YES status: ${currentAttending}`)
    console.log(`Total people attending: ${totalAttendingPeople}`)
    console.log(`Available spots (based on responses): ${hanna.couple.maxCapacity ? hanna.couple.maxCapacity - currentAttending : "unlimited"}`)
    console.log(`Available spots (based on people): ${hanna.couple.maxCapacity ? hanna.couple.maxCapacity - totalAttendingPeople : "unlimited"}`)
    console.log(`\nHanna's allocation: ${hanna.maxGuestsAllowed} guests`)
    
    if (hanna.couple.maxCapacity) {
      if (currentAttending + hanna.maxGuestsAllowed > hanna.couple.maxCapacity) {
        console.log(`\n⚠️ PROBLEM: Hanna's ${hanna.maxGuestsAllowed} guests + ${currentAttending} current RSVPs = ${currentAttending + hanna.maxGuestsAllowed}`)
        console.log(`   This exceeds capacity of ${hanna.couple.maxCapacity}`)
        console.log(`   The capacity check is using RSVP RESPONSE COUNT, not actual guest count!`)
      } else {
        console.log(`\n✅ Hanna should be able to RSVP`)
      }
    }
  } catch (error) {
    console.error("Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCapacity()
