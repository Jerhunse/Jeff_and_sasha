import { NextRequest, NextResponse } from "next/server"
import { uploadToGallery, isGalleryConfigured } from "@/lib/gallery-storage"
import { waitForNextCapture } from "@/lib/tethered-camera"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"
import sharp from "sharp"

export async function POST(req: NextRequest) {
  try {
    if (!isGalleryConfigured()) {
      return NextResponse.json(
        { error: "Storage not configured" },
        { status: 503 }
      )
    }

    const { sessionId, order, photoStyle = "color" } = await req.json()

    if (!sessionId || typeof order !== "number") {
      return NextResponse.json(
        { error: "Missing sessionId or order" },
        { status: 400 }
      )
    }

    if (photoStyle !== "color" && photoStyle !== "bw") {
      return NextResponse.json(
        { error: "Invalid photo style" },
        { status: 400 }
      )
    }

    console.log(`[Tethered Capture] Waiting for photo ${order} (session: ${sessionId})`)

    const { buffer, path: filePath } = await waitForNextCapture(30000)

    console.log(`[Tethered Capture] Got file: ${filePath} (${buffer.length} bytes)`)

    const transformer = sharp(buffer).rotate()
    if (photoStyle === "bw") {
      transformer.grayscale()
    }
    const processedBuffer = await transformer.jpeg({ quality: 92 }).toBuffer()

    const ext = "jpg"
    const filename = `photobooth/${sessionId}/${order}-${nanoid(8)}.${ext}`

    const uploadedFile = await uploadToGallery(processedBuffer, filename, "image/jpeg")

    const photo = await prisma.photoboothPhoto.create({
      data: {
        sessionId,
        filename: uploadedFile.name,
        url: uploadedFile.url,
        order,
      },
    })

    console.log(`[Tethered Capture] Photo ${order} saved: ${photo.url}`)

    return NextResponse.json(
      {
        success: true,
        file: {
          id: photo.id,
          url: photo.url,
          filename: photo.filename,
          order: photo.order,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[Tethered Capture] Error:", error)
    const message = error instanceof Error ? error.message : "Capture failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
