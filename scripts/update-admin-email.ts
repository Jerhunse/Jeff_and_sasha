#!/usr/bin/env tsx

/**
 * Update admin user to be the owner
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function makeEmailOwner() {
  console.log("🔄 Setting up admin access for sashaplusjeff@gmail.com...\n")

  try {
    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "sashaplusjeff@gmail.com" }
    })

    if (existingUser) {
      console.log(`✅ Found existing user: ${existingUser.email}`)
      console.log(`   Current role: ${existingUser.role}`)
      
      // Update to OWNER
      const updatedUser = await prisma.user.update({
        where: { email: "sashaplusjeff@gmail.com" },
        data: {
          role: "OWNER",
          name: "Sasha and Jeff"
        }
      })
      
      console.log(`✅ Updated role to: ${updatedUser.role}\n`)
    } else {
      // Get the couple
      const couple = await prisma.couple.findFirst()
      
      if (!couple) {
        console.error("❌ No couple found")
        process.exit(1)
      }
      
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email: "sashaplusjeff@gmail.com",
          name: "Sasha and Jeff",
          role: "OWNER",
          coupleId: couple.id
        }
      })
      
      console.log(`✅ Created new OWNER user: ${newUser.email}\n`)
    }
    
    // Also remove the old admin@wedding.com user
    try {
      await prisma.user.delete({
        where: { email: "admin@wedding.com" }
      })
      console.log("✅ Removed old admin@wedding.com user\n")
    } catch (e) {
      // Ignore if doesn't exist
    }
    
    console.log("🌐 Access your admin dashboard at:")
    console.log(`   https://jeffandsasha.com/admin/rsvp-dashboard`)
    console.log(`   (or: https://wedding-platform-ebon.vercel.app/admin/rsvp-dashboard)\n`)
    console.log("🔐 To sign in:")
    console.log(`   1. Go to: https://jeffandsasha.com/auth/signin`)
    console.log(`   2. Enter email: sashaplusjeff@gmail.com`)
    console.log("   3. Check your email for the magic link")
    console.log("   4. Click the link to authenticate")
    console.log(`   5. You'll be redirected to the admin dashboard!\n`)
    console.log("✅ All set!")
    
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

makeEmailOwner()
