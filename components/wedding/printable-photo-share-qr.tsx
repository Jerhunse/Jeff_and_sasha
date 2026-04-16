"use client"

import { useEffect, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Camera, Copy, Check } from "lucide-react"

const ENV_PHOTO_SHARE_URL = process.env.NEXT_PUBLIC_PHOTO_SHARE_URL || ""

interface PrintablePhotoShareQrCodeProps {
  /** Google Photos (or other) album URL for guests to share photos. Override via NEXT_PUBLIC_PHOTO_SHARE_URL env. */
  photoShareUrl?: string
}

export function PrintablePhotoShareQrCode({ photoShareUrl }: PrintablePhotoShareQrCodeProps) {
  const [qrSize, setQrSize] = useState(300)
  const [copied, setCopied] = useState(false)
  const [resolvedPhotoShareUrl, setResolvedPhotoShareUrl] = useState(photoShareUrl || ENV_PHOTO_SHARE_URL)

  useEffect(() => {
    if (photoShareUrl) {
      setResolvedPhotoShareUrl(photoShareUrl)
      return
    }

    if (ENV_PHOTO_SHARE_URL) {
      setResolvedPhotoShareUrl(ENV_PHOTO_SHARE_URL)
      return
    }

    if (typeof window !== "undefined") {
      setResolvedPhotoShareUrl(`${window.location.origin}/gallery`)
    }
  }, [photoShareUrl])

  const handleDownloadSVG = () => {
    const svg = document.getElementById("printable-photo-share-qr-code")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "wedding-share-photos-qr-code.svg"
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPNG = () => {
    const svg = document.getElementById("printable-photo-share-qr-code")
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
          link.download = "wedding-share-photos-qr-code.png"
          link.click()
          URL.revokeObjectURL(url)
        }
      })
    }

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(resolvedPhotoShareUrl)
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
          <Camera className="h-6 w-6 text-gold" />
          Share Your Photos & Videos
        </CardTitle>
        <CardDescription>
          Print this QR code and display it at your wedding so guests can scan and add their photos and videos to your shared album
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-center mb-4">
              <p className="font-heading text-2xl text-black mb-2">
                Share your photos
              </p>
              <p className="text-sm text-black/70 mb-4">
                Scan to add photos & videos to our album
              </p>
            </div>
            <QRCodeSVG
              id="printable-photo-share-qr-code"
              value={resolvedPhotoShareUrl}
              size={qrSize}
              level="H"
              includeMargin={true}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="photo-qr-size">QR Code Size: {qrSize}px</Label>
          <Input
            id="photo-qr-size"
            type="range"
            min="200"
            max="600"
            step="50"
            value={qrSize}
            onChange={(e) => setQrSize(Number(e.target.value))}
            className="cursor-pointer"
          />
        </div>

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

        <div className="space-y-2 pt-4 border-t">
          <Label>Photo share link</Label>
          <div className="flex gap-2">
            <Input
              value={resolvedPhotoShareUrl}
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

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">Print tips</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Use SVG for best print quality at any size</li>
            <li>Print on cardstock and place near the dance floor or photo booth</li>
            <li>Test the QR code with your phone before printing</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
