import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { uploadToS3, isS3Configured } from "@/lib/aws"
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

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let url: string

    // Try S3 first if configured, otherwise fall back to local storage
    if (isS3Configured()) {
      try {
        // Upload to S3
        // Use a path structure: media/{coupleId}/{filename} for organization
        const s3Key = `media/${session.user.coupleId}/${filename}`
        url = await uploadToS3({
          key: s3Key,
          body: buffer,
          contentType: file.type,
          metadata: {
            originalFilename: file.name,
            uploadedBy: session.user.id,
            coupleId: session.user.coupleId,
          },
        })
      } catch (s3Error: any) {
        console.error("S3 upload failed, falling back to local storage:", s3Error)
        // Fall through to local storage
        const uploadDir = join(process.cwd(), "public", "uploads")
        const filePath = join(uploadDir, filename)

        try {
          await writeFile(filePath, buffer)
          url = `/uploads/${filename}`
        } catch (writeError) {
          console.error("File write error:", writeError)
          return NextResponse.json(
            { error: "Failed to save file. Both S3 and local storage failed." },
            { status: 500 }
          )
        }
      }
    } else {
      // Local storage fallback
      const uploadDir = join(process.cwd(), "public", "uploads")
      const filePath = join(uploadDir, filename)

      try {
        await writeFile(filePath, buffer)
        url = `/uploads/${filename}`
      } catch (writeError) {
        console.error("File write error:", writeError)
        return NextResponse.json(
          { error: "Failed to save file. Ensure public/uploads directory exists or configure AWS_S3_BUCKET." },
          { status: 500 }
        )
      }
    }

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

