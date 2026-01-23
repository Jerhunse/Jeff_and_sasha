import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { GuestListTable } from "@/components/admin/guest-list-table"
import { GuestFilters } from "@/components/admin/guest-filters"
import { GuestActions } from "@/components/admin/guest-actions"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, UserX, Clock, Home } from "lucide-react"

interface GuestsPageProps {
  searchParams: Promise<{
    search?: string
    tag?: string
    rsvpStatus?: string
    household?: string
    isChild?: string
    page?: string
  }>
}

export default async function GuestsPage({ searchParams }: GuestsPageProps) {
  const session = await auth()

  if (!session?.user?.coupleId) {
    redirect("/auth/signin")
  }

  const params = await searchParams
  const {
    search = "",
    tag,
    rsvpStatus,
    household,
    isChild,
    page = "1",
  } = params

  // Build filter conditions
  const where: any = {
    coupleId: session.user.coupleId,
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }

  // RSVP status filter - map form values to Prisma enum and filter via relation
  if (rsvpStatus) {
    const statusMap: Record<string, "YES" | "NO" | "MAYBE"> = {
      ATTENDING: "YES",
      DECLINED: "NO",
      MAYBE: "MAYBE",
    }
    const prismaStatus = statusMap[rsvpStatus]
    
    if (prismaStatus) {
      // Filter guests who have RSVP response with this status
      where.rsvpResponses = {
        some: {
          eventId: null,
          status: prismaStatus,
        },
      }
    } else if (rsvpStatus === "PENDING") {
      // Pending = no RSVP response
      where.rsvpResponses = {
        none: {
          eventId: null,
        },
      }
    }
  }

  if (household) {
    where.householdId = household
  }

  if (isChild === "true") {
    where.isChild = true
  }

  if (tag) {
    where.tags = {
      some: {
        tagId: tag,
      },
    }
  }

  // Pagination
  const pageSize = 50
  const currentPage = parseInt(page)
  const skip = (currentPage - 1) * pageSize

  // Fetch guests with relations
  const [guests, totalCount, tags, households, wedding] = await Promise.all([
    prisma.guest.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        household: true,
        rsvpResponses: {
          where: { eventId: null }, // General RSVP
          orderBy: { respondedAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            rsvpResponses: true,
          },
        },
      },
      orderBy: [
        { createdAt: "desc" }, // Show newest first to see recently added guests
        { lastName: "asc" },
        { firstName: "asc" },
      ],
      skip,
      take: pageSize,
    }),
    prisma.guest.count({ where }),
    prisma.tag.findMany({
      where: { coupleId: session.user.coupleId },
      include: {
        _count: {
          select: {
            guests: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.household.findMany({
      where: { coupleId: session.user.coupleId },
      include: {
        _count: {
          select: {
            guests: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.couple.findUnique({
      where: { id: session.user.coupleId },
      select: {
        _count: {
          select: {
            guests: true,
          },
        },
      },
    }),
  ])

  // Calculate stats - RSVP status is now in RSVPResponse, not Guest
  const [attendingCount, declinedCount, pendingCount] = await Promise.all([
    prisma.rSVPResponse.count({
      where: {
        coupleId: session.user.coupleId,
        eventId: null,
        status: "YES", // Prisma enum value
      },
    }),
    prisma.rSVPResponse.count({
      where: {
        coupleId: session.user.coupleId,
        eventId: null,
        status: "NO", // Prisma enum value
      },
    }),
    // Pending = guests without RSVP responses
    prisma.guest.count({
      where: {
        coupleId: session.user.coupleId,
        rsvpResponses: {
          none: {
            eventId: null,
          },
        },
      },
    }),
  ])

  const stats = {
    total: wedding?._count.guests || 0,
    attending: attendingCount,
    declined: declinedCount,
    pending: pendingCount,
    households: households.length,
    children: await prisma.guest.count({
      where: {
        coupleId: session.user.coupleId,
        isChild: true,
      },
    }),
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold mb-2">Guest List</h1>
          <p className="text-muted-foreground">
            Manage your wedding guests and RSVPs
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Total</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Attending</span>
            <UserCheck className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.attending}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Declined</span>
            <UserX className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Pending</span>
            <Clock className="h-4 w-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Households</span>
            <Home className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{stats.households}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Children</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{stats.children}</div>
        </Card>
      </div>

      {/* Actions Bar */}
      <GuestActions
        weddingId={session.user.coupleId}
        tags={tags}
        households={households}
      />

      {/* Filters */}
      <GuestFilters
        tags={tags}
        households={households}
        currentFilters={{
          search,
          tag,
          rsvpStatus,
          household,
          isChild,
        }}
      />

      {/* Guest Table */}
      <GuestListTable
        guests={guests}
        tags={tags}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
      />
    </div>
  )
}

