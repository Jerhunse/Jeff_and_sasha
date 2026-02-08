import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const formData = await request.formData()

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string | null
    const subject = formData.get("subject") as string | null
    const message = formData.get("message") as string

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Please fill in all required fields (name, email, and message)." },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      )
    }

    // Find wedding
    const wedding = await prisma.couple.findUnique({
      where: { slug },
    })

    if (!wedding) {
      return NextResponse.json(
        { error: "Wedding not found." },
        { status: 404 }
      )
    }

    // Create contact message in database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        coupleId: wedding.id,
        name,
        email,
        phone,
        subject,
        message,
      },
    })

    console.log(`Contact message created: ID ${contactMessage.id} from ${name} (${email})`)

    // Send email notification to the couple
    const emailSubject = subject || `New message from ${name} - ${wedding.partner1Name} & ${wedding.partner2Name} Wedding`
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">
          New Message from Your Wedding Website
        </h2>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #555;">Message Details</h3>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
        </div>
        
        <div style="background-color: white; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #333;">Message</h3>
          <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 14px;">
          <p>This message was sent from your wedding website contact form.</p>
          <p>Reply directly to this email to respond to ${name}.</p>
        </div>
      </div>
    `

    const emailText = `
New Message from Your Wedding Website

From: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
${subject ? `Subject: ${subject}` : ''}

Message:
${message}

---
This message was sent from your wedding website contact form.
Reply directly to this email to respond to ${name}.
    `

    // Send email notification
    let emailSent = false
    let emailError = null
    
    try {
      const emailResult = await sendEmail({
        to: "sashaplusjeff@gmail.com",
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
        replyTo: email,
      })
      
      if (emailResult?.success !== false) {
        emailSent = true
        console.log(`Email notification sent for contact message ID ${contactMessage.id}`)
      } else {
        emailError = (emailResult && 'error' in emailResult) ? emailResult.error : 'Unknown error'
        console.error(`Failed to send email for contact message ID ${contactMessage.id}:`, emailError)
      }
    } catch (error: any) {
      emailError = error.message
      console.error(`Exception sending email for contact message ID ${contactMessage.id}:`, error)
    }

    // Return success even if email fails (message is saved in database)
    return NextResponse.json({
      success: true,
      message: "Your message has been received. We'll get back to you soon!",
      emailSent,
      ...(emailError && { emailWarning: "Message saved but notification email may not have been delivered." })
    })
    
  } catch (error) {
    console.error("Error submitting contact form:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again or contact us directly." },
      { status: 500 }
    )
  }
}

