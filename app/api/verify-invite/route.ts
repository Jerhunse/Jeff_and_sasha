import { NextRequest, NextResponse } from "next/server"

const INVITE_CODE = "sj2026"

/**
 * Verifies an invite code. Does NOT set wedding_access cookie; access is
 * granted only after the user completes RSVP (see RSVP APIs and grant-access).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      )
    }

    // Check if code matches (case-insensitive)
    if (code.trim().toLowerCase() !== INVITE_CODE.toLowerCase()) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error verifying invite code:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
