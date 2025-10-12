import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

/**
 * Google OAuth Integration for Contacts Import
 * 
 * Setup required:
 * 1. Create OAuth 2.0 credentials in Google Cloud Console
 * 2. Add to .env:
 *    GOOGLE_CLIENT_ID=
 *    GOOGLE_CLIENT_SECRET=
 *    GOOGLE_REDIRECT_URI=http://localhost:3000/api/admin/guests/import/google/callback
 * 3. Enable Google People API
 */

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 
      `${process.env.NEXTAUTH_URL}/api/admin/guests/import/google/callback`

    if (!clientId) {
      return NextResponse.json(
        { error: "Google OAuth not configured. Please set GOOGLE_CLIENT_ID in environment variables." },
        { status: 500 }
      )
    }

    // Build Google OAuth URL
    const scope = "https://www.googleapis.com/auth/contacts.readonly"
    const state = JSON.stringify({
      coupleId: session.user.coupleId,
      userId: session.user.id,
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope,
      state: Buffer.from(state).toString("base64"),
      access_type: "offline",
      prompt: "consent",
    })}`

    return NextResponse.json({ authUrl })
  } catch (error: any) {
    console.error("Google auth error:", error)
    return NextResponse.json(
      { error: "Failed to initiate Google authorization" },
      { status: 500 }
    )
  }
}

