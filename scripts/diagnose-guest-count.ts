import { PrismaClient } from "@prisma/client"
import fs from "fs"

const prisma = new PrismaClient()
const LOG_FILE = "/Users/jefferyerhunse/GitRepos/wedding-platform/.cursor/debug-85a9db.log"

function log(hypothesisId: string, location: string, message: string, data: any) {
  const entry = {
    sessionId: "85a9db",
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    location,
    message,
    data,
    runId: "diagnosis",
    hypothesisId,
  }
  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n")
  console.log(`[${hypothesisId}] ${message}:`, data)
}

async function main() {
  try {
    // Get the wedding
    const wedding = await prisma.couple.findFirst()
    if (!wedding) {
      console.error("No wedding found")
      return
    }

    log("SETUP", "diagnose:28", "Wedding found", {
      weddingId: wedding.id,
      maxCapacity: wedding.maxCapacity,
    })

    // Hypothesis A: Count total guests vs RSVP responses
    const totalGuests = await prisma.guest.count({
      where: { coupleId: wedding.id },
    })

    const totalPrimaryGuests = await prisma.guest.count({
      where: {
        coupleId: wedding.id,
        parentGuestId: null, // Primary guests only
      },
    })

    const totalPlusOnes = await prisma.guest.count({
      where: {
        coupleId: wedding.id,
        parentGuestId: { not: null }, // Plus ones only
      },
    })

    log("A", "diagnose:56", "Guest record counts", {
      totalGuests,
      totalPrimaryGuests,
      totalPlusOnes,
      expectedTotal: 181,
    })

    // Hypothesis B & D: Examine RSVP responses
    const rsvpResponses = await prisma.rSVPResponse.findMany({
      where: {
        coupleId: wedding.id,
        status: "YES",
      },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            maxGuestsAllowed: true,
            parentGuestId: true,
          },
        },
      },
    })

    log("B", "diagnose:82", "Total YES RSVP responses", {
      count: rsvpResponses.length,
    })

    // Analyze each response
    let totalFromAnswersJSON = 0
    let responsesWithJSON = 0
    let responsesWithoutJSON = 0
    let primaryGuestResponses = 0
    let plusOneResponses = 0
    const guestCountBreakdown: any[] = []

    for (const response of rsvpResponses) {
      const isPlusOne = response.guest.parentGuestId !== null
      
      if (isPlusOne) {
        plusOneResponses++
      } else {
        primaryGuestResponses++
      }

      let confirmedCount = 1 // default
      if (response.answersJSON) {
        responsesWithJSON++
        try {
          const answers = JSON.parse(response.answersJSON)
          confirmedCount = answers.confirmedGuestCount || 1
        } catch (e) {
          // parse error, use default
        }
      } else {
        responsesWithoutJSON++
      }

      totalFromAnswersJSON += confirmedCount

      guestCountBreakdown.push({
        guestId: response.guest.id,
        name: `${response.guest.firstName} ${response.guest.lastName}`,
        isPlusOne,
        maxGuestsAllowed: response.guest.maxGuestsAllowed,
        confirmedCount,
        hasAnswersJSON: !!response.answersJSON,
      })
    }

    log("D", "diagnose:130", "RSVP response breakdown", {
      totalResponses: rsvpResponses.length,
      primaryGuestResponses,
      plusOneResponses,
      responsesWithJSON,
      responsesWithoutJSON,
      totalFromAnswersJSON,
      expectedSeats: 181,
      discrepancy: totalFromAnswersJSON - 181,
    })

    // Log first 10 examples
    log("D", "diagnose:143", "Sample guest count data (first 10)", {
      samples: guestCountBreakdown.slice(0, 10),
    })

    // Hypothesis C: Check for duplicate responses
    const guestIdsWithResponses = rsvpResponses.map((r) => r.guest.id)
    const uniqueGuestIds = new Set(guestIdsWithResponses)
    const duplicateGuestIds = guestIdsWithResponses.filter(
      (id, index) => guestIdsWithResponses.indexOf(id) !== index
    )

    log("C", "diagnose:156", "Duplicate RSVP check", {
      totalRSVPResponses: rsvpResponses.length,
      uniqueGuestIds: uniqueGuestIds.size,
      hasDuplicates: duplicateGuestIds.length > 0,
      duplicateGuestIds: [...new Set(duplicateGuestIds)],
    })

    // Hypothesis E: Check maxGuestsAllowed totals
    const allGuests = await prisma.guest.findMany({
      where: { coupleId: wedding.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        maxGuestsAllowed: true,
        parentGuestId: true,
      },
    })

    const totalMaxGuestsAllowed = allGuests.reduce(
      (sum, g) => sum + g.maxGuestsAllowed,
      0
    )

    const primaryGuestsMaxAllowed = allGuests
      .filter((g) => g.parentGuestId === null)
      .reduce((sum, g) => sum + g.maxGuestsAllowed, 0)

    const plusOnesMaxAllowed = allGuests
      .filter((g) => g.parentGuestId !== null)
      .reduce((sum, g) => sum + g.maxGuestsAllowed, 0)

    log("E", "diagnose:193", "maxGuestsAllowed analysis", {
      totalGuests: allGuests.length,
      totalMaxGuestsAllowed,
      primaryGuestsMaxAllowed,
      plusOnesMaxAllowed,
      expectedTotal: 181,
      discrepancy: totalMaxGuestsAllowed - 181,
    })

    // Summary
    log("SUMMARY", "diagnose:204", "Complete diagnosis", {
      expectedSeats: 181,
      actualRSVPResponses: rsvpResponses.length,
      calculatedAttendingPeople: totalFromAnswersJSON,
      totalGuestRecords: totalGuests,
      primaryGuests: totalPrimaryGuests,
      plusOneGuests: totalPlusOnes,
      totalMaxGuestsAllowed,
      issue: totalFromAnswersJSON > 181 ? "OVERCOUNTED" : "OK",
    })

  } catch (error) {
    log("ERROR", "diagnose:218", "Script error", { error: String(error) })
    console.error("Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
