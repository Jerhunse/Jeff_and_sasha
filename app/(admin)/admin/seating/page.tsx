import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { SeatingChartManager } from "@/components/admin/seating-chart-manager"

export const metadata = {
  title: "Seating Chart | Admin",
  description: "Manage wedding seating arrangements and table assignments",
}

export default async function SeatingPage() {
  const session = await auth()

  if (!session?.user?.coupleId) {
    redirect("/auth/signin")
  }

  // Fetch or create default seating chart
  let seatingChart = await prisma.seatingChart.findFirst({
    where: {
      coupleId: session.user.coupleId,
    },
    include: {
      tables: {
        include: {
          seats: {
            include: {
              guest: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  allowPlusOne: true,
                  rsvpResponses: {
                    select: {
                      status: true,
                      plusOneName: true,
                    },
                    take: 1,
                  },
                },
              },
            },
          },
          _count: {
            select: {
              seats: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      },
    },
  })

  // If no seating chart exists, create one with default tables
  if (!seatingChart) {
    const createdChart = await prisma.seatingChart.create({
      data: {
        coupleId: session.user.coupleId,
        name: "Reception Seating",
        description: "Main reception seating arrangement",
      },
      include: {
        tables: {
          include: {
            seats: {
              include: {
                guest: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    allowPlusOne: true,
                    rsvpResponses: {
                      select: {
                        status: true,
                        plusOneName: true,
                      },
                      take: 1,
                    },
                  },
                },
              },
            },
            _count: {
              select: {
                seats: true,
              },
            },
          },
        },
      },
    })

    // Create 18 round tables (capacity 10) and 1 head table (capacity 31)
    const tablesToCreate = [
      // Head table
      {
        seatingChartId: createdChart.id,
        name: "Head Table",
        capacity: 31,
        shape: "rectangular",
      },
      // Round tables 1-18
      ...Array.from({ length: 18 }, (_, i) => ({
        seatingChartId: createdChart.id,
        name: `Table ${i + 1}`,
        capacity: 10,
        shape: "round",
      })),
    ]

    await prisma.table.createMany({
      data: tablesToCreate,
    })

    // Refetch with tables
    seatingChart = await prisma.seatingChart.findUnique({
      where: { id: createdChart.id },
      include: {
        tables: {
          include: {
            seats: {
              include: {
                guest: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    allowPlusOne: true,
                    rsvpResponses: {
                      select: {
                        status: true,
                        plusOneName: true,
                      },
                      take: 1,
                    },
                  },
                },
              },
            },
            _count: {
              select: {
                seats: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        },
      },
    })
  }

  // Fetch all guests for the couple, ordered by household first
  const primaryGuests = await prisma.guest.findMany({
    where: {
      coupleId: session.user.coupleId,
      parentGuestId: null, // Only primary guests, not plus-ones (matches guest list page)
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      allowPlusOne: true,
      parentGuestId: true,
      notes: true,
      maxGuestsAllowed: true,
      household: {
        select: {
          id: true,
          name: true,
        },
      },
      rsvpResponses: {
        where: { eventId: null },
        select: {
          status: true,
          plusOneName: true,
        },
        orderBy: { respondedAt: 'desc' },
        take: 1,
      },
      seats: {
        select: {
          id: true,
          tableId: true,
          seatNumber: true,
          notes: true,
        },
      },
      // Include plus-ones as separate Guest records
      plusOnes: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          notes: true,
          rsvpResponses: {
            where: { eventId: null },
            select: {
              status: true,
              plusOneName: true,
            },
            take: 1,
          },
          seats: {
            select: {
              id: true,
              tableId: true,
              seatNumber: true,
              notes: true,
            },
          },
        },
      },
    },
    orderBy: [
      { householdId: 'asc' },
      { lastName: 'asc' },
      { firstName: 'asc' },
    ],
  })

  // Flatten plus-ones into the main guests array so they can be found during drag-and-drop
  const guests = primaryGuests.flatMap(guest => {
    const plusOnesAsGuests = (guest.plusOnes || []).map(plusOne => ({
      ...plusOne,
      maxGuestsAllowed: 1,
      household: guest.household,
      allowPlusOne: false,
      parentGuestId: guest.id,
      plusOnes: [],
    }))
    
    return [guest, ...plusOnesAsGuests]
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl font-bold mb-2">Seating Chart</h1>
        <p className="text-muted-foreground">
          Assign guests to tables and manage seating arrangements
        </p>
      </div>

      <SeatingChartManager
        seatingChart={seatingChart!}
        guests={guests}
      />
    </div>
  )
}
