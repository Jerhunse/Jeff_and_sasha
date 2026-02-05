import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin access
    if (session.user.role !== "OWNER" && session.user.role !== "COLLABORATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { to, subject, body: emailBody, guestName, coupleId } = body

    if (!to || !subject || !emailBody || !coupleId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify user has access to this couple
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coupleId: true }
    })

    if (user?.coupleId !== coupleId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get couple info for email customization
    const couple = await prisma.couple.findUnique({
      where: { id: coupleId },
      select: {
        partner1Name: true,
        partner2Name: true,
        primaryColor: true,
        secondaryColor: true,
        slug: true
      }
    })

    if (!couple) {
      return NextResponse.json({ error: "Wedding not found" }, { status: 404 })
    }

    // Create HTML email with styling
    const htmlEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Georgia, serif;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
    }
    .header {
      background: linear-gradient(135deg, ${couple.primaryColor} 0%, ${couple.secondaryColor} 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 400;
      letter-spacing: 2px;
    }
    .content {
      padding: 40px 30px;
    }
    .content p {
      font-size: 16px;
      color: #555;
      line-height: 1.6;
      margin: 16px 0;
      white-space: pre-wrap;
    }
    .footer {
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #888;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${couple.partner1Name} & ${couple.partner2Name}</h1>
    </div>
    
    <div class="content">
      ${emailBody.split('\n').map((line: string) => `<p>${line || '&nbsp;'}</p>`).join('')}
    </div>
    
    <div class="footer">
      <p>This email was sent from ${couple.partner1Name} & ${couple.partner2Name}'s wedding platform.</p>
      <p style="margin-top: 10px;">
        <a href="${process.env.NEXTAUTH_URL}/${couple.slug}" style="color: ${couple.primaryColor}; text-decoration: none;">
          Visit Wedding Website
        </a>
      </p>
    </div>
  </div>
</body>
</html>
    `

    // Send email
    const result = await sendEmail({
      to,
      subject,
      html: htmlEmail,
      text: emailBody,
      from: process.env.EMAIL_FROM || "noreply@wedding.app",
      replyTo: process.env.EMAIL_FROM || "noreply@wedding.app"
    })

    if (!result.success) {
      return NextResponse.json(
        { error: "error" in result ? result.error : "Failed to send email" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: "Email sent successfully" })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
