import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.coupleId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch comprehensive analytics data
    const [
      totalGuests,
      rsvpResponses,
      campaigns,
      recentActivity,
      guestsByTag,
      mealChoices,
    ] = await Promise.all([
      // Total guests count
      prisma.guest.count({
        where: { coupleId: session.user.coupleId },
      }),

      // RSVP responses with grouping
      prisma.rSVPResponse.groupBy({
        by: ["status"],
        where: { coupleId: session.user.coupleId },
        _count: true,
      }),

      // Campaign statistics
      prisma.campaign.findMany({
        where: { coupleId: session.user.coupleId },
        select: {
          id: true,
          name: true,
          type: true,
          sent: true,
          opened: true,
          failed: true,
          sentAt: true,
        },
      }),

      // Recent activity
      prisma.activityLog.findMany({
        where: { coupleId: session.user.coupleId },
        include: {
          actor: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),

      // Guests by tag
      prisma.tag.findMany({
        where: { coupleId: session.user.coupleId },
        include: {
          _count: {
            select: {
              guests: true,
            },
          },
        },
      }),

      // Meal choice distribution
      prisma.$queryRaw`
        SELECT 
          r."answersJSON"::jsonb->>'mealChoice' as meal_choice,
          COUNT(*) as count
        FROM "RSVPResponse" r
        WHERE r."coupleId" = ${session.user.coupleId}
          AND r.status = 'YES'
          AND r."answersJSON" IS NOT NULL
        GROUP BY meal_choice
        HAVING r."answersJSON"::jsonb->>'mealChoice' IS NOT NULL
      `,
    ])

    // Calculate KPIs
    const rsvpStats = {
      total: totalGuests,
      yes: rsvpResponses.find((r) => r.status === "YES")?._count || 0,
      no: rsvpResponses.find((r) => r.status === "NO")?._count || 0,
      maybe: rsvpResponses.find((r) => r.status === "MAYBE")?._count || 0,
      pending: rsvpResponses.find((r) => r.status === "PENDING")?._count || 0,
    }

    // RSVP trend data (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const rsvpTrend = await prisma.rSVPResponse.groupBy({
      by: ["respondedAt"],
      where: {
        coupleId: session.user.coupleId,
        status: "YES",
        respondedAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: true,
      orderBy: {
        respondedAt: "asc",
      },
    })

    // Format trend data for charts
    const trendData = rsvpTrend.map((item) => ({
      date: item.respondedAt.toISOString().split("T")[0],
      count: item._count,
    }))

    // Campaign performance
    const campaignPerformance = campaigns.map((c) => ({
      name: c.name,
      type: c.type,
      sent: c.sent,
      opened: c.opened,
      openRate: c.sent > 0 ? ((c.opened / c.sent) * 100).toFixed(1) : 0,
      failed: c.failed,
    }))

    return NextResponse.json({
      kpis: {
        totalGuests,
        ...rsvpStats,
        households: await prisma.household.count({
          where: { coupleId: session.user.coupleId },
        }),
      },
      charts: {
        rsvpTrend: trendData,
        mealDistribution: mealChoices,
        guestsByTag: guestsByTag.map((t) => ({
          name: t.name,
          count: t._count.guests,
          color: t.color,
        })),
        campaignPerformance,
      },
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        description: a.description,
        actor: a.actor?.name || "System",
        createdAt: a.createdAt,
      })),
    })
  } catch (error: any) {
    console.error("Fetch analytics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}

