#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function createAdminUser() {
  console.log("Setting up admin access...")

  // Get the first couple
  const couple = await prisma.couple.findFirst()
  
  if (!couple) {
    console.error("No wedding couple found. Please run the seed script first.")
    process.exit(1)
  }

  console.log(`Found wedding: ${couple.partner1Name} & ${couple.partner2Name}`)

  // Check if an owner user already exists
  const existingOwner = await prisma.user.findFirst({
    where: {
      coupleId: couple.id,
      role: "OWNER"
    }
  })

  if (existingOwner) {
    console.log(`✓ Admin user already exists: ${existingOwner.email}`)
    console.log("\nYou can access the admin dashboard at:")
    console.log(`  http://localhost:3001/admin/rsvp-dashboard`)
    console.log("\nTo sign in, use:")
    console.log(`  Email: ${existingOwner.email}`)
    console.log("  (You'll receive a magic link via email)")
    return
  }

  // Prompt for email
  const readline = require("readline")
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  rl.question("Enter admin email address: ", async (email: string) => {
    if (!email || !email.includes("@")) {
      console.error("Invalid email address")
      rl.close()
      process.exit(1)
    }

    rl.question("Enter admin name (optional): ", async (name: string) => {
      try {
        // Create or update user
        const user = await prisma.user.upsert({
          where: { email: email.trim() },
          update: {
            role: "OWNER",
            coupleId: couple.id,
            name: name.trim() || null,
          },
          create: {
            email: email.trim(),
            name: name.trim() || null,
            role: "OWNER",
            coupleId: couple.id,
          },
        })

        console.log("\n✓ Admin user created successfully!")
        console.log(`  Email: ${user.email}`)
        console.log(`  Role: ${user.role}`)
        console.log(`  Wedding: ${couple.partner1Name} & ${couple.partner2Name}`)
        console.log("\nYou can now access the admin dashboard at:")
        console.log(`  http://localhost:3001/admin/rsvp-dashboard`)
        console.log("\nTo sign in:")
        console.log(`  1. Go to http://localhost:3001/auth/signin`)
        console.log(`  2. Enter your email: ${user.email}`)
        console.log("  3. Check your email for the magic link")
      } catch (error) {
        console.error("Error creating admin user:", error)
      } finally {
        rl.close()
        await prisma.$disconnect()
      }
    })
  })
}

createAdminUser().catch((error) => {
  console.error("Error:", error)
  process.exit(1)
})
