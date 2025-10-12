import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { KPITiles } from "@/components/admin/kpi-tiles"
import { ActivityFeed } from "@/components/admin/activity-feed"
import { RsvpTrendChart } from "@/components/admin/charts/rsvp-trend-chart"
import { MealDistributionChart } from "@/components/admin/charts/meal-distribution-chart"
import { Mail, Users, Calendar, Settings, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function AdminOverviewPage() {
  const session = await auth()

  if (!session?.user?.coupleId) {
    redirect("/auth/signin")
  }

  // Fetch analytics data
  const response = await fetch(
    `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/admin/analytics`,
    {
      headers: {
        cookie: `next-auth.session-token=${session.user.id}`, // Simplified - use proper session in production
      },
      cache: "no-store",
    }
  ).catch(() => null)

  const analytics = response?.ok ? await response.json() : null

  // Fallback data if API fails
  const kpis = analytics?.kpis || {
    totalGuests: 0,
    yes: 0,
    no: 0,
    maybe: 0,
    pending: 0,
    households: 0,
  }

  const charts = analytics?.charts || {
    rsvpTrend: [],
    mealDistribution: [],
    guestsByTag: [],
    campaignPerformance: [],
  }

  const recentActivity = analytics?.recentActivity || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold mb-2">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your wedding.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>

      {/* KPI Tiles */}
      <KPITiles data={kpis} />

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <RsvpTrendChart data={charts.rsvpTrend} />
        <MealDistributionChart data={charts.mealDistribution} />
      </div>

      {/* Campaign Performance */}
      {charts.campaignPerformance && charts.campaignPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Campaign Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {charts.campaignPerformance.map((campaign: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">{campaign.type}</p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Sent</p>
                      <p className="font-semibold">{campaign.sent}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Opened</p>
                      <p className="font-semibold">{campaign.opened}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Open Rate</p>
                      <p className="font-semibold text-green-600">
                        {campaign.openRate}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Row: Activity Feed + Quick Links */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <ActivityFeed activities={recentActivity} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/guests">
                <Users className="mr-2 h-4 w-4" />
                Manage Guests
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/campaigns">
                <Mail className="mr-2 h-4 w-4" />
                Send Invitations
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/events">
                <Calendar className="mr-2 h-4 w-4" />
                Manage Events
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/seating">
                <Users className="mr-2 h-4 w-4" />
                Seating Charts
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/messages">
                <Mail className="mr-2 h-4 w-4" />
                Send Message
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/settings/theme">
                <Settings className="mr-2 h-4 w-4" />
                Customize Theme
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

