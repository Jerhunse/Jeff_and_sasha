import { NextRequest, NextResponse } from "next/server"
import { uploadToGallery, isGalleryConfigured } from "@/lib/gallery-storage"
import { nanoid } from "nanoid"

// Supported file types
const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
]

const SUPPORTED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
]

const SUPPORTED_TYPES = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_VIDEO_TYPES]

// File size limits
const MAX_IMAGE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_VIDEO_SIZE = 250 * 1024 * 1024 // 250MB

/**
 * POST /api/gallery/upload
 * Public endpoint - no authentication required
 * Uploads a file to Google Drive folder
 */
export async function POST(req: NextRequest) {
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

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!SUPPORTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Unsupported file type",
          message: `Supported formats: ${SUPPORTED_TYPES.join(", ")}`,
          received: file.type,
        },
        { status: 400 }
      )
    }

    // Validate file size based on type
    const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type)
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
    const maxSizeMB = Math.round(maxSize / (1024 * 1024))

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "File too large",
          message: `Maximum size for ${isVideo ? "videos" : "images"} is ${maxSizeMB}MB`,
          fileSize: file.size,
          maxSize,
        },
        { status: 400 }
      )
    }

    // Get file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename to prevent conflicts
    const ext = file.name.split(".").pop() || "jpg"
    const baseName = file.name.replace(`.${ext}`, "")
    const uniqueFilename = `${baseName}-${nanoid(8)}.${ext}`

    // Upload to Supabase Storage
    const uploadedFile = await uploadToGallery(buffer, uniqueFilename, file.type)

    return NextResponse.json(
      {
        success: true,
        file: uploadedFile,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Gallery upload error:", error)

    // Handle specific Supabase errors
    if (error.statusCode === "403" || error.message?.includes("permission")) {
      return NextResponse.json(
        {
          error: "Permission denied",
          message: "Cannot upload to storage bucket. Check bucket permissions.",
        },
        { status: 403 }
      )
    }

    if (error.statusCode === "404" || error.message?.includes("not found")) {
      return NextResponse.json(
        {
          error: "Bucket not found",
          message: "The gallery storage bucket does not exist.",
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        error: "Upload failed",
        message: error.message || "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}
