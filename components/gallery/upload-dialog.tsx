"use client"

import { useState, useRef } from "react"
import { X, Upload, Image as ImageIcon, Video, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

interface UploadFile {
  id: string
  file: File
  preview: string | null
  status: "pending" | "uploading" | "success" | "error"
  progress: number
  error?: string
}

interface UploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: () => void
}

export function UploadDialog({ isOpen, onClose, onUploadComplete }: UploadDialogProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    const newFiles: UploadFile[] = selectedFiles.map((file) => {
      let preview: string | null = null

      // Create preview for images
      if (file.type.startsWith("image/")) {
        preview = URL.createObjectURL(file)
      }

      return {
        id: Math.random().toString(36).substring(7),
        file,
        preview,
        status: "pending",
        progress: 0,
      }
    })

    setFiles((prev) => [...prev, ...newFiles])

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter((f) => f.id !== id)
    })
  }

  const uploadAll = async () => {
    if (files.length === 0) return

    setIsUploading(true)

    for (const uploadFile of files) {
      if (uploadFile.status !== "pending") continue

      try {
        // Update status to uploading
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: "uploading", progress: 0 } : f
          )
        )

        const formData = new FormData()
        formData.append("file", uploadFile.file)

        // Simulate progress updates (real progress requires streaming/chunked uploads)
        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id && f.progress < 90
                ? { ...f, progress: f.progress + 10 }
                : f
            )
          )
        }, 200)

        const response = await fetch("/api/gallery/upload", {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || error.error || "Upload failed")
        }

        // Success
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: "success", progress: 100 } : f
          )
        )
      } catch (error: any) {
        console.error("Upload error:", error)
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "error", error: error.message }
              : f
          )
        )
      }
    }

    setIsUploading(false)

    // Notify parent to refresh gallery
    onUploadComplete()

    // Auto-close after 2 seconds if all successful
    const allSuccess = files.every((f) => f.status === "success")
    if (allSuccess) {
      setTimeout(() => {
        handleClose()
      }, 2000)
    }
  }

  const handleClose = () => {
    // Cleanup object URLs
    files.forEach((f) => {
      if (f.preview) {
        URL.revokeObjectURL(f.preview)
      }
    })
    setFiles([])
    onClose()
  }

  const pendingCount = files.filter((f) => f.status === "pending").length
  const successCount = files.filter((f) => f.status === "success").length
  const errorCount = files.filter((f) => f.status === "error").length

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center">
      <div
        className="bg-[#1a2c2e] w-full md:max-w-2xl md:mx-4 rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Upload Photos & Videos</h2>
            <p className="text-sm text-white/60 mt-1">
              {files.length === 0
                ? "Select files to upload"
                : `${files.length} file${files.length !== 1 ? "s" : ""} selected`}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 min-h-[200px]">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#13c8ec]/20 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-[#13c8ec]" />
              </div>
              <p className="text-white/60 text-sm">No files selected</p>
              <p className="text-white/40 text-xs mt-1">
                Tap the button below to choose photos or videos
              </p>
            </div>
          ) : (
            files.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10"
              >
                {/* Thumbnail or icon */}
                <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {uploadFile.preview ? (
                    <img
                      src={uploadFile.preview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : uploadFile.file.type.startsWith("video/") ? (
                    <Video className="w-6 h-6 text-white/40" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-white/40" />
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-white/40 text-xs">
                    {(uploadFile.file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>

                  {/* Progress bar */}
                  {uploadFile.status === "uploading" && (
                    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#13c8ec] transition-all duration-300"
                        style={{ width: `${uploadFile.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Error message */}
                  {uploadFile.status === "error" && uploadFile.error && (
                    <p className="text-red-400 text-xs mt-1">{uploadFile.error}</p>
                  )}
                </div>

                {/* Status icon */}
                <div className="flex-shrink-0">
                  {uploadFile.status === "pending" && !isUploading && (
                    <button
                      onClick={() => removeFile(uploadFile.id)}
                      className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  {uploadFile.status === "uploading" && (
                    <Loader2 className="w-5 h-5 text-[#13c8ec] animate-spin" />
                  )}
                  {uploadFile.status === "success" && (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  )}
                  {uploadFile.status === "error" && (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 space-y-3">
          {/* Status summary */}
          {files.length > 0 && (successCount > 0 || errorCount > 0) && (
            <div className="flex items-center gap-4 text-sm">
              {successCount > 0 && (
                <span className="text-green-400">✓ {successCount} uploaded</span>
              )}
              {errorCount > 0 && (
                <span className="text-red-400">✗ {errorCount} failed</span>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
              id="gallery-file-input"
            />
            <label
              htmlFor="gallery-file-input"
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                isUploading
                  ? "bg-white/5 text-white/30 cursor-not-allowed"
                  : "bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              }`}
            >
              <Upload className="w-5 h-5" />
              {files.length === 0 ? "Choose Files" : "Add More"}
            </label>

            {files.length > 0 && pendingCount > 0 && (
              <button
                onClick={uploadAll}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#13c8ec] hover:bg-[#13c8ec]/90 text-[#101f22] font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload {pendingCount}
                  </>
                )}
              </button>
            )}

            {files.length > 0 && pendingCount === 0 && (
              <button
                onClick={handleClose}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#13c8ec] hover:bg-[#13c8ec]/90 text-[#101f22] font-bold text-sm transition-all"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
