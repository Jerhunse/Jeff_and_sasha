"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, QrCode, Copy, Check } from "lucide-react"

interface PrintableSeatFinderQrCodeProps {
  /** The wedding slug to generate the URL */
  weddingSlug: string
  /** Couple names for display */
  partner1Name?: string
  partner2Name?: string
}

export function PrintableSeatFinderQrCode({
  weddingSlug,
  partner1Name = "",
  partner2Name = "",
}: PrintableSeatFinderQrCodeProps) {
  const [seatFinderUrl, setSeatFinderUrl] = useState("")
  const [qrSize, setQrSize] = useState(300)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSeatFinderUrl(`${window.location.origin}/${weddingSlug}/seat-finder`)
    }
  }, [weddingSlug])

  const handleDownloadSVG = () => {
    const svg = document.getElementById("seat-finder-qr-code")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${weddingSlug}-seat-finder-qr-code.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPNG = () => {
    const svg = document.getElementById("seat-finder-qr-code")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    canvas.width = qrSize * 2 // 2x for better quality
    canvas.height = qrSize * 2

    img.onload = () => {
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `${weddingSlug}-seat-finder-qr-code.png`
          link.click()
          URL.revokeObjectURL(url)
        }
      })
    }

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(seatFinderUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const coupleNames = partner1Name && partner2Name 
    ? `${partner1Name} & ${partner2Name}`
    : ""

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-gold" />
            Seat Finder QR Code
          </CardTitle>
          <CardDescription>
            Download this QR code to help guests quickly find their table assignments at your venue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Preview */}
          <div className="flex justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-center mb-4">
                <p className="font-heading text-xl text-black mb-1">
                  Find Your Seat
                </p>
                {coupleNames && (
                  <p className="font-heading text-lg text-black/70 mb-2">
                    {coupleNames}'s Wedding
                  </p>
                )}
                <p className="text-sm text-black/70 mb-4">
                  Scan to find your table assignment
                </p>
              </div>
              <QRCodeSVG
                id="seat-finder-qr-code"
                value={seatFinderUrl}
                size={qrSize}
                level="H"
                includeMargin={true}
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>
          </div>

          {/* Size Control */}
          <div className="space-y-2">
            <Label htmlFor="seat-qr-size">QR Code Size: {qrSize}px</Label>
            <Input
              id="seat-qr-size"
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
            <Label>Seat Finder URL</Label>
            <div className="flex gap-2">
              <Input
                value={seatFinderUrl}
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
            <h4 className="font-semibold text-sm">Usage Tips:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Display at venue entrance for guests to scan as they arrive</li>
              <li>Print on wedding programs or place cards</li>
              <li>Include on table number signs or menu cards</li>
              <li>Display on screens at the reception</li>
              <li>Use SVG format for best print quality at any size</li>
              <li>Minimum size: 2cm × 2cm for reliable scanning</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
