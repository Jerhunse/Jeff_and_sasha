import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { GuestEditForm } from "@/components/admin/guest-edit-form"

interface GuestEditPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function GuestEditPage({ params }: GuestEditPageProps) {
  const session = await auth()

  if (!session?.user?.coupleId) {
    redirect("/auth/signin")
  }

  const { id } = await params

  // Fetch the guest
  const guest = await prisma.guest.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      household: true,
    },
  })

  // Check if guest exists and belongs to the couple
  if (!guest || guest.coupleId !== session.user.coupleId) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/guests/${guest.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-serif text-4xl font-bold">
            Edit Guest
          </h1>
          <p className="text-muted-foreground">
            {guest.firstName} {guest.lastName}
          </p>
        </div>
      </div>

      <GuestEditForm guest={guest} />
    </div>
  )
}
