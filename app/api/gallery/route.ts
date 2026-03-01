import { NextRequest, NextResponse } from "next/server"
import { listGalleryMedia, isGalleryConfigured } from "@/lib/gallery-storage"

/**
 * GET /api/gallery
 * Public endpoint - no authentication required
 * Lists all photos and videos from the Supabase Storage gallery bucket
 */
export async function GET(req: NextRequest) {
  try {
    // Check if Supabase Storage is configured
    if (!isGalleryConfigured()) {
      return NextResponse.json(
        {
          error: "Gallery not configured",
          message: "Please configure Supabase Storage credentials.",
        },
        { status: 503 }
      )
    }

    // Get pagination params
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "60", 10)
    const offset = parseInt(searchParams.get("offset") || "0", 10)

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "limit must be between 1 and 100" },
        { status: 400 }
      )
    }

    // Fetch from Supabase Storage
    const result = await listGalleryMedia(limit, offset)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Gallery list error:", error)

    if (error.statusCode === "404" || error.message?.includes("not found")) {
      return NextResponse.json(
        {
          error: "Bucket not found",
          message: "The gallery storage bucket does not exist.",
        },
        { status: 404 }
      )
    }

    if (error.statusCode === "403" || error.message?.includes("permission")) {
      return NextResponse.json(
        {
          error: "Permission denied",
          message: "Access to the gallery bucket is denied.",
        },
        { status: 403 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to load gallery",
        message: error.message || "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}
