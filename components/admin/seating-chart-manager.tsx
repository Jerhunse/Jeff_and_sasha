"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Users, 
  Search, 
  UserCheck, 
  UserX, 
  Armchair,
  Download,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TableVisualizer } from "./seating/table-visualizer"
import { GuestListDirectory } from "./seating/guest-list-directory"
import { toast } from "sonner"

type Guest = {
  id: string
  firstName: string
  lastName: string
  email: string | null
  allowPlusOne: boolean
  maxGuestsAllowed?: number | null
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

type Seat = {
  id: string
  tableId: string
  guestId: string
  seatNumber: number | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  guest: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    allowPlusOne: boolean
    rsvpResponses: {
      status: string
      plusOneName: string | null
    }[]
  }
}

type Table = {
  id: string
  name: string
  capacity: number
  shape: string | null
  seats: Seat[]
  _count: {
    seats: number
  }
}

type SeatingChart = {
  id: string
  name: string
  description: string | null
  tables: Table[]
}

interface SeatingChartManagerProps {
  seatingChart: SeatingChart
  guests: Guest[]
}

export function SeatingChartManager({ seatingChart: initialChart, guests: initialGuests }: SeatingChartManagerProps) {
  const [seatingChart, setSeatingChart] = useState<SeatingChart>(initialChart)
  const [guests, setGuests] = useState<Guest[]>(initialGuests)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "seated" | "unseated">("all")
  const [confirmDialog, setConfirmDialog] = useState<{
    guestId: string
    guestName: string
    currentTable: string
    currentTableId: string
    targetTableId: string
  } | null>(null)

  // Helper function to count seats at a table
  const countPeopleInSeats = (seats: Seat[]): number => {
    return seats.length
  }

  // Update selected table when seating chart changes
  const selectedTableId = selectedTable?.id ?? null
  useEffect(() => {
    if (selectedTableId) {
      const updatedTable = seatingChart.tables.find(t => t.id === selectedTableId)
      if (updatedTable) {
        setSelectedTable(updatedTable)
      }
    }
  }, [seatingChart.tables, selectedTableId])

  // Fix table counts on initial load to account for plus ones
  useEffect(() => {
    setSeatingChart(prev => ({
      ...prev,
      tables: prev.tables.map(table => {
        const peopleCount = countPeopleInSeats(table.seats)
        const needsUpdate = peopleCount !== table._count.seats
        
        return needsUpdate ? {
          ...table,
          _count: {
            seats: peopleCount,
          },
        } : table
      }),
    }))
  }, []) // Run once on mount

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCapacity = seatingChart.tables.reduce((sum, table) => sum + table.capacity, 0)
    
    // Total invited = sum of maxGuestsAllowed from primary guests only
    const primaryGuests = guests.filter(g => !g.parentGuestId)
    const totalGuests = primaryGuests.reduce((sum, g) => sum + (g.maxGuestsAllowed || 1), 0)
    
    // Attending = all guests (primary + plus-ones) who RSVP'd YES
    const attendingGuests = guests.filter(g => g.rsvpResponses[0]?.status === "YES").length
    
    // Seated/unseated counts all guests in the system
    const seatedGuests = guests.filter(g => g.seats.length > 0).length
    const unseatedGuests = guests.filter(g => g.seats.length === 0).length
    
    return {
      totalCapacity,
      seatedGuests,
      unseatedGuests,
      attendingGuests,
      totalGuests,
    }
  }, [seatingChart, guests])

  // Filter guests
  const filteredGuests = useMemo(() => {
    let filtered = guests

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(g => 
        g.firstName.toLowerCase().includes(query) ||
        g.lastName.toLowerCase().includes(query) ||
        g.email?.toLowerCase().includes(query)
      )
    }

    // Seating status filter
    if (filterStatus === "seated") {
      filtered = filtered.filter(g => g.seats.length > 0)
    } else if (filterStatus === "unseated") {
      filtered = filtered.filter(g => g.seats.length === 0)
    }

    return filtered
  }, [guests, searchQuery, filterStatus])

  const assignGuestToTable = async (guestId: string, tableId: string, seatNumber?: number, forceMove: boolean = false) => {
    try {
      // Find the guest
      const guest = guests.find(g => g.id === guestId)
      if (!guest) {
        toast.error("Guest not found")
        return
      }

      const response = await fetch(`/api/admin/seating/${seatingChart.id}/tables/${tableId}/seats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestId,
          seatNumber,
          force: forceMove,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          if (data.error === "ALREADY_AT_TABLE") {
            toast.error("Guest(s) already assigned to this table")
            return
          }
          
          // Show confirmation dialog for moving to a different table
          setConfirmDialog({
            guestId,
            guestName: data.guests?.[0]?.name || `${guest.firstName} ${guest.lastName}`,
            currentTable: data.currentTable,
            currentTableId: data.currentTableId,
            targetTableId: tableId,
          })
          return
        } else if (response.status === 400) {
          toast.error(data.error || "Failed to assign guest")
          return
        }
        throw new Error(data.error || "Failed to assign guest")
      }

      const { seats } = data

      // Update local state
      setSeatingChart(prev => ({
        ...prev,
        tables: prev.tables.map(table => {
          // Remove from old table(s)
          const updatedSeats = table.seats.filter(
            s => !seats.some((newSeat: any) => newSeat.guestId === s.guestId)
          )
          
          // Add to new table if this is the target
          if (table.id === tableId) {
            const newSeats = [...updatedSeats, ...seats]
            
            return {
              ...table,
              seats: newSeats,
              _count: {
                seats: newSeats.length,
              },
            }
          }
          
          return {
            ...table,
            seats: updatedSeats,
            _count: {
              seats: updatedSeats.length,
            },
          }
        }),
      }))

      // Update guests state
      setGuests(prev => prev.map(g => {
        const matchingSeat = seats.find((s: any) => s.guestId === g.id)
        if (matchingSeat) {
          return {
            ...g,
            seats: [{
              id: matchingSeat.id,
              tableId,
              seatNumber: matchingSeat.seatNumber || null,
              notes: matchingSeat.notes || null,
            }],
          }
        }
        return g
      }))

      const tableName = seatingChart.tables.find(t => t.id === tableId)?.name
      toast.success(`Assigned ${guest.firstName} ${guest.lastName} to ${tableName}`)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleConfirmMove = async () => {
    if (!confirmDialog) return
    
    await assignGuestToTable(
      confirmDialog.guestId,
      confirmDialog.targetTableId,
      undefined,
      true // force move
    )
    
    setConfirmDialog(null)
  }

  const removeGuestFromTable = async (seatId: string, guestId: string, tableId: string) => {
    try {
      const response = await fetch(`/api/admin/seating/${seatingChart.id}/tables/${tableId}/seats?seatId=${seatId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove guest")
      }

      // Update local state
      setSeatingChart(prev => ({
        ...prev,
        tables: prev.tables.map(table => {
          if (table.id === tableId) {
            const updatedSeats = table.seats.filter(s => s.id !== seatId)
            const peopleCount = countPeopleInSeats(updatedSeats)
            
            return {
              ...table,
              seats: updatedSeats,
              _count: {
                seats: peopleCount, // Count people, not just seat records
              },
            }
          }
          return table
        }),
      }))

      // Update guests state
      setGuests(prev => prev.map(g => {
        if (g.id === guestId) {
          return {
            ...g,
            seats: [],
          }
        }
        return g
      }))

      toast.success("Guest removed from table")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const swapSeats = async (tableId: string, seatId1: string, seatId2: string) => {
    try {
      const response = await fetch(`/api/admin/seating/${seatingChart.id}/tables/${tableId}/seats/swap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seatId1,
          seatId2,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to swap seats")
      }

      // Refresh the seating chart data
      const refreshResponse = await fetch(`/api/admin/seating/${seatingChart.id}`)
      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        setSeatingChart(data.seatingChart)
      }

      toast.success("Seats rearranged successfully")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const moveSeatToPosition = async (tableId: string, seatId: string, seatNumber: number) => {
    try {
      const table = seatingChart.tables.find(t => t.id === tableId)
      if (!table) throw new Error("Table not found")

      const draggedSeat = table.seats.find(s => s.id === seatId)
      if (!draggedSeat) throw new Error("Seat not found")

      const occupant = table.seats.find(s => s.seatNumber === seatNumber && s.id !== seatId)

      if (occupant) {
        // Target is occupied: swap the two seats via the swap API
        const response = await fetch(`/api/admin/seating/${seatingChart.id}/tables/${tableId}/seats/swap`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seatId1: seatId, seatId2: occupant.id }),
        })
        if (!response.ok) throw new Error("Failed to swap seats")

        // Optimistic update: swap their seatNumbers and notes locally
        setSeatingChart(prev => ({
          ...prev,
          tables: prev.tables.map(t => {
            if (t.id !== tableId) return t
            return {
              ...t,
              seats: t.seats.map(s => {
                if (s.id === seatId) return { ...s, seatNumber: occupant.seatNumber, notes: occupant.notes }
                if (s.id === occupant.id) return { ...s, seatNumber: draggedSeat.seatNumber, notes: draggedSeat.notes }
                return s
              }),
            }
          }),
        }))

        // Update guests state to reflect the swap
        setGuests(prev => prev.map(g => {
          // Update guest with draggedSeat
          if (g.id === draggedSeat.guestId && g.seats.length > 0) {
            return {
              ...g,
              seats: [{
                ...g.seats[0],
                seatNumber: occupant.seatNumber,
                notes: occupant.notes,
              }],
            }
          }
          // Update guest with occupant seat
          if (g.id === occupant.guestId && g.seats.length > 0) {
            return {
              ...g,
              seats: [{
                ...g.seats[0],
                seatNumber: draggedSeat.seatNumber,
                notes: draggedSeat.notes,
              }],
            }
          }
          return g
        }))
      } else {
        // Target is empty: just update the seat's number
        const response = await fetch(`/api/admin/seating/${seatingChart.id}/tables/${tableId}/seats`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seatId, seatNumber }),
        })
        if (!response.ok) throw new Error("Failed to move seat")

        // Optimistic update
        setSeatingChart(prev => ({
          ...prev,
          tables: prev.tables.map(t => {
            if (t.id !== tableId) return t
            return {
              ...t,
              seats: t.seats.map(s => {
                if (s.id === seatId) return { ...s, seatNumber }
                return s
              }),
            }
          }),
        }))

        // Update guests state to reflect the seat number change
        setGuests(prev => prev.map(g => {
          if (g.id === draggedSeat.guestId && g.seats.length > 0) {
            return {
              ...g,
              seats: [{
                ...g.seats[0],
                seatNumber,
              }],
            }
          }
          return g
        }))
      }

      toast.success("Seat moved")
    } catch (error: any) {
      toast.error(error.message)
      // Refetch on error to reset to server state
      const refreshResponse = await fetch(`/api/admin/seating/${seatingChart.id}`)
      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        setSeatingChart(data.seatingChart)
      }
    }
  }

  const handleDragStart = (e: React.DragEvent, guestIdOrPlusOne: string) => {
    e.dataTransfer.setData("guestId", guestIdOrPlusOne)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleTableDrop = async (e: React.DragEvent, tableId: string) => {
    e.preventDefault()
    const guestId = e.dataTransfer.getData("guestId")
    
    if (guestId) {
      // Extract the actual guest ID (remove plus-one suffix if present, since all are real guests now)
      const cleanGuestId = guestId.replace(/-plus-one-\d+$/, '')
      await assignGuestToTable(cleanGuestId, tableId)
    }
  }

  const handleTableDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Total Capacity</span>
            <Armchair className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{stats.totalCapacity}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Total Guests</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{stats.totalGuests}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Seated</span>
            <UserCheck className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.seatedGuests}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Unseated</span>
            <UserX className="h-4 w-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.unseatedGuests}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Attending</span>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.attendingGuests}</div>
        </Card>
      </div>

      {/* Main Layout: Tables on Left, Guest List on Right */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Tables Grid */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold">Floor Plan</h2>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>

            {/* Head Table */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                Head Table
              </h3>
              <div className="space-y-4">
                {seatingChart.tables
                  .filter(table => table.shape === "rectangular")
                  .map(table => (
                    <div
                      key={table.id}
                      className={cn(
                        "border-2 rounded-lg p-4 transition-all cursor-pointer hover:border-primary/50",
                        selectedTable?.id === table.id ? "border-primary bg-primary/5" : "border-border"
                      )}
                      onClick={() => setSelectedTable(table)}
                      onDrop={(e) => handleTableDrop(e, table.id)}
                      onDragOver={handleTableDragOver}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-serif text-lg font-medium">{table.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            U-Shaped Rectangular • Capacity: {table.capacity}
                          </p>
                        </div>
                        <Badge variant={table._count.seats >= table.capacity ? "destructive" : "secondary"}>
                          {table._count.seats} / {table.capacity}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Round Tables */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                Round Tables
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {seatingChart.tables
                  .filter(table => table.shape === "round")
                  .sort((a, b) => {
                    const aNum = parseInt(a.name.replace(/\D/g, '')) || 0
                    const bNum = parseInt(b.name.replace(/\D/g, '')) || 0
                    return aNum - bNum
                  })
                  .map(table => (
                    <div
                      key={table.id}
                      className={cn(
                        "border-2 rounded-lg p-4 transition-all cursor-pointer hover:border-primary/50",
                        selectedTable?.id === table.id ? "border-primary bg-primary/5" : "border-border"
                      )}
                      onClick={() => setSelectedTable(table)}
                      onDrop={(e) => handleTableDrop(e, table.id)}
                      onDragOver={handleTableDragOver}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="size-16 rounded-full border-2 border-primary/20 bg-primary/5 flex items-center justify-center">
                          <span className="text-xl font-bold font-serif">{table.name.replace("Table ", "")}</span>
                        </div>
                        <Badge variant={table._count.seats >= table.capacity ? "destructive" : "secondary"}>
                          {table._count.seats} / {table.capacity}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </Card>

          {/* Selected Table Detail - expanded with guest list (max 10 per column) */}
          {selectedTable && (
            <Card className="p-6 col-span-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold">{selectedTable.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedTable.shape === "rectangular" ? "U-Shaped Rectangular" : "Round"} • 
                    Capacity: {selectedTable.capacity}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTable(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Guests at this table - list view, max 10 per column */}
              {selectedTable.seats.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                    Guests at this table
                  </h3>
                  {(() => {
                    const GUESTS_PER_COLUMN = 5
                    const columns: typeof selectedTable.seats[] = []
                    for (let i = 0; i < selectedTable.seats.length; i += GUESTS_PER_COLUMN) {
                      columns.push(selectedTable.seats.slice(i, i + GUESTS_PER_COLUMN))
                    }
                    return (
                      <div className="flex flex-wrap gap-x-8 gap-y-2 text-left">
                        {columns.map((columnSeats, colIndex) => (
                          <ul key={colIndex} className="list-disc list-outside space-y-1.5 min-w-[140px] pl-5 text-left">
                            {columnSeats.map((seat) => {
                              const plusOneName = seat.guest.rsvpResponses?.length > 0
                                ? seat.guest.rsvpResponses[0].plusOneName
                                : null
                              return (
                                <li key={seat.id} className="flex flex-col gap-0.5 text-left">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">
                                      {seat.guest.firstName} {seat.guest.lastName}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeGuestFromTable(seat.id, seat.guestId, selectedTable.id)}
                                      className="text-muted-foreground hover:text-destructive p-0.5 shrink-0"
                                      aria-label={`Remove ${seat.guest.firstName} from table`}
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                  {plusOneName && (
                                    <span className="text-xs text-muted-foreground pl-4">+{plusOneName}</span>
                                  )}
                                </li>
                              )
                            })}
                          </ul>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              )}

              <TableVisualizer
                table={selectedTable}
                onRemoveGuest={removeGuestFromTable}
                onSwapSeats={swapSeats}
                onMoveSeatToPosition={moveSeatToPosition}
                onAssignGuestToSeat={async (tableId, guestId, seatNumber) => {
                  await assignGuestToTable(guestId, tableId, seatNumber)
                }}
              />
            </Card>
          )}
        </div>

        {/* Guest List Directory */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="space-y-4 flex-shrink-0">
              <div>
                <h2 className="text-xl font-serif font-bold mb-4">Guest Directory</h2>
                
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search guests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={filterStatus === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === "unseated" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("unseated")}
                  >
                    Unseated
                  </Button>
                  <Button
                    variant={filterStatus === "seated" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("seated")}
                  >
                    Seated
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-420px)] min-h-[600px]">
              <GuestListDirectory
                guests={filteredGuests}
                tables={seatingChart.tables}
                onDragStart={handleDragStart}
              />
            </ScrollArea>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmDialog} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Guest Already Assigned</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.guestName} is already assigned to {confirmDialog?.currentTable}. 
              Would you like to move them to the new table?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmMove}>
              Move to New Table
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
