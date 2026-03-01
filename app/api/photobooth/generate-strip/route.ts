import { NextRequest, NextResponse } from "next/server"
import { uploadToGallery, isGalleryConfigured } from "@/lib/gallery-storage"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"
import sharp from "sharp"

export async function POST(req: NextRequest) {
  try {
    console.log("[Generate Strip] Starting...")
    
    if (!isGalleryConfigured()) {
      console.error("[Generate Strip] Storage not configured")
      return NextResponse.json(
        { error: "Storage not configured" },
        { status: 503 }
      )
    }

    const { sessionId } = await req.json()
    console.log("[Generate Strip] Session ID:", sessionId)

    if (!sessionId) {
      console.error("[Generate Strip] Missing sessionId")
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      )
    }

    // Get all photos for this session
    const photos = await prisma.photoboothPhoto.findMany({
      where: { sessionId },
      orderBy: { order: "asc" },
    })

    console.log("[Generate Strip] Found photos:", photos.length)

    if (photos.length !== 4) {
      console.error("[Generate Strip] Wrong number of photos:", photos.length)
      return NextResponse.json(
        { error: `Session must have exactly 4 photos, found ${photos.length}` },
        { status: 400 }
      )
    }

    // Download all photos
    console.log("[Generate Strip] Downloading photos...")
    const photoBuffers = await Promise.all(
      photos.map(async (photo, index) => {
        console.log(`[Generate Strip] Fetching photo ${index + 1}:`, photo.url)
        const response = await fetch(photo.url)
        if (!response.ok) {
          throw new Error(`Failed to fetch photo ${index + 1}: ${photo.url}`)
        }
        return Buffer.from(await response.arrayBuffer())
      })
    )
    console.log("[Generate Strip] All photos downloaded")

    // Create photostrip layout
    const STRIP_WIDTH = 800
    const PHOTO_WIDTH = 700
    const PHOTO_HEIGHT = 525 // 4:3 aspect ratio
    const PADDING = 50
    const HEADER_HEIGHT = 120
    const FOOTER_HEIGHT = 100
    const PHOTO_SPACING = 30
    const TOTAL_HEIGHT =
      HEADER_HEIGHT +
      PADDING +
      PHOTO_HEIGHT * 4 +
      PHOTO_SPACING * 3 +
      PADDING +
      FOOTER_HEIGHT

    // Process photos to fit the dimensions
    console.log("[Generate Strip] Processing photos...")
    const processedPhotos = await Promise.all(
      photoBuffers.map((buffer, index) => {
        console.log(`[Generate Strip] Processing photo ${index + 1}`)
        return sharp(buffer)
          .resize(PHOTO_WIDTH, PHOTO_HEIGHT, {
            fit: "cover",
            position: "center",
          })
          .toBuffer()
      })
    )
    console.log("[Generate Strip] Photos processed")

    // Create header with text
    const headerSvg = `
      <svg width="${STRIP_WIDTH}" height="${HEADER_HEIGHT}">
        <rect width="${STRIP_WIDTH}" height="${HEADER_HEIGHT}" fill="white"/>
        <text x="${STRIP_WIDTH / 2}" y="50" font-family="Georgia, serif" font-size="36" font-style="italic" fill="#3d2b1f" text-anchor="middle">
          Lumina Booth
        </text>
        <text x="${STRIP_WIDTH / 2}" y="85" font-family="Arial, sans-serif" font-size="14" fill="#a0522d" text-anchor="middle" letter-spacing="2">
          ${new Date().toLocaleDateString().toUpperCase()}
        </text>
      </svg>
    `

    // Create footer with text
    const footerSvg = `
      <svg width="${STRIP_WIDTH}" height="${FOOTER_HEIGHT}">
        <rect width="${STRIP_WIDTH}" height="${FOOTER_HEIGHT}" fill="white"/>
        <text x="${STRIP_WIDTH / 2}" y="50" font-family="Georgia, serif" font-size="22" font-style="italic" fill="#a0522d" text-anchor="middle">
          Memories to cherish forever
        </text>
      </svg>
    `

    const headerBuffer = Buffer.from(headerSvg)
    const footerBuffer = Buffer.from(footerSvg)

    // Compose the strip
    const compositeImages: Array<{ input: Buffer; top: number; left: number }> = []

    // Add header
    compositeImages.push({
      input: headerBuffer,
      top: 0,
      left: 0,
    })

    // Add photos
    const photoLeft = (STRIP_WIDTH - PHOTO_WIDTH) / 2
    let currentY = HEADER_HEIGHT + PADDING

    for (let i = 0; i < processedPhotos.length; i++) {
      compositeImages.push({
        input: processedPhotos[i],
        top: currentY,
        left: photoLeft,
      })
      currentY += PHOTO_HEIGHT + PHOTO_SPACING
    }

    // Add footer
    compositeImages.push({
      input: footerBuffer,
      top: TOTAL_HEIGHT - FOOTER_HEIGHT,
      left: 0,
    })

    // Create the final composite
    console.log("[Generate Strip] Creating composite image...")
    const stripBuffer = await sharp({
      create: {
        width: STRIP_WIDTH,
        height: TOTAL_HEIGHT,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .composite(compositeImages)
      .jpeg({ quality: 92 })
      .toBuffer()

    console.log("[Generate Strip] Composite created, size:", stripBuffer.length)

    // Upload to Supabase
    const filename = `photobooth/${sessionId}/strip-${nanoid(8)}.jpg`
    console.log("[Generate Strip] Uploading to:", filename)
    const uploadedFile = await uploadToGallery(
      stripBuffer,
      filename,
      "image/jpeg"
    )

    console.log("[Generate Strip] Uploaded successfully:", uploadedFile.url)

    // Update session with strip URL
    await prisma.photoboothSession.update({
      where: { id: sessionId },
      data: { stripUrl: uploadedFile.url },
    })

    console.log("[Generate Strip] Session updated with strip URL")

    return NextResponse.json(
      {
        success: true,
        stripUrl: uploadedFile.url,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Generate Strip] Error:", error)
    console.error("[Generate Strip] Stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { 
        error: "Failed to generate photostrip",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
