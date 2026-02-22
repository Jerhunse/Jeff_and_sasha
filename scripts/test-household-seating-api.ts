#!/usr/bin/env tsx
/**
 * Automated test script for household seating functionality
 * Tests the API endpoints directly to verify business logic
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const API_BASE = "http://localhost:3002"
let authCookie = ""

interface TestResult {
  name: string
  passed: boolean
  message: string
  error?: string
}

const results: TestResult[] = []

function logTest(name: string, passed: boolean, message: string, error?: string) {
  results.push({ name, passed, message, error })
  const icon = passed ? "✅" : "❌"
  console.log(`${icon} ${name}: ${message}`)
  if (error) {
    console.log(`   Error: ${error}`)
  }
}

async function main() {
  console.log("🧪 Starting Household Seating API Tests\n")

  // Get test data
  const couple = await prisma.couple.findFirst({
    where: { slug: "jeff-and-sasha" },
  })

  if (!couple) {
    console.error("❌ Could not find couple")
    process.exit(1)
  }

  const seatingChart = await prisma.seatingChart.findFirst({
    where: { coupleId: couple.id },
    include: {
      tables: {
        take: 3,
        orderBy: { name: "asc" },
      },
    },
  })

  if (!seatingChart || seatingChart.tables.length < 2) {
    console.error("❌ Need at least 2 tables for testing")
    process.exit(1)
  }

  const household = await prisma.household.findFirst({
    where: {
      coupleId: couple.id,
      name: "Valle's",
    },
    include: {
      guests: true,
    },
  })

  if (!household || household.guests.length !== 3) {
    console.error("❌ Valle's household not found or doesn't have 3 members")
    console.error("   Run: npx tsx scripts/setup-valle-household.ts")
    process.exit(1)
  }

  const valleGuest = household.guests.find(g => 
    g.firstName.toLowerCase() === "valle"
  )

  if (!valleGuest) {
    console.error("❌ Could not find Valle guest")
    process.exit(1)
  }

  const table1 = seatingChart.tables[0]
  const table2 = seatingChart.tables[1]

  console.log("📋 Test Data:")
  console.log(`   Couple: ${couple.slug}`)
  console.log(`   Seating Chart: ${seatingChart.id}`)
  console.log(`   Household: ${household.name} (${household.guests.length} members)`)
  console.log(`   Guest: ${valleGuest.firstName} ${valleGuest.lastName}`)
  console.log(`   Table 1: ${table1.name} (${table1.id})`)
  console.log(`   Table 2: ${table2.name} (${table2.id})`)
  console.log()

  // Clean up any existing seat assignments for Valle's household
  console.log("🧹 Cleaning up existing seat assignments...")
  await prisma.seat.deleteMany({
    where: {
      guestId: {
        in: household.guests.map(g => g.id),
      },
    },
  })
  console.log()

  // TEST 1: Assign household to Table 1
  console.log("TEST 1: Assign Valle's household to Table 1")
  console.log("=" .repeat(60))
  try {
    const response = await fetch(
      `${API_BASE}/api/admin/seating/${seatingChart.id}/tables/${table1.id}/seats`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestId: valleGuest.id,
          householdId: household.id,
        }),
      }
    )

    if (response.status === 401) {
      logTest(
        "Test 1",
        false,
        "Authentication required - please log in at http://localhost:3002/auth/signin first"
      )
      console.log("\n⚠️  Tests require authentication. Please:")
      console.log("   1. Open http://localhost:3002/auth/signin in your browser")
      console.log("   2. Log in as admin")
      console.log("   3. Run this test script again")
      return
    }

    const data = await response.json()

    if (!response.ok) {
      logTest("Test 1", false, "Failed to assign household", JSON.stringify(data))
    } else if (data.seats && data.seats.length === 3) {
      logTest(
        "Test 1",
        true,
        `Successfully assigned all 3 household members to ${table1.name}`
      )

      // Verify in database
      const seatsInDb = await prisma.seat.findMany({
        where: {
          tableId: table1.id,
          guestId: {
            in: household.guests.map(g => g.id),
          },
        },
      })

      logTest(
        "Test 1 (DB Verification)",
        seatsInDb.length === 3,
        `Found ${seatsInDb.length} seats in database (expected 3)`
      )
    } else {
      logTest(
        "Test 1",
        false,
        `Expected 3 seats, got ${data.seats?.length || 0}`
      )
    }
  } catch (error: any) {
    logTest("Test 1", false, "Request failed", error.message)
  }
  console.log()

  // TEST 2: Try to assign to same table again (should fail with ALREADY_AT_TABLE)
  console.log("TEST 2: Try to assign Valle's household to Table 1 again")
  console.log("=" .repeat(60))
  try {
    const response = await fetch(
      `${API_BASE}/api/admin/seating/${seatingChart.id}/tables/${table1.id}/seats`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestId: valleGuest.id,
          householdId: household.id,
        }),
      }
    )

    const data = await response.json()

    if (response.status === 409 && data.error === "ALREADY_AT_TABLE") {
      logTest(
        "Test 2",
        true,
        "Correctly prevented duplicate assignment to same table"
      )
    } else if (response.ok) {
      logTest(
        "Test 2",
        false,
        "Should have returned 409 error but succeeded"
      )
    } else {
      logTest(
        "Test 2",
        false,
        `Expected 409 ALREADY_AT_TABLE, got ${response.status}: ${data.error}`
      )
    }
  } catch (error: any) {
    logTest("Test 2", false, "Request failed", error.message)
  }
  console.log()

  // TEST 3: Try to assign to different table without force flag (should return 409 with current table info)
  console.log("TEST 3: Try to assign Valle's household to Table 2 without force flag")
  console.log("=" .repeat(60))
  try {
    const response = await fetch(
      `${API_BASE}/api/admin/seating/${seatingChart.id}/tables/${table2.id}/seats`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestId: valleGuest.id,
          householdId: household.id,
        }),
      }
    )

    const data = await response.json()

    if (
      response.status === 409 &&
      data.currentTableId &&
      data.currentTable === table1.name
    ) {
      logTest(
        "Test 3",
        true,
        `Correctly returned conflict with current table: ${data.currentTable}`
      )
    } else if (response.ok) {
      logTest(
        "Test 3",
        false,
        "Should have required force flag but succeeded"
      )
    } else {
      logTest(
        "Test 3",
        false,
        `Expected 409 with table info, got ${response.status}`
      )
    }
  } catch (error: any) {
    logTest("Test 3", false, "Request failed", error.message)
  }
  console.log()

  // TEST 4: Move household to Table 2 with force flag
  console.log("TEST 4: Move Valle's household to Table 2 with force flag")
  console.log("=" .repeat(60))
  try {
    const response = await fetch(
      `${API_BASE}/api/admin/seating/${seatingChart.id}/tables/${table2.id}/seats`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestId: valleGuest.id,
          householdId: household.id,
          force: true,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      logTest("Test 4", false, "Failed to move household", JSON.stringify(data))
    } else if (data.seats && data.seats.length === 3) {
      logTest(
        "Test 4",
        true,
        `Successfully moved all 3 household members to ${table2.name}`
      )

      // Verify in database
      const seatsInTable1 = await prisma.seat.count({
        where: {
          tableId: table1.id,
          guestId: {
            in: household.guests.map(g => g.id),
          },
        },
      })

      const seatsInTable2 = await prisma.seat.count({
        where: {
          tableId: table2.id,
          guestId: {
            in: household.guests.map(g => g.id),
          },
        },
      })

      logTest(
        "Test 4 (DB Verification - Table 1)",
        seatsInTable1 === 0,
        `Removed from ${table1.name}: ${seatsInTable1 === 0 ? "✓" : "✗ Still has " + seatsInTable1}`
      )

      logTest(
        "Test 4 (DB Verification - Table 2)",
        seatsInTable2 === 3,
        `Added to ${table2.name}: ${seatsInTable2 === 3 ? "✓" : "✗ Only has " + seatsInTable2}`
      )
    } else {
      logTest(
        "Test 4",
        false,
        `Expected 3 seats, got ${data.seats?.length || 0}`
      )
    }
  } catch (error: any) {
    logTest("Test 4", false, "Request failed", error.message)
  }
  console.log()

  // TEST 5: Test insufficient capacity
  // First, create a table with limited capacity or fill table to near capacity
  console.log("TEST 5: Test insufficient capacity error")
  console.log("=" .repeat(60))
  try {
    // Find a table with capacity 10 and fill it with 8 seats
    const testTable = seatingChart.tables.find(t => t.capacity >= 10)
    if (!testTable) {
      logTest("Test 5", false, "Could not find suitable table for capacity test")
    } else {
      // Clean the table first
      await prisma.seat.deleteMany({
        where: { tableId: testTable.id },
      })

      // Create 8 dummy guests and assign them
      const dummyGuests = await Promise.all(
        Array.from({ length: 8 }, (_, i) =>
          prisma.guest.create({
            data: {
              coupleId: couple.id,
              firstName: `Dummy${i + 1}`,
              lastName: "Test",
              allowPlusOne: false,
              plusOnePolicy: "none",
            },
          })
        )
      )

      await prisma.seat.createMany({
        data: dummyGuests.map(g => ({
          tableId: testTable.id,
          guestId: g.id,
        })),
      })

      // Now try to assign Valle's household (3 people) to a table with only 2 seats left
      const response = await fetch(
        `${API_BASE}/api/admin/seating/${seatingChart.id}/tables/${testTable.id}/seats`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            guestId: valleGuest.id,
            householdId: household.id,
            force: true, // Force because they're already seated elsewhere
          }),
        }
      )

      const data = await response.json()

      if (response.status === 400 && data.error?.includes("Insufficient capacity")) {
        logTest(
          "Test 5",
          true,
          "Correctly rejected assignment due to insufficient capacity"
        )
      } else if (response.ok) {
        logTest(
          "Test 5",
          false,
          "Should have rejected due to capacity but succeeded"
        )
      } else {
        logTest(
          "Test 5",
          false,
          `Expected 400 capacity error, got ${response.status}: ${data.error}`
        )
      }

      // Clean up dummy guests
      await prisma.seat.deleteMany({
        where: {
          guestId: {
            in: dummyGuests.map(g => g.id),
          },
        },
      })
      await prisma.guest.deleteMany({
        where: {
          id: {
            in: dummyGuests.map(g => g.id),
          },
        },
      })
    }
  } catch (error: any) {
    logTest("Test 5", false, "Request failed", error.message)
  }
  console.log()

  // Print Summary
  console.log("=" .repeat(60))
  console.log("📊 TEST SUMMARY")
  console.log("=" .repeat(60))

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const total = results.length

  results.forEach(r => {
    const icon = r.passed ? "✅" : "❌"
    console.log(`${icon} ${r.name}`)
  })

  console.log()
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`)

  if (failed > 0) {
    console.log("\n❌ Some tests failed. Review the errors above.")
    process.exit(1)
  } else {
    console.log("\n✅ All tests passed!")
  }
}

main()
  .catch((error) => {
    console.error("❌ Fatal error:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
