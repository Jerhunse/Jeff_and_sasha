import { NextRequest, NextResponse } from "next/server"
import { redirect } from "next/navigation"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      // User denied access
      return redirect("/admin/guests/import/google?error=access_denied")
    }

    if (!code || !state) {
      return redirect("/admin/guests/import/google?error=invalid_request")
    }

    // Decode state
    const stateData = JSON.parse(Buffer.from(state, "base64").toString())

    // Exchange code for access token
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 
      `${process.env.NEXTAUTH_URL}/api/admin/guests/import/google/callback`

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error("Token exchange error:", errorData)
      return redirect("/admin/guests/import/google?error=token_exchange_failed")
    }

    const { access_token, refresh_token } = await tokenResponse.json()

    // Store token temporarily (in production, use Redis or session)
    // For now, pass as URL parameter (not secure for production!)
    const tokenParam = Buffer.from(access_token).toString("base64url")

    return redirect(`/admin/guests/import/google?token=${tokenParam}`)
  } catch (error: any) {
    console.error("Google callback error:", error)
    return redirect("/admin/guests/import/google?error=server_error")
  }
}

