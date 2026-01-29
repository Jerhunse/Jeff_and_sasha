import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"
import { sendEmail, generateRSVPConfirmationEmail } from "@/lib/email"
import { supabase } from "@/lib/supabase"

const COOKIE_NAME = "wedding_access"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

/**
 * Create a new guest RSVP with no invite code required.
 * POST /api/rsvp/[code]/new — code is either legacy "sj2026" or wedding slug.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const codeLower = code.toLowerCase()

    const body = await req.json()

    const {
      firstName,
      lastName,
      status,
      email,
      phone,
      mealChoice,
      dietaryRestrictions,
      songRequest,
      busRequired,
      busRoute,
      message,
      plusOneCount,
      plusOneNames,
      // Legacy support
      hasPlusOne,
      plusOneName,
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "First name, last name, and email are required" },
        { status: 400 }
      )
    }

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

    // Handle legacy format or new format
    const actualPlusOneCount = plusOneCount ?? (hasPlusOne ? 1 : 0)
    const actualPlusOneNames = plusOneNames ?? (plusOneName ? [plusOneName] : [])

    // Validate plus one names if count > 0
    if (actualPlusOneCount > 0) {
      if (actualPlusOneNames.length !== actualPlusOneCount) {
        return NextResponse.json(
          { error: `Please provide names for all ${actualPlusOneCount} guest${actualPlusOneCount > 1 ? 's' : ''}` },
          { status: 400 }
        )
      }
      const missingNames = actualPlusOneNames.filter((name: string) => !name?.trim())
      if (missingNames.length > 0) {
        return NextResponse.json(
          { error: "Please provide names for all guests" },
          { status: 400 }
        )
      }
    }

    // Store plus one names as comma-separated string for backward compatibility
    const plusOneNameString = actualPlusOneCount > 0 
      ? actualPlusOneNames.filter((n: string) => n?.trim()).join(", ")
      : null

    // Resolve wedding: legacy "sj2026" → first published; otherwise code is wedding slug
    const wedding =
      codeLower === "sj2026"
        ? await prisma.couple.findFirst({
            where: { isPublished: true },
            orderBy: { createdAt: "asc" },
          })
        : await prisma.couple.findUnique({
            where: { slug: code, isPublished: true },
          })

    if (!wedding) {
      return NextResponse.json({ error: "Wedding not found" }, { status: 404 })
    }

    // Check if guest already exists by email
    const normalizedEmail = email.toLowerCase().trim()
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/6974ce6d-9584-4f07-a5a2-5f3775ab8144',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/rsvp/[code]/new/route.ts:107',message:'Checking for existing guest',data:{email:normalizedEmail,coupleId:wedding.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'K'})}).catch(()=>{});
    // #endregion
    
    let guest = await prisma.guest.findFirst({
      where: {
        coupleId: wedding.id,
        email: normalizedEmail,
      },
    })

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/6974ce6d-9584-4f07-a5a2-5f3775ab8144',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/rsvp/[code]/new/route.ts:115',message:'Guest lookup result',data:{found:!!guest,guestId:guest?.id,email:normalizedEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'L'})}).catch(()=>{});
    // #endregion

    if (guest) {
      // Update existing guest
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/6974ce6d-9584-4f07-a5a2-5f3775ab8144',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/rsvp/[code]/new/route.ts:120',message:'Updating existing guest',data:{guestId:guest.id,email:normalizedEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'M'})}).catch(()=>{});
      // #endregion
      guest = await prisma.guest.update({
        where: { id: guest.id },
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: normalizedEmail,
          phone: phone?.trim() || null,
        },
      })
    } else {
      // Create new guest
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/6974ce6d-9584-4f07-a5a2-5f3775ab8144',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/rsvp/[code]/new/route.ts:133',message:'Creating new guest',data:{email:normalizedEmail,firstName,lastName,coupleId:wedding.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'N'})}).catch(()=>{});
      // #endregion
      guest = await prisma.guest.create({
        data: {
          coupleId: wedding.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: normalizedEmail,
          phone: phone?.trim() || null,
          inviteToken: nanoid(10), // Generate a unique token for future access
          allowPlusOne: true, // Allow plus ones for shared code guests
          importSource: "shared_code",
        },
      })
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/6974ce6d-9584-4f07-a5a2-5f3775ab8144',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/rsvp/[code]/new/route.ts:144',message:'New guest created successfully',data:{guestId:guest.id,email:guest.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'O'})}).catch(()=>{});
      // #endregion
    }

    // Also save to Supabase rsvp table for compatibility
    try {
      // Parse plus one names if provided
      const plusOneNamesArray = actualPlusOneNames.filter((n: string) => n?.trim())
      const firstPlusOneName = plusOneNamesArray[0] || null
      const plusOneNameParts = firstPlusOneName ? firstPlusOneName.split(" ") : []
      const plusOneFirstName = plusOneNameParts[0] || null
      const plusOneLastName = plusOneNameParts.slice(1).join(" ") || null

      const supabaseRsvpData = {
        email: normalizedEmail,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone?.trim() || null,
        is_attending: status === "ATTENDING",
        number_of_guests: 1 + actualPlusOneCount,
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
            .eq("email", normalizedEmail)

          if (updateError) {
            console.error("Failed to update Supabase RSVP:", updateError)
          }
        } else {
          console.error("Failed to insert Supabase RSVP:", insertError)
        }
      }
    } catch (supabaseError: any) {
      // Log but don't fail the RSVP submission if Supabase write fails
      console.error("Supabase RSVP sync error:", supabaseError)
    }

    // Prepare RSVP answers JSON
    const rsvpAnswers: Record<string, any> = {}
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
      coupleId: wedding.id,
      guestId: guest.id,
      status: prismaStatus, // Use mapped Prisma enum value
      message: message || null,
      plusOneName: plusOneNameString,
      answersJSON: Object.keys(rsvpAnswers).length > 0 ? JSON.stringify(rsvpAnswers) : null,
    }

    if (existingResponse) {
      await prisma.rSVPResponse.update({
        where: { id: existingResponse.id },
        data: rsvpData,
      })
    } else {
      await prisma.rSVPResponse.create({
        data: rsvpData,
      })
    }

    // Store plus one details in notes if provided
    if (actualPlusOneCount > 0 && actualPlusOneNames.length > 0) {
      const plusOneDetails = {
        count: actualPlusOneCount,
        names: actualPlusOneNames.filter((n: string) => n?.trim()),
      }

      await prisma.guest.update({
        where: { id: guest.id },
        data: {
          notes: guest.notes
            ? `${guest.notes}\n\nAdditional Guests: ${JSON.stringify(plusOneDetails, null, 2)}`
            : `Additional Guests: ${JSON.stringify(plusOneDetails, null, 2)}`,
        },
      })
    }

    // Log activity
    await prisma.guestActivity.create({
      data: {
        guestId: guest.id,
        action: guest ? "UPDATED" : "CREATED",
        description: `RSVP submitted via shared code: ${status} (${prismaStatus})`,
      },
    })

    // Send confirmation email
    if (email) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"
        
        const websiteUrl = `${baseUrl}/${wedding.slug}`
        const rsvpLookupUrl = `${baseUrl}/rsvp/${wedding.slug}`
        
        const emailHtml = generateRSVPConfirmationEmail({
          guestFirstName: firstName,
          guestLastName: lastName,
          email: email.toLowerCase().trim(),
          partner1Name: wedding.partner1Name,
          partner2Name: wedding.partner2Name,
          weddingDate: wedding.weddingDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          websiteUrl,
          rsvpLookupUrl,
          inviteCode: guest.inviteToken || undefined,
          rsvpDetails: {
            status,
            mealChoice,
            dietaryRestrictions,
            songRequest,
            busRequired,
            busRoute,
            plusOneCount: actualPlusOneCount,
            plusOneNames: actualPlusOneNames.filter((n: string) => n?.trim()),
            message,
          },
          primaryColor: wedding.primaryColor || "#8B5CF6",
          secondaryColor: wedding.secondaryColor || "#EC4899",
        })

        await sendEmail({
          to: email.toLowerCase().trim(),
          subject: `RSVP Confirmation - ${wedding.partner1Name} & ${wedding.partner2Name}'s Wedding`,
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
      guestId: guest.id,
    })
  } catch (error: any) {
    console.error("New guest RSVP error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to submit RSVP" },
      { status: 500 }
    )
  }
}
