import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PrintableRsvpQrCode } from "@/components/wedding/printable-rsvp-qr"
import { PrintableSeatFinderQrCode } from "@/components/wedding/printable-seat-finder-qr"
import { PrintablePhotoShareQrCode } from "@/components/wedding/printable-photo-share-qr"

export default async function AdminQrCodePage() {
  const session = await auth()

  if (!session?.user?.coupleId) {
    redirect("/auth/signin")
  }

  // Fetch couple data
  const couple = await prisma.couple.findUnique({
    where: { id: session.user.coupleId },
    select: {
      slug: true,
      partner1Name: true,
      partner2Name: true,
    },
  })

  if (!couple) {
    redirect("/admin")
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-serif text-4xl font-bold mb-2">
          QR Codes
        </h1>
        <p className="text-muted-foreground">
          Download and print QR codes for RSVP, seat finding, and photo sharing
        </p>
      </div>

      {/* RSVP QR Code */}
      <PrintableRsvpQrCode
        weddingSlug={couple.slug}
        partner1Name={couple.partner1Name}
        partner2Name={couple.partner2Name}
      />

      {/* Seat Finder QR Code */}
      <PrintableSeatFinderQrCode
        weddingSlug={couple.slug}
        partner1Name={couple.partner1Name}
        partner2Name={couple.partner2Name}
      />

      {/* Share photos QR code — links to Google Photos album */}
      <PrintablePhotoShareQrCode />
    </div>
  )
}
