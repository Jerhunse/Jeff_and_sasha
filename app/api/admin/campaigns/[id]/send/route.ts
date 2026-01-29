import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  sendEmail,
  generateSaveTheDateEmail,
  generateInvitationEmail,
  type InvitationEmailData,
} from "@/lib/email"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: campaignId } = await params
    const body = await req.json()
    const { guestIds, sendViaEmail = true, sendViaSMS = false } = body

    // Fetch campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        couple: true,
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    if (campaign.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Determine which guests to send to
    let targetGuestIds = guestIds

    if (!targetGuestIds || targetGuestIds.length === 0) {
      // If no specific guests, use segment rules
      if (campaign.segmentJSON) {
        const segment = JSON.parse(campaign.segmentJSON)
        const where: any = { coupleId: session.user.coupleId }

        // Apply segment filters
        if (segment.tags && segment.tags.length > 0) {
          where.tags = {
            some: {
              tagId: { in: segment.tags },
            },
          }
        }

        if (segment.rsvpStatus) {
          where.rsvpResponses = {
            some: {
              status: segment.rsvpStatus,
            },
          }
        }

        const segmentGuests = await prisma.guest.findMany({
          where,
          select: { id: true },
        })

        targetGuestIds = segmentGuests.map((g) => g.id)
      } else {
        return NextResponse.json(
          { error: "No guests specified and no segment rules defined" },
          { status: 400 }
        )
      }
    }

    // Fetch guests
    const guests = await prisma.guest.findMany({
      where: {
        id: { in: targetGuestIds },
        coupleId: session.user.coupleId,
      },
    })

    if (guests.length === 0) {
      return NextResponse.json(
        { error: "No valid guests found" },
        { status: 400 }
      )
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    }

    // Base URL for RSVP links
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

    // Update campaign status
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: "SENDING",
        totalRecipients: guests.length,
      },
    })

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
        const websiteUrl = `${baseUrl}/${campaign.couple.slug}`

        const emailData: InvitationEmailData = {
          guestFirstName: guest.firstName,
          guestLastName: guest.lastName,
          partner1Name: campaign.couple.partner1Name,
          partner2Name: campaign.couple.partner2Name,
          weddingDate: new Date(campaign.couple.weddingDate).toLocaleDateString(
            "en-US",
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          ),
          venueName: campaign.couple.venueName || undefined,
          venueCity: campaign.couple.venueCity || undefined,
          venueState: campaign.couple.venueState || undefined,
          rsvpLink,
          websiteUrl,
          primaryColor: campaign.couple.primaryColor,
          secondaryColor: campaign.couple.secondaryColor,
        }

        let emailSent = false
        let smsSent = false
        let errorMessage = null

        // Send email if requested and email exists
        if (sendViaEmail && guest.email) {
          const emailHtml = campaign.customHTML || 
            (campaign.type === "SAVE_THE_DATE"
              ? generateSaveTheDateEmail(emailData)
              : generateInvitationEmail(emailData))

          const emailSubject = campaign.subject || 
            (campaign.type === "SAVE_THE_DATE"
              ? `Save the Date - ${campaign.couple.partner1Name} & ${campaign.couple.partner2Name}`
              : `You're Invited - ${campaign.couple.partner1Name} & ${campaign.couple.partner2Name}'s Wedding`)

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

        // SMS sending would go here (Twilio integration)
        if (sendViaSMS && guest.phone) {
          // Placeholder for SMS
          smsSent = false
        }

        // Create or update invitation record
        const invitation = await prisma.invitation.upsert({
          where: {
            // Create unique constraint on campaignId + guestId if needed
            // For now, find by both fields
            campaignId_guestId: {
              campaignId,
              guestId: guest.id,
            },
          },
          create: {
            coupleId: session.user.coupleId,
            campaignId,
            guestId: guest.id,
            token: guest.inviteToken,
            status: emailSent || smsSent ? "SENT" : "FAILED",
            sentViaEmail: emailSent,
            sentViaSMS: smsSent,
            emailAddress: guest.email,
            phoneNumber: guest.phone,
            sentAt: emailSent || smsSent ? new Date() : null,
            deliveredAt: emailSent || smsSent ? new Date() : null, // Assume delivered if sent
            errorMessage,
          },
          update: {
            status: emailSent || smsSent ? "SENT" : "FAILED",
            sentViaEmail: emailSent,
            sentViaSMS: smsSent,
            sentAt: emailSent || smsSent ? new Date() : null,
            deliveredAt: emailSent || smsSent ? new Date() : null,
            errorMessage,
          },
        })

        // Log activity
        await prisma.guestActivity.create({
          data: {
            guestId: guest.id,
            action: "INVITE_SENT",
            description: `${campaign.type} sent via ${emailSent ? "email" : ""}${emailSent && smsSent ? " and " : ""}${smsSent ? "SMS" : ""}`,
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

    // Update campaign statistics
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: "SENT",
        sent: results.success,
        failed: results.failed,
        sentAt: new Date(),
      },
    })

    // Log campaign activity
    await prisma.activityLog.create({
      data: {
        coupleId: session.user.coupleId,
        actorId: session.user.id,
        action: "MESSAGE_SENT",
        entityType: "Campaign",
        entityId: campaignId,
        description: `Sent campaign "${campaign.name}" to ${results.success} guests`,
        meta: JSON.stringify({ success: results.success, failed: results.failed }),
      },
    })

    return NextResponse.json({
      message: `Sent ${results.success} invitation(s). ${results.failed} failed.`,
      results,
      campaign: await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          _count: {
            select: {
              invitations: true,
            },
          },
        },
      }),
    })
  } catch (error: any) {
    console.error("Send campaign error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to send campaign" },
      { status: 500 }
    )
  }
}

