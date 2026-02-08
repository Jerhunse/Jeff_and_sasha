/**
 * Simple Resend Test
 * Tests Resend directly without the wrapper
 * 
 * Run: npx tsx scripts/test-resend-direct.ts
 */

import { config } from "dotenv"
import { resolve } from "path"

// Load env vars
config({ path: resolve(__dirname, "../.env") })

import { Resend } from "resend"

async function testResendDirect() {
  console.log("🔍 Testing Resend API Directly...")
  console.log("=".repeat(60))
  
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev"
  
  console.log("\n📋 Configuration:")
  console.log(`  RESEND_API_KEY: ${apiKey ? '✓ Set (' + apiKey.substring(0, 10) + '...)' : '✗ Not set'}`)
  console.log(`  EMAIL_FROM: ${fromEmail}`)
  
  if (!apiKey) {
    console.log("\n❌ ERROR: RESEND_API_KEY not found in environment")
    process.exit(1)
  }
  
  const resend = new Resend(apiKey)
  
  console.log("\n" + "=".repeat(60))
  console.log("📧 Sending test email via Resend...\n")
  
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: ["sashaplusjeff@gmail.com"],
      subject: "Direct Resend Test - Wedding Platform",
      html: `
        <h1>Direct Resend Test</h1>
        <p>This is a direct test of the Resend API.</p>
        <p>If you received this, Resend is configured correctly!</p>
        <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
      `,
    })
    
    console.log("\n" + "=".repeat(60))
    console.log("📬 Result:")
    
    if (error) {
      console.log("\n❌ Resend API Error:")
      console.log(JSON.stringify(error, null, 2))
      console.log("\n" + "=".repeat(60))
      console.log("\nPossible issues:")
      console.log("  - Invalid API key")
      console.log("  - Sandbox domain (onboarding@resend.dev) with unverified recipient")
      console.log("  - API rate limit reached")
      console.log("\n  Visit: https://resend.com/emails to check status")
    } else if (data) {
      console.log("\n✅ SUCCESS! Email sent via Resend")
      console.log(JSON.stringify(data, null, 2))
      console.log("\n" + "=".repeat(60))
      console.log("\n⚠️  IMPORTANT:")
      console.log("   If using onboarding@resend.dev (sandbox domain),")
      console.log("   emails ONLY go to VERIFIED recipients.")
      console.log("\n   To receive this email at sashaplusjeff@gmail.com:")
      console.log("   1. Go to: https://resend.com/emails")
      console.log("   2. Find this email (ID: " + data.id + ")")
      console.log("   3. Check if it was delivered or blocked")
      console.log("\n   For production:")
      console.log("   - Add your domain: https://resend.com/domains")
      console.log("   - Update EMAIL_FROM to use your domain")
    }
  } catch (error: any) {
    console.log("\n" + "=".repeat(60))
    console.log("❌ Exception:")
    console.error(error)
    console.log("=" .repeat(60))
  }
}

testResendDirect()
