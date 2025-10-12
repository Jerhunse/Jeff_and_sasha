import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { writeFile } from "fs/promises"
import { join } from "path"
import { nanoid } from "nanoid"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP allowed." },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      )
    }

    // Generate unique filename
    const ext = file.name.split(".").pop()
    const filename = `${nanoid()}.${ext}`

    // For now, save to public/uploads directory
    // In production, upload to S3/R2
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = join(process.cwd(), "public", "uploads")
    const filePath = join(uploadDir, filename)

    // Note: This requires the uploads directory to exist
    // In production, use proper cloud storage (S3, R2, Uploadcare, etc.)
    try {
      await writeFile(filePath, buffer)
    } catch (writeError) {
      console.error("File write error:", writeError)
      return NextResponse.json(
        { error: "Failed to save file. Ensure public/uploads directory exists or configure cloud storage." },
        { status: 500 }
      )
    }

    const url = `/uploads/${filename}`

    // Return the URL to be used in the media POST endpoint
    return NextResponse.json({
      url,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}

