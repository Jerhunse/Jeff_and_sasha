import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev"

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

    const photoGrid = session.photos
      .map(
        (photo, idx) => `
          <tr>
            <td style="padding: 8px;">
              <a href="${photo.url}" target="_blank" style="display: block; text-decoration: none;">
                <img src="${photo.url}" alt="Photo ${idx + 1}" width="260" style="border-radius: 8px; display: block; width: 100%; max-width: 260px;" />
              </a>
            </td>
          </tr>`
      )
      .join("")

    const downloadPageUrl = `https://jeffandsasha.com/photobooth/download?id=${sessionId}`

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f1e8;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f1e8; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background-color: #1b2e21; padding: 30px; text-align: center;">
                      <h1 style="font-family: Georgia, serif; color: #f5f1e8; font-size: 28px; margin: 0; font-style: italic;">Lumina Booth</h1>
                      <p style="color: #e7dcc5; font-size: 13px; margin: 8px 0 0; letter-spacing: 2px; text-transform: uppercase;">Jeff & Sasha's Wedding</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="font-family: Georgia, serif; color: #3d2b1f; font-size: 24px; margin: 0 0 16px;">Your Photobooth Memories</h2>
                      <p style="color: #555; line-height: 1.6; margin: 0 0 24px;">Thank you for capturing special moments with us! Here are your photos:</p>
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: #faf8f5; border-radius: 8px; padding: 16px;">
                        ${photoGrid}
                      </table>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                        <tr>
                          <td align="center">
                            <a href="${downloadPageUrl}" target="_blank" style="display: inline-block; background-color: #c05a35; color: white; font-weight: 700; text-decoration: none; padding: 14px 40px; border-radius: 50px; font-size: 16px;">Download All Photos</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #faf8f5; padding: 20px 30px; text-align: center; border-top: 1px solid #eee;">
                      <p style="color: #a0522d; font-size: 14px; font-style: italic; font-family: Georgia, serif; margin: 0;">Memories to cherish forever</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `

    const result = await resend.emails.send({
      from: `Lumina Booth <${EMAIL_FROM}>`,
      to: email,
      subject: "Your Wedding Photobooth Photos - Jeff & Sasha",
      html: emailHtml,
    })

    console.log("[Email] Sent successfully to:", email, "Result:", result)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Email] Send error:", error)
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    )
  }
}
