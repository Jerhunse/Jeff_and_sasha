import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { sendEmail, generateRSVPConfirmationEmail } from "@/lib/email"
import { supabase } from "@/lib/supabase"

const COOKIE_NAME = "wedding_access"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await req.json()

    // Find the guest
    const guest = await prisma.guest.findUnique({
      where: { inviteToken: code },
      include: {
        couple: true,
      },
    })

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 })
    }

    const {
      status,
      email,
      phone,
      message,
      confirmedGuestCount,
      guestNames,
      // Backward compatibility
      plusOneCount,
      plusOneNames,
      mealChoice,
      dietaryRestrictions,
      songRequest,
      busRequired,
      busRoute,
      hasPlusOne,
      plusOneName,
    } = body

    // Validate status
    if (!["ATTENDING", "DECLINED", "MAYBE"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Map form status values to Prisma enum values
    // Form uses: ATTENDING, DECLINED, MAYBE
    // Prisma enum: YES, NO, MAYBE
    const statusMap: Record<string, "YES" | "NO" | "MAYBE"> = {
      ATTENDING: "YES",
      DECLINED: "NO",
      MAYBE: "MAYBE",
    }
    const prismaStatus = statusMap[status] || "MAYBE"

    // Handle new format (confirmedGuestCount + guestNames) or legacy format
    let totalGuestCount: number
    let allGuestNames: string[]

    if (confirmedGuestCount && guestNames) {
      // New format: confirmed count and array of all guest names
      totalGuestCount = confirmedGuestCount
      allGuestNames = Array.isArray(guestNames) 
        ? guestNames.filter((n: string) => n?.trim())
        : []
    } else {
      // Legacy format: main guest + plus ones
      const actualPlusOneCount = plusOneCount ?? (hasPlusOne ? 1 : 0)
      const actualPlusOneNames = plusOneNames ?? (plusOneName ? [plusOneName] : [])
      totalGuestCount = 1 + actualPlusOneCount
      allGuestNames = [`${guest.firstName} ${guest.lastName}`, ...actualPlusOneNames].filter(n => n?.trim())
    }

    // Validate guest count doesn't exceed allocated amount
    if (status === "ATTENDING" && totalGuestCount > guest.maxGuestsAllowed) {
      return NextResponse.json(
        { error: `You are allocated ${guest.maxGuestsAllowed} guest${guest.maxGuestsAllowed > 1 ? 's' : ''}, but selected ${totalGuestCount}` },
        { status: 400 }
      )
    }

    // Validate minimum guest count (must be at least 1)
    if (status === "ATTENDING" && totalGuestCount < 1) {
      return NextResponse.json(
        { error: "At least 1 guest is required" },
        { status: 400 }
      )
    }

    // Validate all guest names are provided
    if (status === "ATTENDING" && allGuestNames.length !== totalGuestCount) {
      return NextResponse.json(
        { error: `Please provide names for all ${totalGuestCount} guest${totalGuestCount > 1 ? 's' : ''}` },
        { status: 400 }
      )
    }

    // Check capacity if accepting
    if (status === "ATTENDING" && guest.couple.maxCapacity) {
      const currentAttending = await prisma.rSVPResponse.count({
        where: {
          coupleId: guest.coupleId,
          status: "YES",
        },
      })

      if (currentAttending + totalGuestCount > guest.couple.maxCapacity) {
        return NextResponse.json(
          { error: "Sorry, we've reached maximum capacity" },
          { status: 400 }
        )
      }
    }

    // Store all guest names as comma-separated string (includes primary guest)
    const allGuestNamesString = allGuestNames.length > 0 
      ? allGuestNames.join(", ")
      : null

    // Update guest basic info only (fields that exist on Guest model)
    await prisma.guest.update({
      where: { id: guest.id },
      data: {
        email: email || guest.email,
        phone: phone || guest.phone,
      },
    })

    // Prepare RSVP answers JSON (for any optional fields)
    const rsvpAnswers: Record<string, any> = {
      confirmedGuestCount: totalGuestCount,
      allGuestNames: allGuestNames,
    }
    // Legacy fields (if provided)
    if (mealChoice) rsvpAnswers.mealChoice = mealChoice
    if (dietaryRestrictions) rsvpAnswers.dietaryRestrictions = dietaryRestrictions
    if (songRequest) rsvpAnswers.songRequest = songRequest
    if (busRequired) rsvpAnswers.busRequired = busRequired
    if (busRoute) rsvpAnswers.busRoute = busRoute

    // Create or update RSVP response record
    // Note: Prisma upsert doesn't support null in unique constraint where clauses
    // So we use findFirst + create/update pattern for null eventId
    const existingResponse = await prisma.rSVPResponse.findFirst({
      where: {
        guestId: guest.id,
        eventId: null, // General RSVP
      },
    })

    const rsvpData = {
      coupleId: guest.coupleId,
      guestId: guest.id,
      status: prismaStatus, // Use mapped Prisma enum value
      message: message || null,
      plusOneName: allGuestNamesString, // Store all guest names in plusOneName field
      answersJSON: Object.keys(rsvpAnswers).length > 0 ? JSON.stringify(rsvpAnswers) : null,
    }

    let createdOrUpdatedResponse
    if (existingResponse) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/6974ce6d-9584-4f07-a5a2-5f3775ab8144',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/rsvp/[code]/route.ts:145',message:'Updating existing RSVP response',data:{responseId:existingResponse.id,status:prismaStatus,guestId:guest.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      createdOrUpdatedResponse = await prisma.rSVPResponse.update({
        where: { id: existingResponse.id },
        data: rsvpData,
      })
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/6974ce6d-9584-4f07-a5a2-5f3775ab8144',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/rsvp/[code]/route.ts:150',message:'RSVP response updated successfully',data:{responseId:createdOrUpdatedResponse.id,status:createdOrUpdatedResponse.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/6974ce6d-9584-4f07-a5a2-5f3775ab8144',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/rsvp/[code]/route.ts:154',message:'Creating new RSVP response',data:{guestId:guest.id,status:prismaStatus,coupleId:guest.coupleId},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'I'})}).catch(()=>{});
      // #endregion
      createdOrUpdatedResponse = await prisma.rSVPResponse.create({
        data: rsvpData,
      })
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/6974ce6d-9584-4f07-a5a2-5f3775ab8144',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/rsvp/[code]/route.ts:159',message:'RSVP response created successfully',data:{responseId:createdOrUpdatedResponse.id,status:createdOrUpdatedResponse.status,guestId:createdOrUpdatedResponse.guestId},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'J'})}).catch(()=>{});
      // #endregion
    }

    // Also save to Supabase rsvp table for compatibility
    try {
      const guestEmail = email || guest.email
      if (guestEmail) {
        // Get first additional guest name (after primary) for legacy support
        const additionalGuests = allGuestNames.slice(1)
        const firstAdditionalName = additionalGuests[0] || null
        const additionalNameParts = firstAdditionalName ? firstAdditionalName.split(" ") : []
        const plusOneFirstName = additionalNameParts[0] || null
        const plusOneLastName = additionalNameParts.slice(1).join(" ") || null

        const supabaseRsvpData = {
          email: guestEmail.toLowerCase().trim(),
          first_name: guest.firstName,
          last_name: guest.lastName,
          phone: phone || guest.phone || null,
          is_attending: status === "ATTENDING",
          number_of_guests: totalGuestCount,
          plus_one_first_name: plusOneFirstName,
          plus_one_last_name: plusOneLastName,
        }

        // Try to insert, if duplicate email, update instead
        const { error: insertError } = await supabase
          .from("rsvp")
          .insert([supabaseRsvpData])

        if (insertError) {
          // Check if it's a duplicate email error
          if (
            insertError.code === "23505" ||
            insertError.message.includes("duplicate") ||
            insertError.message.includes("unique")
          ) {
            // Update existing record instead
            const { error: updateError } = await supabase
              .from("rsvp")
              .update(supabaseRsvpData)
              .eq("email", guestEmail.toLowerCase().trim())

            if (updateError) {
              console.error("Failed to update Supabase RSVP:", updateError)
            }
          } else {
            console.error("Failed to insert Supabase RSVP:", insertError)
          }
        }
      }
    } catch (supabaseError: any) {
      // Log but don't fail the RSVP submission if Supabase write fails
      console.error("Supabase RSVP sync error:", supabaseError)
    }

    // Store guest details in guest notes if provided
    if (allGuestNames.length > 0) {
      const guestDetails = {
        totalGuests: totalGuestCount,
        allGuestNames: allGuestNames,
        confirmedDate: new Date().toISOString(),
      }

      await prisma.guest.update({
        where: { id: guest.id },
        data: {
          notes: guest.notes
            ? `${guest.notes}\n\nRSVP Details: ${JSON.stringify(guestDetails, null, 2)}`
            : `RSVP Details: ${JSON.stringify(guestDetails, null, 2)}`,
        },
      })
    }

    // Log activity
    await prisma.guestActivity.create({
      data: {
        guestId: guest.id,
        action: "UPDATED",
        description: `RSVP status changed to ${status} (${prismaStatus})`,
      },
    })

    // Update invitation status to REPLIED if exists
    await prisma.invitation.updateMany({
      where: {
        guestId: guest.id,
        status: { in: ["SENT", "OPENED"] },
      },
      data: {
        status: "REPLIED",
      },
    })

    // Send confirmation email
    const guestEmail = email || guest.email
    if (guestEmail) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
        
        const websiteUrl = `${baseUrl}/${guest.couple.slug}`
        const rsvpLookupUrl = `${baseUrl}/rsvp/${guest.couple.slug}`
        
        // Get all guest names from RSVP response
        const rsvpResponse = await prisma.rSVPResponse.findFirst({
          where: {
            guestId: guest.id,
            eventId: null,
          },
        })
        
        // Parse answers to get confirmed guest list
        const rsvpAnswers = rsvpResponse?.answersJSON 
          ? JSON.parse(rsvpResponse.answersJSON)
          : {}
        
        const confirmedGuestNames = rsvpAnswers.allGuestNames || []
        const confirmedGuestCount = rsvpAnswers.confirmedGuestCount || totalGuestCount
        
        const emailHtml = generateRSVPConfirmationEmail({
          guestFirstName: guest.firstName,
          guestLastName: guest.lastName,
          email: guestEmail,
          partner1Name: guest.couple.partner1Name,
          partner2Name: guest.couple.partner2Name,
          weddingDate: guest.couple.weddingDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          websiteUrl,
          rsvpLookupUrl,
          inviteCode: guest.inviteToken || undefined,
          rsvpDetails: {
            status, // Keep form status for email display
            mealChoice: rsvpAnswers.mealChoice || null,
            dietaryRestrictions: rsvpAnswers.dietaryRestrictions || null,
            songRequest: rsvpAnswers.songRequest || null,
            busRequired: rsvpAnswers.busRequired || false,
            busRoute: rsvpAnswers.busRoute || null,
            plusOneCount: Math.max(0, confirmedGuestCount - 1), // Additional guests
            plusOneNames: confirmedGuestNames.slice(1), // All guests except primary
            message,
          },
          primaryColor: guest.couple.primaryColor || "#8B5CF6",
          secondaryColor: guest.couple.secondaryColor || "#EC4899",
        })

        await sendEmail({
          to: guestEmail,
          subject: `RSVP Confirmation - ${guest.couple.partner1Name} & ${guest.couple.partner2Name}'s Wedding`,
          html: emailHtml,
        })
      } catch (emailError: any) {
        // Log email error but don't fail the RSVP submission
        console.error("Failed to send RSVP confirmation email:", emailError)
      }
    }

    // Grant site access so user can enter wedding website after RSVP
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, "verified", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    })

    return NextResponse.json({
      success: true,
      message: "RSVP submitted successfully",
    })
  } catch (error: any) {
    console.error("RSVP submission error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to submit RSVP" },
      { status: 500 }
    )
  }
}

