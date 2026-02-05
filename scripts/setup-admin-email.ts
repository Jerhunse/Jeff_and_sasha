#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function setupAdminEmail() {
  console.log("Setting up admin access for sashaplusjeff@gmail.com...")

  try {
    // Get the first couple
    const couple = await prisma.couple.findFirst()
    
    if (!couple) {
      console.error("No wedding couple found. Please run the seed script first.")
      process.exit(1)
    }

    console.log(`Found wedding: ${couple.partner1Name} & ${couple.partner2Name}`)

    // Create or update user with the specified email
    const user = await prisma.user.upsert({
      where: { email: "sashaplusjeff@gmail.com" },
      update: {
        role: "OWNER",
        coupleId: couple.id,
        name: "Jeff & Sasha",
      },
      create: {
        email: "sashaplusjeff@gmail.com",
        name: "Jeff & Sasha",
        role: "OWNER",
        coupleId: couple.id,
      },
    })

    console.log("\n✅ Admin user configured successfully!")
    console.log(`  Email: ${user.email}`)
    console.log(`  Name: ${user.name}`)
    console.log(`  Role: ${user.role}`)
    console.log(`  Wedding: ${couple.partner1Name} & ${couple.partner2Name}`)
    console.log("\n📍 Access the RSVP Dashboard at:")
    console.log(`  http://localhost:3001/admin/rsvp-dashboard`)
    console.log("\n🔐 To sign in:")
    console.log(`  1. Go to http://localhost:3001/auth/signin`)
    console.log(`  2. Enter your email: sashaplusjeff@gmail.com`)
    console.log("  3. Check your email for the magic link")
    console.log("  4. Click the link to sign in")
    console.log("\n✨ You're all set!")

  } catch (error) {
    console.error("Error setting up admin:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupAdminEmail()
