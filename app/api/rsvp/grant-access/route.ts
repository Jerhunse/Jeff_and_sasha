import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

const COOKIE_NAME = "wedding_access"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

/**
 * Sets the wedding_access cookie so the user can enter the wedding site.
 * Used after RSVP success for flows that don't go through the main RSVP API
 * (e.g. Supabase-only / email-based RSVP). Only grants access for valid
 * published wedding slugs.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const slug =
      typeof body?.slug === "string" ? body.slug.trim() : null

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      )
    }

    const couple = await prisma.couple.findFirst({
      where: { slug, isPublished: true },
    })

    if (!couple) {
      return NextResponse.json(
        { error: "Invalid or unpublished wedding" },
        { status: 404 }
      )
    }

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, "verified", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Grant access error:", error)
    return NextResponse.json(
      { error: "Failed to grant access" },
      { status: 500 }
    )
  }
}
