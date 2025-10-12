import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Send,
  Download,
} from "lucide-react"
import { InvitationTracker } from "@/components/admin/invitation-tracker"
import { SendInvitationsDialog } from "@/components/admin/send-invitations-dialog"
import Link from "next/link"

export default async function InvitationsPage() {
  const session = await auth()

  if (!session?.user?.weddingId) {
    redirect("/auth/signin")
  }

  // Fetch wedding with guests and invitation data
  const wedding = await prisma.wedding.findUnique({
    where: { id: session.user.weddingId },
    include: {
      guests: {
        include: {
          invitations: {
            orderBy: { createdAt: "desc" },
          },
          household: true,
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      },
    },
  })

  if (!wedding) {
    redirect("/admin")
  }

  // Calculate statistics
  const totalGuests = wedding.guests.length
  
  const saveTheDateStats = {
    sent: wedding.guests.filter((g) => g.saveTheDateSent).length,
    opened: wedding.guests.filter((g) => g.saveTheDateOpened).length,
    pending: wedding.guests.filter((g) => !g.saveTheDateSent).length,
  }

  const invitationStats = {
    sent: wedding.guests.filter((g) => g.inviteSent).length,
    opened: wedding.guests.filter((g) => g.inviteViewed).length,
    replied: wedding.guests.filter((g) => g.rsvpStatus !== "PENDING").length,
    pending: wedding.guests.filter((g) => g.rsvpStatus === "PENDING").length,
    attending: wedding.guests.filter((g) => g.rsvpStatus === "ATTENDING").length,
    declined: wedding.guests.filter((g) => g.rsvpStatus === "DECLINED").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold mb-2">Invitations</h1>
          <p className="text-muted-foreground">
            Send and track Save-the-Dates and Wedding Invitations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/api/admin/invitations/export">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Total Guests</span>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold">{totalGuests}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">STD Sent</span>
            <Send className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {saveTheDateStats.sent}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {saveTheDateStats.opened} opened
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Invites Sent</span>
            <Mail className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {invitationStats.sent}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {invitationStats.opened} opened
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">RSVP Status</span>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">
            {invitationStats.replied}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {invitationStats.attending} attending, {invitationStats.declined} declined
          </p>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Save the Date Progress</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Sent</span>
              <Badge variant="default">
                {saveTheDateStats.sent} / {totalGuests}
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(saveTheDateStats.sent / totalGuests) * 100}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Opened: {saveTheDateStats.opened}</span>
              <span>Pending: {saveTheDateStats.pending}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Invitation Progress</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Replied</span>
              <Badge variant="default">
                {invitationStats.replied} / {totalGuests}
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(invitationStats.replied / totalGuests) * 100}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Sent: {invitationStats.sent}</span>
              <span>Pending: {invitationStats.pending}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Guest Invitation Tracker */}
      <InvitationTracker guests={wedding.guests} />
    </div>
  )
}

