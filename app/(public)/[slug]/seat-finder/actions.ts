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

/**
 * Normalizes a string for forgiving comparison: strips diacritics/accents
 * (so "Saraí" matches "Sarai"), lowercases, and collapses whitespace.
 */
function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

/** Keeps only digits, so phone searches ignore spaces, dashes, and parens. */
function digitsOnly(value: string): string {
  return value.replace(/\D/g, "")
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

  // Pull all seated guests for this wedding (small dataset) and match in
  // application code. This lets a guest find themselves by typing their full
  // name in any order, with or without accents, or by phone number — none of
  // which a single Prisma `contains` clause handles reliably.
  const seatedGuests = await prisma.guest.findMany({
    where: {
      coupleId: wedding.id,
      seats: { some: {} },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
  })

  const normalizedQuery = normalizeName(trimmedQuery)
  const queryTokens = normalizedQuery.split(" ").filter(Boolean)
  const queryDigits = digitsOnly(trimmedQuery)

  const matched = seatedGuests
    .map((g) => {
      const fullName = normalizeName(`${g.firstName ?? ""} ${g.lastName ?? ""}`)
      const guestDigits = digitsOnly(g.phone ?? "")

      const phoneMatch =
        queryDigits.length >= 4 &&
        guestDigits.length > 0 &&
        guestDigits.includes(queryDigits)

      // Every word the guest typed must appear somewhere in their full name.
      const nameMatch =
        queryTokens.length > 0 &&
        queryTokens.every((token) => fullName.includes(token))

      if (!phoneMatch && !nameMatch) {
        return null
      }

      // Rank exact full-name matches highest so the right person wins when
      // multiple guests share part of a name.
      const score = fullName === normalizedQuery ? 2 : phoneMatch ? 1 : 0
      return { id: g.id, score }
    })
    .filter((m): m is { id: string; score: number } => m !== null)
    .sort((a, b) => b.score - a.score)

  if (matched.length === 0) {
    return null
  }

  const guest = await prisma.guest.findUnique({
    where: { id: matched[0].id },
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
  })

  if (!guest || !guest.seats[0]) {
    return null
  }

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
