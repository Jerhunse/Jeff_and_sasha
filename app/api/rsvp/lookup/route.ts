import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { supabase } from "@/lib/supabase"

/** Normalize phone to digits only. For US 11-digit (1XXXXXXXXXX), use last 10 so matches work regardless of leading 1. */
function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "").trim()
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1)
  }
  return digits
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const slug = typeof body.slug === "string" ? body.slug.trim() : ""
    const email = typeof body.email === "string" ? body.email.trim() : ""
    const phone = typeof body.phone === "string" ? normalizePhone(body.phone) : ""
    const name = typeof body.name === "string" ? body.name.trim() : ""

    if (!slug) {
      return NextResponse.json(
        { error: "Wedding slug is required" },
        { status: 400 }
      )
    }
    if (!email && !phone && !name) {
      return NextResponse.json(
        { error: "Email, phone number, or name is required" },
        { status: 400 }
      )
    }

    const wedding = await prisma.couple.findUnique({
      where: { slug },
    })

    if (!wedding) {
      return NextResponse.json(
        { error: "Wedding not found" },
        { status: 404 }
      )
    }

    // 1) Look up by email when provided
    if (email) {
      const normalizedEmail = email.toLowerCase()
      const { data: supabaseRsvp, error: supabaseError } = await supabase
        .from("rsvp")
        .select("*")
        .eq("email", normalizedEmail)
        .maybeSingle()

      if (!supabaseError && supabaseRsvp) {
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

      const guestByEmail = await prisma.guest.findFirst({
        where: {
          coupleId: wedding.id,
          email: { equals: email, mode: "insensitive" },
        },
        select: {
          inviteToken: true,
          firstName: true,
          lastName: true,
          maxGuestsAllowed: true,
          phone: true,
        },
      })
      if (guestByEmail) {
        return NextResponse.json({
          found: true,
          source: "prisma",
          inviteToken: guestByEmail.inviteToken,
          firstName: guestByEmail.firstName,
          lastName: guestByEmail.lastName,
          maxGuestsAllowed: guestByEmail.maxGuestsAllowed,
          phone: guestByEmail.phone,
        })
      }
    }

    // 2) Look up by phone when provided (Supabase first, then Prisma Guest)
    if (phone) {
      // 2a) Supabase rsvp table (e.g. RSVP now flow sync)
      const { data: supabaseRows, error: supabaseError } = await supabase
        .from("rsvp")
        .select("email, first_name, last_name, phone, is_attending, number_of_guests, plus_one_first_name, plus_one_last_name")
        .not("phone", "is", null)

      if (!supabaseError && supabaseRows?.length) {
        const supabaseMatch = supabaseRows.find(
          (row) => row.phone && normalizePhone(row.phone) === phone
        )
        if (supabaseMatch) {
          return NextResponse.json({
            found: true,
            source: "supabase",
            email: supabaseMatch.email,
            firstName: supabaseMatch.first_name,
            lastName: supabaseMatch.last_name,
            isAttending: supabaseMatch.is_attending,
            numberOfGuests: supabaseMatch.number_of_guests,
            plusOneFirstName: supabaseMatch.plus_one_first_name,
            plusOneLastName: supabaseMatch.plus_one_last_name,
          })
        }
      }

      // 2b) Prisma Guest table
      const guestsWithPhone = await prisma.guest.findMany({
        where: {
          coupleId: wedding.id,
          phone: { not: null },
        },
        select: {
          inviteToken: true,
          firstName: true,
          lastName: true,
          phone: true,
          maxGuestsAllowed: true,
        },
      })
      const match = guestsWithPhone.find(
        (g) => g.phone && normalizePhone(g.phone) === phone
      )
      if (match) {
        return NextResponse.json({
          found: true,
          source: "prisma",
          inviteToken: match.inviteToken,
          firstName: match.firstName,
          lastName: match.lastName,
          maxGuestsAllowed: match.maxGuestsAllowed,
          phone: match.phone,
        })
      }
    }

    // 3) Look up by name when provided
    if (name) {
      const nameParts = name.split(/\s+/).filter(part => part.length > 0)
      
      // Build search conditions based on what was provided
      const searchConditions = []
      
      if (nameParts.length === 1) {
        // Single word: could be first name or last name
        const singleName = nameParts[0]
        searchConditions.push(
          { firstName: { contains: singleName, mode: "insensitive" } },
          { lastName: { contains: singleName, mode: "insensitive" } }
        )
      } else if (nameParts.length >= 2) {
        // Multiple words: treat as first + last name
        const firstName = nameParts[0]
        const lastName = nameParts.slice(1).join(" ")
        
        // Prioritize exact first+last match, but also allow partial matches
        searchConditions.push(
          // Exact first name + exact last name match
          {
            AND: [
              { firstName: { contains: firstName, mode: "insensitive" } },
              { lastName: { contains: lastName, mode: "insensitive" } }
            ]
          },
          // First name matches
          { firstName: { contains: firstName, mode: "insensitive" } },
          // Last name matches
          { lastName: { contains: lastName, mode: "insensitive" } },
          // Last name matches the full search query (in case they put last name first)
          { lastName: { contains: name, mode: "insensitive" } }
        )
      }

      // Search for partial matches in first name or last name
      const guestsByName = await prisma.guest.findMany({
        where: {
          coupleId: wedding.id,
          OR: searchConditions,
        },
        select: {
          inviteToken: true,
          firstName: true,
          lastName: true,
          phone: true,
          maxGuestsAllowed: true,
        },
        take: 10, // Limit to 10 results for name search
      })

      if (guestsByName.length > 0) {
        // If multiple matches, prioritize exact matches
        let prioritizedGuests = guestsByName
        
        // If we have multiple words, prioritize guests matching both first and last
        if (nameParts.length >= 2) {
          const firstName = nameParts[0].toLowerCase()
          const lastName = nameParts.slice(1).join(" ").toLowerCase()
          
          const exactMatches = guestsByName.filter(g => 
            g.firstName.toLowerCase().includes(firstName) && 
            g.lastName.toLowerCase().includes(lastName)
          )
          
          if (exactMatches.length > 0) {
            // Put exact matches first, then other matches
            const otherMatches = guestsByName.filter(g => 
              !(g.firstName.toLowerCase().includes(firstName) && 
                g.lastName.toLowerCase().includes(lastName))
            )
            prioritizedGuests = [...exactMatches, ...otherMatches]
          }
        }
        
        // If multiple matches, return all for user to choose
        return NextResponse.json({
          found: true,
          source: "prisma",
          multiple: prioritizedGuests.length > 1,
          guests: prioritizedGuests.map((g) => ({
            inviteToken: g.inviteToken,
            firstName: g.firstName,
            lastName: g.lastName,
            phone: g.phone,
            maxGuestsAllowed: g.maxGuestsAllowed,
          })),
        })
      }
    }

    return NextResponse.json(
      {
        error:
          "We couldn't find an invitation for that email, phone number, or name. You can RSVP now without a code, or contact the couple.",
        found: false,
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



