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
    runId: "verify-fix",
    hypothesisId,
  }
  fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n")
  console.log(`[${hypothesisId}] ${message}:`, JSON.stringify(data, null, 2))
}

async function main() {
  try {
    const wedding = await prisma.couple.findFirst()
    if (!wedding) {
      console.error("No wedding found")
      return
    }

    console.log("\n=== STEP 1: Check current state ===\n")

    // Count primary guest RSVP responses only
    const primaryGuestResponses = await prisma.rSVPResponse.findMany({
      where: {
        coupleId: wedding.id,
        status: "YES",
        guest: {
          parentGuestId: null,
        },
      },
      select: {
        answersJSON: true,
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    let totalPeopleFromPrimaryResponses = 0
    for (const response of primaryGuestResponses) {
      if (response.answersJSON) {
        try {
          const answers = JSON.parse(response.answersJSON)
          totalPeopleFromPrimaryResponses += answers.confirmedGuestCount || 1
        } catch {
          totalPeopleFromPrimaryResponses += 1
        }
      } else {
        totalPeopleFromPrimaryResponses += 1
      }
    }

    log("VERIFY", "verify:66", "Current primary guest count", {
      primaryResponses: primaryGuestResponses.length,
      totalPeopleFromPrimaryResponses,
      expectedSeats: 181,
      isCorrect: totalPeopleFromPrimaryResponses <= 181,
    })

    // Count plus-one responses (should be deleted)
    const plusOneResponses = await prisma.rSVPResponse.count({
      where: {
        coupleId: wedding.id,
        guest: {
          parentGuestId: { not: null },
        },
      },
    })

    log("VERIFY", "verify:84", "Plus-one RSVP responses (should be 0)", {
      plusOneResponses,
      needsCleanup: plusOneResponses > 0,
    })

    console.log("\n=== STEP 2: Clean up plus-one RSVP responses ===\n")

    if (plusOneResponses > 0) {
      const deleted = await prisma.rSVPResponse.deleteMany({
        where: {
          coupleId: wedding.id,
          guest: {
            parentGuestId: { not: null },
          },
        },
      })

      log("CLEANUP", "verify:102", "Deleted plus-one RSVP responses", {
        deletedCount: deleted.count,
      })

      console.log(`✓ Deleted ${deleted.count} plus-one RSVP responses`)
    } else {
      console.log("✓ No plus-one RSVP responses to clean up")
    }

    console.log("\n=== STEP 3: Fix plus-one maxGuestsAllowed ===\n")

    // Set all plus-one guests' maxGuestsAllowed to 0
    const updatedPlusOnes = await prisma.guest.updateMany({
      where: {
        coupleId: wedding.id,
        parentGuestId: { not: null },
      },
      data: {
        maxGuestsAllowed: 0,
      },
    })

    log("CLEANUP", "verify:126", "Updated plus-one maxGuestsAllowed to 0", {
      updatedCount: updatedPlusOnes.count,
    })

    console.log(`✓ Updated ${updatedPlusOnes.count} plus-one guests to maxGuestsAllowed=0`)

    console.log("\n=== STEP 4: Verify final state ===\n")

    // Recount after cleanup
    const finalPrimaryResponses = await prisma.rSVPResponse.findMany({
      where: {
        coupleId: wedding.id,
        status: "YES",
        guest: {
          parentGuestId: null,
        },
      },
      select: {
        answersJSON: true,
      },
    })

    let finalTotalPeople = 0
    for (const response of finalPrimaryResponses) {
      if (response.answersJSON) {
        try {
          const answers = JSON.parse(response.answersJSON)
          finalTotalPeople += answers.confirmedGuestCount || 1
        } catch {
          finalTotalPeople += 1
        }
      } else {
        finalTotalPeople += 1
      }
    }

    const totalMaxGuestsAllowed = await prisma.guest.aggregate({
      where: {
        coupleId: wedding.id,
        parentGuestId: null,
      },
      _sum: {
        maxGuestsAllowed: true,
      },
    })

    const finalPlusOneResponses = await prisma.rSVPResponse.count({
      where: {
        coupleId: wedding.id,
        guest: {
          parentGuestId: { not: null },
        },
      },
    })

    log("FINAL", "verify:185", "Final verification", {
      primaryGuestResponses: finalPrimaryResponses.length,
      totalPeopleAttending: finalTotalPeople,
      totalMaxGuestsAllowed: totalMaxGuestsAllowed._sum.maxGuestsAllowed,
      plusOneResponses: finalPlusOneResponses,
      expectedSeats: 181,
      isCorrect: finalTotalPeople <= 181 && finalPlusOneResponses === 0,
    })

    console.log("\n=== FINAL RESULTS ===")
    console.log(`Primary guest responses: ${finalPrimaryResponses.length}`)
    console.log(`Total people attending: ${finalTotalPeople}`)
    console.log(`Expected capacity: 181`)
    console.log(`Plus-one responses: ${finalPlusOneResponses}`)
    console.log(`Total maxGuestsAllowed: ${totalMaxGuestsAllowed._sum.maxGuestsAllowed}`)
    console.log(
      `\n${finalTotalPeople <= 181 && finalPlusOneResponses === 0 ? "✓ FIXED!" : "✗ Still issues"}`
    )
  } catch (error) {
    log("ERROR", "verify:208", "Script error", { error: String(error) })
    console.error("Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
