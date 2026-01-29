import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  sendEmail,
  generateSaveTheDateEmail,
  generateInvitationEmail,
  generateSaveTheDateSMS,
  generateInvitationSMS,
  type InvitationEmailData,
} from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { guestIds, type, sendViaEmail, sendViaSMS } = body

    if (!guestIds || !Array.isArray(guestIds) || guestIds.length === 0) {
      return NextResponse.json(
        { error: "Guest IDs are required" },
        { status: 400 }
      )
    }

    if (!["SAVE_THE_DATE", "INVITATION"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    // Fetch wedding details
    const wedding = await prisma.couple.findUnique({
      where: { id: session.user.coupleId },
    })

    if (!wedding) {
      return NextResponse.json({ error: "Wedding not found" }, { status: 404 })
    }

    // Fetch guests
    const guests = await prisma.guest.findMany({
      where: {
        id: { in: guestIds },
        coupleId: session.user.coupleId,
      },
    })

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    }

    // Generate base URL for RSVP links
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

    for (const guest of guests) {
      try {
        // Skip if no contact info
        if (!guest.email && !guest.phone) {
          results.failed++
          results.errors.push({
            guestId: guest.id,
            error: "No email or phone number",
          })
          continue
        }

        const rsvpLink = `${baseUrl}/rsvp/${guest.inviteToken}`
        const websiteUrl = `${baseUrl}/${wedding.slug}`

        const emailData: InvitationEmailData = {
          guestFirstName: guest.firstName,
          guestLastName: guest.lastName,
          partner1Name: wedding.partner1Name,
          partner2Name: wedding.partner2Name,
          weddingDate: new Date(wedding.weddingDate).toLocaleDateString(
            "en-US",
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          ),
          venueName: wedding.venueName || undefined,
          venueCity: wedding.venueCity || undefined,
          venueState: wedding.venueState || undefined,
          rsvpLink,
          websiteUrl,
          primaryColor: wedding.primaryColor,
          secondaryColor: wedding.secondaryColor,
        }

        let emailSent = false
        let smsSent = false
        let errorMessage = null

        // Send email if requested and email exists
        if (sendViaEmail && guest.email) {
          const emailHtml =
            type === "SAVE_THE_DATE"
              ? generateSaveTheDateEmail(emailData)
              : generateInvitationEmail(emailData)

          const emailSubject =
            type === "SAVE_THE_DATE"
              ? `Save the Date - ${wedding.partner1Name} & ${wedding.partner2Name}`
              : `You're Invited - ${wedding.partner1Name} & ${wedding.partner2Name}'s Wedding`

          const emailResult = await sendEmail({
            to: guest.email,
            subject: emailSubject,
            html: emailHtml,
            from: process.env.EMAIL_FROM,
          })

          if (emailResult.success) {
            emailSent = true
          } else {
            errorMessage = "error" in emailResult ? emailResult.error : "Failed to send email"
          }
        }

        // Send SMS if requested and phone exists
        // Note: Twilio integration would go here
        if (sendViaSMS && guest.phone) {
          // For now, we'll mark it as "not implemented"
          // In production, integrate with Twilio:
          // const smsMessage = type === 'SAVE_THE_DATE'
          //   ? generateSaveTheDateSMS({...})
          //   : generateInvitationSMS({...})
          // await twilioClient.messages.create({...})

          // Placeholder for SMS
          smsSent = false
        }

        // Create invitation record
        const invitation = await prisma.invitation.create({
          data: {
            coupleId: session.user.coupleId,
            guestId: guest.id,
            status: emailSent || smsSent ? "SENT" : "FAILED",
            sentViaEmail: emailSent,
            emailAddress: guest.email,
            sentAt: emailSent || smsSent ? new Date() : null,
            sentViaSMS: smsSent,
            phoneNumber: guest.phone,
            errorMessage,
            metadata: JSON.stringify({ inviteLink: rsvpLink, type }),
          },
        })

        // Note: Guest model doesn't have saveTheDateSent/inviteSent fields
        // Invitation tracking is handled via the Invitation model
        
        // Log activity
        await prisma.guestActivity.create({
          data: {
            guestId: guest.id,
            action: "INVITE_SENT",
            description: `${type === "SAVE_THE_DATE" ? "Save the Date" : "Invitation"} sent via ${emailSent ? "email" : ""}${emailSent && smsSent ? " and " : ""}${smsSent ? "SMS" : ""}`,
            userId: session.user.id,
            userName: session.user.name || undefined,
          },
        })

        if (emailSent || smsSent) {
          results.success++
        } else {
          results.failed++
          results.errors.push({
            guestId: guest.id,
            error: errorMessage || "Failed to send",
          })
        }
      } catch (error: any) {
        results.failed++
        results.errors.push({
          guestId: guest.id,
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      message: `Sent ${results.success} invitation(s). ${results.failed} failed.`,
      results,
    })
  } catch (error: any) {
    console.error("Send invitations error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to send invitations" },
      { status: 500 }
    )
  }
}

