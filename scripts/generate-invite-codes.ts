#!/usr/bin/env tsx

/**
 * Script to generate invite codes for guests
 * 
 * Usage:
 *   tsx scripts/generate-invite-codes.ts [options]
 * 
 * Options:
 *   --couple-id <id>     Generate codes for a specific couple
 *   --guest-id <id>      Generate code for a specific guest
 *   --all                Generate codes for all guests without codes
 *   --regenerate         Regenerate codes even if they exist
 *   --dry-run            Show what would be done without making changes
 */

import { PrismaClient } from "@prisma/client"
import { nanoid } from "nanoid"

const prisma = new PrismaClient()

interface Options {
  coupleId?: string
  guestId?: string
  all: boolean
  regenerate: boolean
  dryRun: boolean
}

async function generateInviteCodes(options: Options) {
  try {
    // Build query
    let whereClause: any = {}

    if (options.guestId) {
      whereClause.id = options.guestId
    } else if (options.coupleId) {
      whereClause.coupleId = options.coupleId
    }

    if (!options.regenerate) {
      whereClause.inviteToken = null
    }

    // Find guests
    const guests = await prisma.guest.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        inviteToken: true,
        coupleId: true,
      },
    })

    if (guests.length === 0) {
      console.log("No guests found matching criteria.")
      return
    }

    console.log(`Found ${guests.length} guest(s) to process.`)
    if (options.dryRun) {
      console.log("\n[DRY RUN] Would generate codes for:")
      guests.forEach((g) => {
        console.log(`  - ${g.firstName} ${g.lastName} (${g.email || "no email"})`)
      })
      return
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Generate codes
    for (const guest of guests) {
      try {
        // Skip if guest already has a code and regenerate is false
        if (!options.regenerate && guest.inviteToken) {
          console.log(`Skipping ${guest.firstName} ${guest.lastName} (already has code)`)
          continue
        }

        // Generate unique token
        let newToken: string
        let attempts = 0
        const maxAttempts = 10

        do {
          newToken = nanoid(10)
          attempts++

          const existing = await prisma.guest.findUnique({
            where: { inviteToken: newToken },
          })

          if (!existing || existing.id === guest.id) {
            break
          }

          if (attempts >= maxAttempts) {
            throw new Error("Failed to generate unique code")
          }
        } while (attempts < maxAttempts)

        // Update guest
        await prisma.guest.update({
          where: { id: guest.id },
          data: { inviteToken: newToken },
        })

        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
        const rsvpUrl = `${baseUrl}/rsvp/${newToken}`

        console.log(`✓ Generated code for ${guest.firstName} ${guest.lastName}`)
        console.log(`  Code: ${newToken}`)
        console.log(`  URL: ${rsvpUrl}`)

        results.success++
      } catch (error: any) {
        results.failed++
        results.errors.push(`${guest.firstName} ${guest.lastName}: ${error.message}`)
        console.error(`✗ Failed for ${guest.firstName} ${guest.lastName}:`, error.message)
      }
    }

    console.log(`\nSummary:`)
    console.log(`  Success: ${results.success}`)
    console.log(`  Failed: ${results.failed}`)
    if (results.errors.length > 0) {
      console.log(`\nErrors:`)
      results.errors.forEach((err) => console.log(`  - ${err}`))
    }
  } catch (error: any) {
    console.error("Error:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const options: Options = {
  all: false,
  regenerate: false,
  dryRun: false,
}

let coupleId: string | undefined
let guestId: string | undefined

for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  switch (arg) {
    case "--all":
      options.all = true
      break
    case "--regenerate":
      options.regenerate = true
      break
    case "--dry-run":
      options.dryRun = true
      break
    case "--couple-id":
      coupleId = args[++i]
      break
    case "--guest-id":
      guestId = args[++i]
      break
    case "--help":
    case "-h":
      console.log(`
Usage: tsx scripts/generate-invite-codes.ts [options]

Options:
  --couple-id <id>     Generate codes for a specific couple
  --guest-id <id>      Generate code for a specific guest
  --all                Generate codes for all guests without codes
  --regenerate         Regenerate codes even if they exist
  --dry-run            Show what would be done without making changes
  --help, -h           Show this help message

Examples:
  # Generate codes for all guests without codes
  tsx scripts/generate-invite-codes.ts --all

  # Generate codes for a specific couple
  tsx scripts/generate-invite-codes.ts --couple-id <couple-id>

  # Regenerate code for a specific guest
  tsx scripts/generate-invite-codes.ts --guest-id <guest-id> --regenerate

  # Dry run to see what would be done
  tsx scripts/generate-invite-codes.ts --all --dry-run
`)
      process.exit(0)
  }
}

if (guestId) {
  options.guestId = guestId
} else if (coupleId) {
  options.coupleId = coupleId
} else if (!options.all) {
  console.error("Error: Must specify --couple-id, --guest-id, or --all")
  process.exit(1)
}

generateInviteCodes(options)
