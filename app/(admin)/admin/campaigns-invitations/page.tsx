import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Plus,
} from "lucide-react"
import Link from "next/link"

export default async function CampaignsInvitationsPage() {
  const session = await auth()

  if (!session?.user?.coupleId) {
    redirect("/auth/signin")
  }

  // Fetch couple with campaigns and statistics
  const couple = await prisma.couple.findUnique({
    where: { id: session.user.coupleId },
    include: {
      campaigns: {
        include: {
          _count: {
            select: {
              invitations: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      guests: {
        include: {
          invitations: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          rsvpResponses: {
            orderBy: { respondedAt: "desc" },
            take: 1,
          },
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      },
    },
  })

  if (!couple) {
    redirect("/admin")
  }

  // Calculate statistics
  const totalGuests = couple.guests.length

  const guestsWithInvitations = couple.guests.filter(
    (g) => g.invitations.length > 0
  ).length

  const guestsWithOpened = couple.guests.filter((g) =>
    g.invitations.some((i) => i.status === "OPENED" || i.status === "REPLIED")
  ).length

  const guestsWithReplied = couple.guests.filter((g) =>
    g.rsvpResponses.some((r) => r.status !== "PENDING")
  ).length

  const campaignStats = {
    total: couple.campaigns.length,
    draft: couple.campaigns.filter((c) => c.status === "DRAFT").length,
    scheduled: couple.campaigns.filter((c) => c.status === "SCHEDULED").length,
    sent: couple.campaigns.filter((c) => c.status === "SENT").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold mb-2">
            Campaigns & Invitations
          </h1>
          <p className="text-muted-foreground">
            Manage invitation campaigns and track delivery
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/api/admin/invitations/export">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
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
            <span className="text-sm font-medium">Invitations Sent</span>
            <Send className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {guestsWithInvitations}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {guestsWithOpened} opened
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">RSVP Received</span>
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
          <div className="text-3xl font-bold text-white">
            {guestsWithReplied}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalGuests - guestsWithReplied} pending
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Campaigns</span>
            <Mail className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {campaignStats.total}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {campaignStats.sent} sent, {campaignStats.draft} draft
          </p>
        </Card>
      </div>

      {/* Campaigns List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Campaigns</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {couple.campaigns.length === 0 ? (
            <Card className="p-6 col-span-2">
              <div className="text-center">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No campaigns yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first campaign to send invitations to your guests
                </p>
                <Button asChild>
                  <Link href="/admin/campaigns/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Campaign
                  </Link>
                </Button>
              </div>
            </Card>
          ) : (
            couple.campaigns.map((campaign) => (
              <Card key={campaign.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{campaign.name}</h3>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{campaign.type}</Badge>
                      <Badge
                        variant={
                          campaign.status === "SENT"
                            ? "default"
                            : campaign.status === "DRAFT"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/campaigns/${campaign.id}`}>
                      View
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Sent</p>
                    <p className="font-semibold text-lg">{campaign.sent}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Opened</p>
                    <p className="font-semibold text-lg">{campaign.opened}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Failed</p>
                    <p className="font-semibold text-lg text-red-600">
                      {campaign.failed}
                    </p>
                  </div>
                </div>

                {campaign.sentAt && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Sent {new Date(campaign.sentAt).toLocaleDateString()}
                  </p>
                )}

                {campaign.status === "DRAFT" && (
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" asChild>
                      <Link href={`/admin/campaigns/${campaign.id}/send`}>
                        <Send className="mr-2 h-4 w-4" />
                        Send Now
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/campaigns/${campaign.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Quick Links */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid gap-2 md:grid-cols-3">
          <Button variant="outline" asChild>
            <Link href="/admin/rsvp-questions">
              Manage RSVP Questions
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/guests">
              View Guest List
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/templates">
              Email Templates
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}

