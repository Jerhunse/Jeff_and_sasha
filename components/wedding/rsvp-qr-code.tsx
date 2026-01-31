"use client"

import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode } from "lucide-react"

interface RsvpQrCodeProps {
  /** The full URL to the RSVP form */
  rsvpUrl: string
  /** Optional title to display above the QR code */
  title?: string
  /** Optional description text */
  description?: string
  /** Size of the QR code in pixels */
  size?: number
}

export function RsvpQrCode({
  rsvpUrl,
  title = "Scan to RSVP",
  description = "Point your phone's camera at this QR code to quickly access the RSVP form",
  size = 200,
}: RsvpQrCodeProps) {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="font-serif text-2xl flex items-center justify-center gap-2">
          <QrCode className="h-6 w-6 text-gold" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code */}
        <div className="flex justify-center bg-white p-6 rounded-lg">
          <QRCodeSVG
            value={rsvpUrl}
            size={size}
            level="H"
            includeMargin={true}
            fgColor="#000000"
            bgColor="#ffffff"
          />
        </div>

        {/* Description */}
        {description && (
          <p className="text-center text-sm text-muted-foreground">
            {description}
          </p>
        )}

        {/* URL Display (optional, for desktop users) */}
        <div className="pt-4 border-t">
          <p className="text-xs text-center text-muted-foreground break-all">
            Or visit: <span className="font-mono">{rsvpUrl}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
