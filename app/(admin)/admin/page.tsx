import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, CheckCircle, XCircle, Clock } from "lucide-react"

export default async function AdminDashboard() {
  const session = await auth()

  if (!session?.user?.weddingId) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">No wedding associated with your account.</p>
      </div>
    )
  }

  const wedding = await prisma.wedding.findUnique({
    where: { id: session.user.weddingId },
    include: {
      _count: {
        select: {
          guests: true,
          events: true,
          pages: true,
        },
      },
      guests: {
        select: {
          rsvpStatus: true,
        },
      },
    },
  })

  if (!wedding) {
    return <div>Wedding not found</div>
  }

  // Calculate RSVP stats
  const rsvpStats = wedding.guests.reduce(
    (acc, guest) => {
      acc[guest.rsvpStatus] = (acc[guest.rsvpStatus] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const stats = [
    {
      title: "Total Guests",
      value: wedding._count.guests,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Attending",
      value: rsvpStats.ATTENDING || 0,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Declined",
      value: rsvpStats.DECLINED || 0,
      icon: XCircle,
      color: "text-red-600",
    },
    {
      title: "Pending",
      value: rsvpStats.PENDING || 0,
      icon: Clock,
      color: "text-yellow-600",
    },
  ]

  const daysUntilWedding = Math.ceil(
    (new Date(wedding.weddingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          {wedding.partner1Name} & {wedding.partner2Name}'s Wedding
        </p>
      </div>

      {/* Wedding Countdown */}
      <Card className="bg-gradient-to-br from-primary/10 via-secondary to-accent/10">
        <CardContent className="pt-8 text-center">
          <div className="text-6xl font-serif font-bold text-primary mb-2">
            {daysUntilWedding}
          </div>
          <p className="text-lg font-medium">
            {daysUntilWedding === 1 ? "Day" : "Days"} Until Your Wedding
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {new Date(wedding.weddingDate).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Wedding Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Published</span>
              <Badge variant={wedding.isPublished ? "default" : "secondary"}>
                {wedding.isPublished ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Website</span>
              <a
                href={`/${wedding.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                View Site
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Events</span>
              <Badge variant="outline">{wedding._count.events}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Pages</span>
              <Badge variant="outline">{wedding._count.pages}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activity tracking coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

