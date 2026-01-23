import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { email, slug } = await req.json()

    if (!email || !slug) {
      return NextResponse.json(
        { error: "Email and wedding slug are required" },
        { status: 400 }
      )
    }

    // Find the wedding by slug
    const wedding = await prisma.couple.findUnique({
      where: { slug },
    })

    if (!wedding) {
      return NextResponse.json(
        { error: "Wedding not found" },
        { status: 404 }
      )
    }

    // First, check Supabase RSVP table (new system)
    const normalizedEmail = email.trim().toLowerCase()
    const { data: supabaseRsvp, error: supabaseError } = await supabase
      .from("rsvp")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle()

    // If found in Supabase (no error and data exists)
    if (!supabaseError && supabaseRsvp) {
      // Found in Supabase - return RSVP data with a flag
      return NextResponse.json({
        found: true,
        source: "supabase",
        email: supabaseRsvp.email,
        firstName: supabaseRsvp.first_name,
        lastName: supabaseRsvp.last_name,
        isAttending: supabaseRsvp.is_attending,
        numberOfGuests: supabaseRsvp.number_of_guests,
        plusOneFirstName: supabaseRsvp.plus_one_first_name,
        plusOneLastName: supabaseRsvp.plus_one_last_name,
      })
    }

    // If not found in Supabase, check Prisma Guest table (old system)
    const guest = await prisma.guest.findFirst({
      where: {
        coupleId: wedding.id,
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: {
        inviteToken: true,
        firstName: true,
        lastName: true,
      },
    })

    if (guest) {
      // Found in Prisma - return invite token
      return NextResponse.json({
        found: true,
        source: "prisma",
        inviteToken: guest.inviteToken,
        firstName: guest.firstName,
        lastName: guest.lastName,
      })
    }

    // Not found in either system
    return NextResponse.json(
      { 
        error: "We couldn't find an RSVP for that email address. Please check your email for your unique RSVP link, or contact the couple.",
        found: false 
      },
      { status: 404 }
    )
  } catch (error: any) {
    console.error("RSVP lookup error:", error)
    return NextResponse.json(
      { error: "Failed to lookup invitation" },
      { status: 500 }
    )
  }
}



