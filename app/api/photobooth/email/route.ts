import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email, sessionId } = await req.json()

    if (!email || !sessionId) {
      return NextResponse.json(
        { error: "Email and session ID are required" },
        { status: 400 }
      )
    }

    const session = await prisma.photoboothSession.findUnique({
      where: { id: sessionId },
      include: {
        photos: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (session.photos.length === 0) {
      return NextResponse.json(
        { error: "No photos in this session" },
        { status: 400 }
      )
    }

    const photoLinks = session.photos
      .map((photo, idx) => `<p><a href="${photo.url}">Photo ${idx + 1}</a></p>`)
      .join("")

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              background-color: #f5f1e8;
              padding: 40px 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            h1 {
              font-family: Georgia, serif;
              color: #3d2b1f;
              font-size: 32px;
              margin-bottom: 20px;
            }
            p {
              color: #555;
              line-height: 1.6;
              margin-bottom: 15px;
            }
            a {
              color: #c05a35;
              text-decoration: none;
              font-weight: 600;
            }
            .photos {
              margin: 30px 0;
              padding: 20px;
              background: #f9f9f9;
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Your Wedding Photobooth Memories</h1>
            <p>Thank you for capturing special moments with us!</p>
            <p>Here are your photos from the photobooth session:</p>
            <div class="photos">
              ${photoLinks}
            </div>
            <p>Click each link to view and download your photos.</p>
            <p style="margin-top: 40px; color: #999; font-size: 14px;">
              With love,<br>
              Lumina Booth
            </p>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: "Lumina Booth <noreply@yourdomain.com>",
      to: email,
      subject: "Your Wedding Photobooth Photos",
      html: emailHtml,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email send error:", error)
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    )
  }
}
