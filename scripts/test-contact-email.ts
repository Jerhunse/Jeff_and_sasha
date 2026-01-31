/**
 * Test Contact Form Email
 * 
 * This script tests the contact form email functionality by sending
 * a test email to sashaplusjeff@gmail.com
 * 
 * Usage: npx tsx scripts/test-contact-email.ts
 */

import * as dotenv from 'dotenv'
import { Resend } from 'resend'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') })

async function testContactEmail() {
  console.log("🧪 Testing contact form email...")
  console.log("📧 Sending test email to: sashaplusjeff@gmail.com")
  console.log("")

  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is not set in .env file")
    console.error("")
    console.error("Please add your Resend API key to the .env file:")
    console.error('RESEND_API_KEY="re_your_key_here"')
    process.exit(1)
  }

  console.log("✓ Resend API key found")
  console.log("✓ From email: " + (process.env.EMAIL_FROM || "noreply@wedding.app"))
  console.log("")

  const resend = new Resend(process.env.RESEND_API_KEY)

  const testData = {
    name: "Test Guest",
    email: "testguest@example.com",
    phone: "(555) 123-4567",
    subject: "Test Message from Wedding Website",
    message: "This is a test message to verify that contact form emails are working correctly and being delivered to sashaplusjeff@gmail.com.\n\nIf you receive this email, everything is working as expected!",
  }

  const emailSubject = `New message from ${testData.name} - Test Wedding Website`
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">
        New Message from Your Wedding Website
      </h2>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #555;">Message Details</h3>
        <p><strong>From:</strong> ${testData.name}</p>
        <p><strong>Email:</strong> ${testData.email}</p>
        ${testData.phone ? `<p><strong>Phone:</strong> ${testData.phone}</p>` : ''}
        ${testData.subject ? `<p><strong>Subject:</strong> ${testData.subject}</p>` : ''}
      </div>
      
      <div style="background-color: white; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #333;">Message</h3>
        <p style="line-height: 1.6; color: #555;">${testData.message.replace(/\n/g, '<br>')}</p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 14px;">
        <p>This message was sent from your wedding website contact form.</p>
        <p>Reply directly to this email to respond to ${testData.name}.</p>
      </div>
    </div>
  `

  const emailText = `
New Message from Your Wedding Website

From: ${testData.name}
Email: ${testData.email}
${testData.phone ? `Phone: ${testData.phone}` : ''}
${testData.subject ? `Subject: ${testData.subject}` : ''}

Message:
${testData.message}

---
This message was sent from your wedding website contact form.
Reply directly to this email to respond to ${testData.name}.
  `

  try {
    console.log("⏳ Sending email via Resend...")
    
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@wedding.app",
      to: "sashaplusjeff@gmail.com",
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      replyTo: testData.email,
    })

    if (error) {
      console.error("")
      console.error("❌ Error from Resend:", error)
      console.error("")
      console.error("🔧 Common issues:")
      console.error("   1. Domain not verified - verify your domain in Resend dashboard")
      console.error("   2. Invalid API key - check that your RESEND_API_KEY is correct")
      console.error("   3. Rate limit reached - wait a few minutes and try again")
      console.error("")
      process.exit(1)
    }

    console.log("")
    console.log("✅ Email sent successfully!")
    console.log("")
    console.log("📊 Email Details:")
    console.log("   - Message ID:", data?.id)
    console.log("   - From:", process.env.EMAIL_FROM || "noreply@wedding.app")
    console.log("   - To: sashaplusjeff@gmail.com")
    console.log("   - Reply-To: testguest@example.com")
    console.log("   - Subject:", emailSubject)
    console.log("")
    console.log("📬 Check sashaplusjeff@gmail.com for the test email.")
    console.log("   (It should arrive within 1-2 minutes)")
    console.log("")
    console.log("✨ Your contact form is configured correctly!")
    console.log("   All contact form submissions will be sent to sashaplusjeff@gmail.com")
    
  } catch (error: any) {
    console.error("")
    console.error("❌ Unexpected error:", error.message)
    console.error("")
    console.error("Full error:", error)
    process.exit(1)
  }
}

// Run the test
testContactEmail()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Test failed:", error)
    process.exit(1)
  })
