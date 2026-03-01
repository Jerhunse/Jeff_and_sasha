"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Image as ImageIcon, Copy, Check } from "lucide-react"

export function PrintableGalleryQrCode() {
  const [galleryUrl, setGalleryUrl] = useState("")
  const [qrSize, setQrSize] = useState(300)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setGalleryUrl(`${window.location.origin}/gallery`)
    }
  }, [])

  const handleDownloadSVG = () => {
    const svg = document.getElementById("gallery-qr-code")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `wedding-gallery-qr-code.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPNG = () => {
    const svg = document.getElementById("gallery-qr-code")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    canvas.width = qrSize * 2
    canvas.height = qrSize * 2

    img.onload = () => {
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `wedding-gallery-qr-code.png`
          link.click()
          URL.revokeObjectURL(url)
        }
      })
    }

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(galleryUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-6 w-6 text-gold" />
          Guest Photo Gallery QR Code
        </CardTitle>
        <CardDescription>
          Guests scan this QR code to view and upload wedding photos/videos to your shared gallery
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code Preview */}
        <div className="flex justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-center mb-4">
              <p className="font-heading text-2xl text-black mb-2">
                Wedding Gallery
              </p>
              <p className="text-sm text-black/70 mb-4">
                Scan to share your photos
              </p>
            </div>
            <QRCodeSVG
              id="gallery-qr-code"
              value={galleryUrl}
              size={qrSize}
              level="H"
              includeMargin={true}
              fgColor="#000000"
              bgColor="#ffffff"
            />
            <div className="text-center mt-4">
              <p className="text-xs text-black/50 font-mono">
                {galleryUrl.replace("https://", "").replace("http://", "")}
              </p>
            </div>
          </div>
        </div>

        {/* Size Control */}
        <div className="space-y-2">
          <Label htmlFor="gallery-qr-size">QR Code Size: {qrSize}px</Label>
          <Input
            id="gallery-qr-size"
            type="range"
            min="200"
            max="600"
            step="50"
            value={qrSize}
            onChange={(e) => setQrSize(Number(e.target.value))}
            className="cursor-pointer"
          />
        </div>

        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleDownloadSVG} className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download SVG
          </Button>
          <Button onClick={handleDownloadPNG} variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download PNG
          </Button>
        </div>

        {/* URL Display */}
        <div className="space-y-2 pt-4 border-t">
          <Label>Gallery URL</Label>
          <div className="flex gap-2">
            <Input
              value={galleryUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              onClick={handleCopyUrl}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">Gallery Features:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>No authentication required - anyone with QR code can access</li>
            <li>Guests can view all uploaded photos and videos</li>
            <li>Guests can upload their own photos directly from their phone</li>
            <li>All files are stored in your Google Drive folder</li>
            <li>Mobile-optimized UI with masonry grid layout</li>
            <li>Supports images (JPG, PNG, HEIC, WebP) and videos (MP4, MOV)</li>
          </ul>
        </div>

        {/* Important Note */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
          <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-200 mb-2">
            Setup Required:
          </h4>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Make sure you&apos;ve completed the Google Drive setup steps in{" "}
            <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded text-xs">
              GOOGLE_DRIVE_SETUP.md
            </code>{" "}
            before sharing this QR code with guests.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
