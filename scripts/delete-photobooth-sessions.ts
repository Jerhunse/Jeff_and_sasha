#!/usr/bin/env tsx

import { PrismaClient } from "@prisma/client"
import { deleteGalleryMediaBatch, isGalleryConfigured } from "@/lib/gallery-storage"

const prisma = new PrismaClient()

async function deleteAllPhotoboothSessions() {
  console.log("🗑️  Deleting all photobooth session galleries...\n")

  try {
    const sessions = await prisma.photoboothSession.findMany({
      include: { photos: true },
      orderBy: { createdAt: "desc" },
    })

    const sessionCount = sessions.length
    const photoCount = sessions.reduce((sum, s) => sum + s.photos.length, 0)

    if (sessionCount === 0) {
      console.log("No session galleries to delete.")
      return
    }

    console.log(`Found ${sessionCount} session(s) with ${photoCount} photo(s) total.\n`)

    if (isGalleryConfigured()) {
      console.log("1️⃣  Deleting files from storage...")
      const paths: string[] = []
      for (const session of sessions) {
        for (const photo of session.photos) {
          paths.push(photo.filename)
        }
        if (session.stripUrl) {
          const path = extractStoragePathFromUrl(session.stripUrl)
          if (path) paths.push(path)
        }
      }
      await deleteGalleryMediaBatch(paths)
      console.log(`   ✓ Deleted ${paths.length} file(s) from storage\n`)
    } else {
      console.log("1️⃣  Storage not configured, skipping file deletion\n")
    }

    console.log("2️⃣  Deleting sessions from database...")
    const result = await prisma.photoboothSession.deleteMany({})
    console.log(`   ✓ Deleted ${result.count} session(s) (photos cascade-deleted)\n`)

    console.log("✅ All photobooth session galleries deleted successfully!")
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

function extractStoragePathFromUrl(url: string): string | null {
  const match = url.match(/\/object\/public\/gallery\/(.+)$/)
  return match ? match[1] : null
}

deleteAllPhotoboothSessions()
