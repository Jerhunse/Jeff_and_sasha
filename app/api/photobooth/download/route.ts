import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/**
 * Server-side download proxy for photobooth assets.
 *
 * Streams the file from Supabase storage with a proper
 * `Content-Disposition: attachment` header so that the browser
 * triggers a real "Save As" download. This avoids mobile Safari
 * quirks and cross-origin blob download failures (the fetch+blob
 * approach frequently fails on iOS when the origin differs).
 *
 * Usage:
 *   /api/photobooth/download?photoId=xxx           -> single photo
 *   /api/photobooth/download?sessionId=xxx&type=strip -> photo strip
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const photoId = searchParams.get("photoId")
    const sessionId = searchParams.get("sessionId")
    const type = searchParams.get("type")

    let fileUrl: string | null = null
    let downloadFilename = "photobooth.jpg"

    if (photoId) {
      const photo = await prisma.photoboothPhoto.findUnique({
        where: { id: photoId },
        select: { url: true, filename: true, order: true, sessionId: true },
      })

      if (!photo) {
        return NextResponse.json({ error: "Photo not found" }, { status: 404 })
      }

      fileUrl = photo.url
      const baseName =
        photo.filename?.split("/").pop() ||
        `photo-${photo.order + 1}.jpg`
      downloadFilename = baseName
    } else if (sessionId && type === "strip") {
      const session = await prisma.photoboothSession.findUnique({
        where: { id: sessionId },
        select: { stripUrl: true },
      })

      if (!session?.stripUrl) {
        return NextResponse.json(
          { error: "Photo strip not found" },
          { status: 404 }
        )
      }

      fileUrl = session.stripUrl
      downloadFilename = `photobooth-strip-${sessionId}.jpg`
    } else {
      return NextResponse.json(
        { error: "Missing photoId or sessionId+type" },
        { status: 400 }
      )
    }

    const upstream = await fetch(fileUrl, { cache: "no-store" })

    if (!upstream.ok || !upstream.body) {
      console.error("Photobooth download upstream error:", {
        status: upstream.status,
        url: fileUrl,
      })
      return NextResponse.json(
        { error: "Failed to retrieve file" },
        { status: 502 }
      )
    }

    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream"
    const contentLength = upstream.headers.get("content-length")

    const safeFilename = downloadFilename.replace(/[^a-zA-Z0-9._-]/g, "_")

    const headers = new Headers({
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${safeFilename}"`,
      "Cache-Control": "private, no-store",
    })
    if (contentLength) headers.set("Content-Length", contentLength)

    return new NextResponse(upstream.body, { status: 200, headers })
  } catch (error) {
    console.error("Photobooth download error:", error)
    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 }
    )
  }
}
