import { NextRequest, NextResponse } from "next/server"
import { uploadToGallery, isGalleryConfigured } from "@/lib/gallery-storage"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
]

const MAX_IMAGE_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(req: NextRequest) {
  try {
    if (!isGalleryConfigured()) {
      return NextResponse.json(
        { error: "Storage not configured" },
        { status: 503 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const sessionId = formData.get("sessionId") as string
    const order = parseInt(formData.get("order") as string, 10)

    if (!file || !sessionId || isNaN(order)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      )
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split(".").pop() || "jpg"
    const filename = `photobooth/${sessionId}/${order}-${nanoid(8)}.${ext}`

    const uploadedFile = await uploadToGallery(buffer, filename, file.type)

    const photo = await prisma.photoboothPhoto.create({
      data: {
        sessionId,
        filename: uploadedFile.name,
        url: uploadedFile.url,
        order,
      },
    })

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
    console.error("Capture upload error:", error)
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    )
  }
}
