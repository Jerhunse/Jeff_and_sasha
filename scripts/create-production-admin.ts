#!/usr/bin/env tsx

/**
 * Create an admin user for production
 * This script connects to your production database and creates an OWNER user
 * 
 * Usage:
 *   npm run tsx scripts/create-production-admin.ts
 */

import { PrismaClient } from "@prisma/client"

// Use production database URL from environment
const prisma = new PrismaClient()

async function createProductionAdmin() {
  console.log("🚀 Creating Production Admin User\n")
  console.log("Using database:", process.env.DATABASE_URL?.substring(0, 50) + "...")

  try {
    // Get the first couple (your wedding)
    const couple = await prisma.couple.findFirst({
      select: {
        id: true,
        partner1Name: true,
        partner2Name: true,
        slug: true
      }
    })
    
    if (!couple) {
      console.error("❌ No wedding couple found in database.")
      console.error("   Please make sure your production database has wedding data.")
      process.exit(1)
    }

    console.log(`✅ Found wedding: ${couple.partner1Name} & ${couple.partner2Name}`)
    console.log(`   Slug: ${couple.slug}\n`)

    // Check if an owner user already exists
    const existingOwner = await prisma.user.findFirst({
      where: {
        coupleId: couple.id,
        role: "OWNER"
      }
    })

    if (existingOwner) {
      console.log(`✅ Admin user already exists!`)
      console.log(`   Email: ${existingOwner.email}`)
      console.log(`   Role: ${existingOwner.role}\n`)
      console.log("🌐 Access your admin dashboard at:")
      console.log(`   https://jeffandsasha.com/admin/rsvp-dashboard`)
      console.log(`   (or: https://wedding-platform-ebon.vercel.app/admin/rsvp-dashboard)\n`)
      console.log("🔐 To sign in:")
      console.log(`   1. Go to: https://jeffandsasha.com/auth/signin`)
      console.log(`   2. Enter email: ${existingOwner.email}`)
      console.log("   3. Check your email for the magic link")
      return
    }

    // Prompt for email
    const readline = require("readline")
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    rl.question("📧 Enter admin email address: ", async (email: string) => {
      if (!email || !email.includes("@")) {
        console.error("❌ Invalid email address")
        rl.close()
        process.exit(1)
      }

      rl.question("👤 Enter admin name (optional, press Enter to skip): ", async (name: string) => {
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

          console.log("\n🎉 Admin user created successfully!")
          console.log(`   Email: ${user.email}`)
          console.log(`   Name: ${user.name || "(not set)"}`)
          console.log(`   Role: ${user.role}`)
          console.log(`   Wedding: ${couple.partner1Name} & ${couple.partner2Name}\n`)
          
          console.log("🌐 Access your admin dashboard at:")
          console.log(`   https://jeffandsasha.com/admin/rsvp-dashboard`)
          console.log(`   (or: https://wedding-platform-ebon.vercel.app/admin/rsvp-dashboard)\n`)
          
          console.log("🔐 To sign in:")
          console.log(`   1. Go to: https://jeffandsasha.com/auth/signin`)
          console.log(`   2. Enter your email: ${user.email}`)
          console.log("   3. Check your email for the magic link")
          console.log("   4. Click the link to authenticate")
          console.log(`   5. Navigate to: https://jeffandsasha.com/admin/rsvp-dashboard\n`)
          
          console.log("✅ Setup complete! You can now access the admin panel.")
        } catch (error) {
          console.error("❌ Error creating admin user:", error)
        } finally {
          rl.close()
          await prisma.$disconnect()
        }
      })
    })
  } catch (error) {
    console.error("❌ Error:", error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

createProductionAdmin().catch((error) => {
  console.error("Error:", error)
  process.exit(1)
})
