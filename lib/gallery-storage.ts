import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cwrirmowykxajumjokjj.supabase.co"
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cmlybW93eWt4YWp1bWpva2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MDcwMTcsImV4cCI6MjA4MjE4MzAxN30.MmuI9evAbWX5jIIAIyEbaf9OolPjExqool7TcYbbCg8"
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const BUCKET_NAME = "gallery"

/**
 * Get Supabase client for server-side operations (uploads)
 * Uses service role key to bypass RLS when available
 */
function getSupabaseClient() {
  const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY
  return createClient(SUPABASE_URL, key)
}

/**
 * Get Supabase client for client-side operations (reads)
 */
function getSupabaseAnonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

/**
 * Check if gallery storage is configured
 */
export function isGalleryConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY)
}

/**
 * Media item returned from storage
 */
export interface MediaItem {
  id: string
  name: string
  mimeType: string
  kind: "image" | "video"
  createdTime: string
  url: string
  thumbnail?: string
  size?: number
}

/**
 * List all photos and videos from the gallery bucket
 */
export async function listGalleryMedia(
  limit: number = 60,
  offset: number = 0
): Promise<{ items: MediaItem[]; hasMore: boolean }> {
  const supabase = getSupabaseAnonClient()

  const { data: files, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list("", {
      limit: limit + 1, // Request one extra to check if there are more
      offset,
      sortBy: { column: "created_at", order: "desc" },
    })

  if (error) {
    console.error("List gallery error:", error)
    throw error
  }

  if (!files) {
    return { items: [], hasMore: false }
  }

  // Check if there are more items
  const hasMore = files.length > limit
  const itemsToReturn = hasMore ? files.slice(0, limit) : files

  const items = itemsToReturn
    .filter((file) => {
      // Filter out folders and non-media files
      const mimeType = file.metadata?.mimetype || ""
      return (
        mimeType.startsWith("image/") ||
        mimeType.startsWith("video/") ||
        file.name.match(/\.(jpg|jpeg|png|gif|webp|heic|heif|mp4|mov|webm|m4v)$/i)
      )
    })
    .map((file) => {
      const mimeType = file.metadata?.mimetype || getMimeTypeFromFilename(file.name)
      const kind: "image" | "video" = mimeType.startsWith("video/") ? "video" : "image"

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET_NAME).getPublicUrl(file.name)

      const item: MediaItem = {
        id: file.id || file.name,
        name: file.name,
        mimeType,
        kind,
        createdTime: file.created_at || new Date().toISOString(),
        url: publicUrl,
        thumbnail: publicUrl, // Supabase serves the image directly, can add transformation later
        size: file.metadata?.size,
      }

      return item
    })

  return { items, hasMore }
}

/**
 * Upload a file to the gallery bucket
 */
export async function uploadToGallery(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<MediaItem> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, buffer, {
      contentType: mimeType,
      upsert: false,
    })

  if (error) {
    console.error("Upload gallery error:", error)
    throw error
  }

  if (!data) {
    throw new Error("Upload failed: no data returned")
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)

  const kind: "image" | "video" = mimeType.startsWith("video/") ? "video" : "image"

  return {
    id: data.path,
    name: filename,
    mimeType,
    kind,
    createdTime: new Date().toISOString(),
    url: publicUrl,
    thumbnail: publicUrl,
    size: buffer.length,
  }
}

/**
 * Delete a file from the gallery bucket (admin only)
 */
export async function deleteGalleryMedia(path: string): Promise<void> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])

  if (error) {
    console.error("Delete gallery error:", error)
    throw error
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(path: string): string {
  const supabase = getSupabaseAnonClient()
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path)
  return publicUrl
}

/**
 * Helper: Get MIME type from filename extension
 */
function getMimeTypeFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
    mp4: "video/mp4",
    mov: "video/quicktime",
    webm: "video/webm",
    m4v: "video/x-m4v",
  }
  return mimeTypes[ext || ""] || "application/octet-stream"
}
