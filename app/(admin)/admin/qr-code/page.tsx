import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PrintableRsvpQrCode } from "@/components/wedding/printable-rsvp-qr"

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-4xl font-bold mb-2">
          RSVP QR Code
        </h1>
        <p className="text-muted-foreground">
          Download your custom QR code to include on invitations or display at your venue
        </p>
      </div>

      {/* QR Code Component */}
      <PrintableRsvpQrCode
        weddingSlug={couple.slug}
        partner1Name={couple.partner1Name}
        partner2Name={couple.partner2Name}
      />
    </div>
  )
}
