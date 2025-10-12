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
      return NextResponse.redirect(
        new URL(`/${slug}/contact?error=missing_fields`, request.url)
      )
    }

    // Find wedding
    const wedding = await prisma.couple.findUnique({
      where: { slug },
    })

    if (!wedding) {
      return NextResponse.redirect(
        new URL(`/${slug}/contact?error=not_found`, request.url)
      )
    }

    // Create contact message
    await prisma.contactMessage.create({
      data: {
        coupleId: wedding.id,
        name,
        email,
        phone,
        subject,
        message,
      },
    })

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

    try {
      await sendEmail({
        to: "sashaplusjeff@gmail.com",
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
        replyTo: email,
      })
    } catch (emailError) {
      console.error("Failed to send contact form email:", emailError)
      // Don't fail the form submission if email fails
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/${slug}/contact?success=true`, request.url)
    )
  } catch (error) {
    console.error("Error submitting contact form:", error)
    const { slug } = await params
    return NextResponse.redirect(
      new URL(`/${slug}/contact?error=server_error`, request.url)
    )
  }
}

