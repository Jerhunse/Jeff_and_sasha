"use client"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { User, UserPlus, Users as UsersIcon } from "lucide-react"

type Guest = {
  id: string
  firstName: string
  lastName: string
  email: string | null
  allowPlusOne: boolean
  parentGuestId: string | null
  notes: string | null
  household: {
    id: string
    name: string
  } | null
  rsvpResponses: {
    status: string
    plusOneName: string | null
  }[]
  seats: {
    id: string
    tableId: string
    seatNumber: number | null
    notes: string | null
  }[]
  plusOnes?: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    notes: string | null
    rsvpResponses: {
      status: string
    }[]
    seats: {
      id: string
      tableId: string
      seatNumber: number | null
      notes: string | null
    }[]
  }[]
}

type Table = {
  id: string
  name: string
  capacity: number
  shape: string | null
  seats: any[]
  _count: {
    seats: number
  }
}

interface GuestListDirectoryProps {
  guests: Guest[]
  tables: Table[]
  onDragStart: (e: React.DragEvent, guestId: string) => void
  hideDeclined?: boolean
}

export function GuestListDirectory({ guests, tables, onDragStart, hideDeclined = false }: GuestListDirectoryProps) {
  // When hideDeclined is true, exclude guests who RSVP'd NO
  const visibleGuests = hideDeclined
    ? guests.filter(g => g.rsvpResponses[0]?.status !== "NO")
    : guests

  // Group guests by household, keeping household members together
  const guestsByHousehold = visibleGuests.reduce((acc, guest) => {
    // Use household ID if available, otherwise create individual entry
    const householdId = guest.household?.id || `individual-${guest.id}`
    const householdName = guest.household?.name || `${guest.firstName} ${guest.lastName}`
    
    if (!acc[householdId]) {
      acc[householdId] = {
        name: householdName,
        guests: [],
      }
    }
    
    acc[householdId].guests.push(guest)
    return acc
  }, {} as Record<string, { name: string; guests: Guest[] }>)

  // Whether a primary guest has a plus one (record or name-only from RSVP)
  const hasPlusOne = (guest: Guest) =>
    (guest.plusOnes?.length ?? 0) > 0 ||
    (guest.rsvpResponses[0]?.plusOneName?.trim() ?? "").length > 0

  // Sort: guests with plus one first, then single guests; within each group keep multi-guest households first, then alphabetically
  const sortedHouseholds = Object.entries(guestsByHousehold).sort(([, a], [, b]) => {
    const aHasPlusOne = a.guests.some(hasPlusOne)
    const bHasPlusOne = b.guests.some(hasPlusOne)
    if (aHasPlusOne && !bHasPlusOne) return -1
    if (!aHasPlusOne && bHasPlusOne) return 1
    // Same category: multi-guest households first
    if (a.guests.length > 1 && b.guests.length === 1) return -1
    if (a.guests.length === 1 && b.guests.length > 1) return 1
    return a.name.localeCompare(b.name)
  })

  const getGuestTable = (guest: Guest) => {
    if (guest.seats.length === 0) return null
    return tables.find(t => t.id === guest.seats[0].tableId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "YES":
        return "bg-green-500/10 text-green-700 border-green-200"
      case "NO":
        return "bg-red-500/10 text-red-700 border-red-200"
      case "MAYBE":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="pb-6">
      {/* Two-column grid for all guests */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        {sortedHouseholds.flatMap(([householdId, household]) => 
          household.guests.map(guest => {
            const table = getGuestTable(guest)
            const isSeated = !!table
            const rsvpStatus = guest.rsvpResponses[0]?.status
            const seatRole = guest.seats[0]?.notes
            
            const isJefferyErhunse = guest.firstName === "Jeffery" && guest.lastName === "Erhunse"
            const isSashaContreras = guest.firstName === "Sasha" && guest.lastName === "Contreras"
            
            const isBride = seatRole === "BRIDE" || isSashaContreras
            const isGroom = seatRole === "GROOM" || isJefferyErhunse
            const isVIP = isBride || isGroom
            
            // Get plus-ones from both sources
            const plusOneRecords = guest.plusOnes || []
            const plusOneNames = guest.rsvpResponses[0]?.plusOneName?.split(',').map(n => n.trim()).filter(Boolean) || []

            return (
              <div key={guest.id} className="space-y-1">
                {/* Main Guest Card */}
                <div
                  draggable
                  onDragStart={(e) => onDragStart(e, guest.id)}
                  className={cn(
                    "p-2.5 rounded-lg border-2 transition-all cursor-move hover:shadow-md",
                    isSeated ? "bg-blue-50" : "bg-amber-50/30",
                    isVIP
                      ? "border-primary ring-2 ring-primary/20"
                      : isSeated 
                        ? "border-primary/20" 
                        : "border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex items-start gap-1.5">
                    <User className={cn(
                      "h-3.5 w-3.5 mt-0.5 shrink-0",
                      isVIP ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium text-xs break-words leading-tight",
                        isVIP && "text-primary font-bold"
                      )}>
                        {guest.firstName} {guest.lastName}
                      </p>
                      <div className="flex flex-wrap gap-0.5 mt-1">
                        {isVIP && (
                          <Badge className="text-[9px] px-1 py-0 bg-primary text-primary-foreground border-0">
                            {isBride ? "👰" : "🤵"}
                          </Badge>
                        )}
                        {rsvpStatus && rsvpStatus === "YES" && (
                          <Badge variant="outline" className={cn("text-[9px] px-1 py-0", getStatusColor(rsvpStatus))}>
                            ✓
                          </Badge>
                        )}
                        {rsvpStatus && rsvpStatus !== "YES" && (
                          <Badge variant="outline" className={cn("text-[9px] px-1 py-0", getStatusColor(rsvpStatus))}>
                            {rsvpStatus === "NO" ? "✗" : "?"}
                          </Badge>
                        )}
                        {isSeated && table && (
                          <Badge variant="secondary" className="text-[9px] px-1 py-0">
                            {table.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plus-ones from Guest records */}
                {plusOneRecords.map(plusOne => {
                  const plusOneTable = plusOne.seats.length > 0 ? tables.find(t => t.id === plusOne.seats[0].tableId) : null
                  const isPlusOneSeated = !!plusOneTable
                  const plusOneRsvpStatus = plusOne.rsvpResponses[0]?.status
                  
                  return (
                    <div
                      key={plusOne.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, plusOne.id)}
                      className={cn(
                        "p-2 rounded-lg border ml-4 transition-all cursor-move hover:shadow-md",
                        isPlusOneSeated ? "bg-blue-50/70" : "bg-amber-50/20",
                        "border-border hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-start gap-1.5">
                        <UserPlus className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs break-words leading-tight">
                            {plusOne.firstName} {plusOne.lastName}
                          </p>
                          <div className="flex flex-wrap gap-0.5 mt-1">
                            <Badge variant="outline" className="text-[9px] px-1 py-0 bg-blue-500/10 text-blue-700 border-blue-200">
                              +1
                            </Badge>
                            {plusOneRsvpStatus && plusOneRsvpStatus === "YES" && (
                              <Badge variant="outline" className={cn("text-[9px] px-1 py-0", getStatusColor(plusOneRsvpStatus))}>
                                ✓
                              </Badge>
                            )}
                            {isPlusOneSeated && plusOneTable && (
                              <Badge variant="secondary" className="text-[9px] px-1 py-0">
                                {plusOneTable.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Plus-ones from RSVP plusOneName field (text only) */}
                {plusOneNames.length > 0 && plusOneRecords.length === 0 && (
                  <div className="ml-4 p-2 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20">
                    <div className="flex items-start gap-1.5">
                      <UserPlus className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground break-words leading-tight">
                          {plusOneNames.join(', ')}
                        </p>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 mt-1 bg-blue-500/10 text-blue-700 border-blue-200">
                          +1 (name only)
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {sortedHouseholds.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No guests found</p>
        </div>
      )}
    </div>
  )
}
