/**
 * Email Testing Script
 * 
 * Run this script to test your email configuration:
 * npx tsx scripts/test-email.ts
 */

// MUST load environment variables BEFORE importing anything that uses them
import { config } from "dotenv"
import { resolve } from "path"

// Load .env file from project root
config({ path: resolve(__dirname, "../.env") })

// Now import email module (it will pick up the env vars)
import { sendEmail } from "../lib/email.js"

async function testEmail() {
  console.log("🔍 Testing Email Configuration...")
  console.log("=".repeat(60))
  
  // Check environment variables
  console.log("\n📋 Configuration:")
  console.log(`  EMAIL_PROVIDER: ${process.env.EMAIL_PROVIDER || 'auto'}`)
  console.log(`  RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✓ Set' : '✗ Not set'}`)
  console.log(`  EMAIL_FROM: ${process.env.EMAIL_FROM || 'Not set'}`)
  console.log(`  AWS SES Configured: ${process.env.AWS_ACCESS_KEY_ID ? '✓ Yes' : '✗ No'}`)
  
  console.log("\n" + "=".repeat(60))
  console.log("📧 Sending test email...\n")
  
  try {
    const result = await sendEmail({
      to: "sashaplusjeff@gmail.com",
      subject: "Test Email - Wedding Platform",
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from your wedding platform.</p>
        <p>If you received this, your email configuration is working!</p>
        <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
      `,
      text: `
Test Email

This is a test email from your wedding platform.
If you received this, your email configuration is working!

Sent at: ${new Date().toISOString()}
      `,
      replyTo: "test@example.com",
    })
    
    console.log("\n" + "=".repeat(60))
    console.log("📬 Result:")
    console.log(JSON.stringify(result, null, 2))
    console.log("=".repeat(60))
    
    // Check for Resend-specific data
    if (result && 'data' in result) {
      console.log("\n✅ SUCCESS! Test email sent via Resend.")
      console.log(`   Email ID: ${result.data?.id}`)
      console.log("\n⚠️  IMPORTANT:")
      console.log("   If using Resend's sandbox domain (onboarding@resend.dev),")
      console.log("   emails only go to VERIFIED email addresses.")
      console.log("\n   To receive emails:")
      console.log("   1. Add your own domain in Resend dashboard")
      console.log("   2. Or verify sashaplusjeff@gmail.com in Resend")
      console.log("\n   Visit: https://resend.com/domains")
      console.log("\n   Check Resend dashboard for email status:")
      console.log("   https://resend.com/emails")
    } else if (result && 'messageId' in result && result.success) {
      console.log("\n✅ SUCCESS! Test email sent via AWS SES.")
      console.log(`   Message ID: ${result.messageId}`)
    } else if (result && 'success' in result && result.success !== false) {
      console.log("\n✅ Test email command executed.")
    } else {
      console.log("\n❌ FAILED to send email")
      const errorMsg = result && 'error' in result ? result.error : 'Unknown error'
      console.log(`   Error: ${errorMsg}`)
      console.log("\n   Possible issues:")
      console.log("   - Resend API key might be invalid")
      console.log("   - Using sandbox domain with unverified recipient")
      console.log("   - AWS SES permissions not configured")
    }
  } catch (error: any) {
    console.log("\n" + "=".repeat(60))
    console.log("❌ ERROR:")
    console.error(error)
    console.log("=".repeat(60))
  }
}

testEmail()
