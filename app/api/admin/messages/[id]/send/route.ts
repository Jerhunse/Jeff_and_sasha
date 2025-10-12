import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: messageId } = await params

    // Fetch message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        couple: true,
      },
    })

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    if (message.coupleId !== session.user.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Evaluate segment to get recipient list
    const segment = message.segmentJSON ? JSON.parse(message.segmentJSON) : {}
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

    if (segment.hasEmail !== undefined) {
      if (segment.hasEmail) {
        where.email = { not: null }
      } else {
        where.email = null
      }
    }

    if (segment.invitationStatus) {
      where.invitations = {
        some: {
          status: segment.invitationStatus,
        },
      }
    }

    // Fetch recipients
    const recipients = await prisma.guest.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        inviteToken: true,
      },
    })

    // Filter to only those with email
    const validRecipients = recipients.filter((r) => r.email)

    if (validRecipients.length === 0) {
      return NextResponse.json(
        { error: "No valid recipients found in segment" },
        { status: 400 }
      )
    }

    // Update message status
    await prisma.message.update({
      where: { id: messageId },
      data: {
        status: "SENDING",
        totalRecipients: validRecipients.length,
      },
    })

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

    // Send emails
    for (const recipient of validRecipients) {
      try {
        // Replace template variables
        let personalizedHTML = message.bodyHTML
          .replace(/\{\{firstName\}\}/g, recipient.firstName)
          .replace(/\{\{lastName\}\}/g, recipient.lastName)
          .replace(/\{\{rsvpLink\}\}/g, `${baseUrl}/rsvp/${recipient.inviteToken}`)
          .replace(/\{\{websiteLink\}\}/g, `${baseUrl}/${message.couple.slug}`)

        const emailResult = await sendEmail({
          to: recipient.email!,
          subject: message.subject,
          html: personalizedHTML,
          text: message.bodyText || undefined,
          from: process.env.EMAIL_FROM,
        })

        if (emailResult.success) {
          results.success++
        } else {
          results.failed++
          results.errors.push({
            recipientId: recipient.id,
            error: emailResult.error,
          })
        }
      } catch (error: any) {
        results.failed++
        results.errors.push({
          recipientId: recipient.id,
          error: error.message,
        })
      }
    }

    // Update message statistics
    await prisma.message.update({
      where: { id: messageId },
      data: {
        status: "SENT",
        sent: results.success,
        failed: results.failed,
        sentAt: new Date(),
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        coupleId: session.user.coupleId,
        actorId: session.user.id,
        action: "MESSAGE_SENT",
        entityType: "Message",
        entityId: messageId,
        description: `Sent message "${message.subject}" to ${results.success} recipients`,
        meta: JSON.stringify({ success: results.success, failed: results.failed }),
      },
    })

    return NextResponse.json({
      message: `Sent to ${results.success} recipient(s). ${results.failed} failed.`,
      results,
    })
  } catch (error: any) {
    console.error("Send message error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    )
  }
}

