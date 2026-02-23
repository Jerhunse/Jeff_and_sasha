"use server"

import { prisma } from "@/lib/prisma"

export interface SearchResult {
  guest: {
    id: string
    firstName: string
    lastName: string
  }
  table: {
    name: string
    capacity: number
  }
  seatingChart: {
    name: string
    description: string | null
  }
  tablemates: Array<{
    firstName: string
    lastName: string
  }>
}

export async function searchGuestSeat(
  slug: string,
  searchQuery: string
): Promise<SearchResult | null> {
  if (!searchQuery || searchQuery.trim().length === 0) {
    return null
  }

  const trimmedQuery = searchQuery.trim()

  const wedding = await prisma.couple.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!wedding) {
    return null
  }

  const guests = await prisma.guest.findMany({
    where: {
      coupleId: wedding.id,
      AND: [
        {
          seats: {
            some: {},
          },
        },
        {
          OR: [
            {
              firstName: {
                contains: trimmedQuery,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: trimmedQuery,
                mode: "insensitive",
              },
            },
            {
              phone: {
                contains: trimmedQuery,
                mode: "insensitive",
              },
            },
          ],
        },
      ],
    },
    include: {
      seats: {
        include: {
          table: {
            include: {
              seatingChart: {
                select: {
                  name: true,
                  description: true,
                },
              },
              seats: {
                include: {
                  guest: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    take: 1,
  })

  if (guests.length === 0 || !guests[0].seats[0]) {
    return null
  }

  const guest = guests[0]
  const seat = guest.seats[0]
  const table = seat.table

  const tablemates = table.seats
    .filter((s) => s.guest.id !== guest.id)
    .map((s) => ({
      firstName: s.guest.firstName,
      lastName: s.guest.lastName,
    }))

  return {
    guest: {
      id: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
    },
    table: {
      name: table.name,
      capacity: table.capacity,
    },
    seatingChart: {
      name: table.seatingChart.name,
      description: table.seatingChart.description,
    },
    tablemates,
  }
}
