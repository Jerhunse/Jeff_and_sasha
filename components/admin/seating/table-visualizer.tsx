"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type Seat = {
  id: string
  tableId: string
  guestId: string
  seatNumber: number | null
  notes: string | null
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

interface TableVisualizerProps {
  table: Table
  onRemoveGuest: (seatId: string, guestId: string, tableId: string) => void
  onSwapSeats?: (tableId: string, seatId1: string, seatId2: string) => Promise<void>
  onMoveSeatToPosition?: (tableId: string, seatId: string, seatNumber: number) => Promise<void>
  onAssignGuestToSeat?: (tableId: string, guestId: string, seatNumber: number) => Promise<void>
}

export function TableVisualizer({ table, onRemoveGuest, onSwapSeats, onMoveSeatToPosition, onAssignGuestToSeat }: TableVisualizerProps) {
  if (table.shape === "rectangular") {
    return (
      <RectangularTableView
        table={table}
        onRemoveGuest={onRemoveGuest}
        onSwapSeats={onSwapSeats}
        onMoveSeatToPosition={onMoveSeatToPosition}
        onAssignGuestToSeat={onAssignGuestToSeat}
      />
    )
  }
  return (
    <RoundTableView
      table={table}
      onRemoveGuest={onRemoveGuest}
      onSwapSeats={onSwapSeats}
      onMoveSeatToPosition={onMoveSeatToPosition}
      onAssignGuestToSeat={onAssignGuestToSeat}
    />
  )
}

function RoundTableView({ table, onRemoveGuest, onSwapSeats, onMoveSeatToPosition, onAssignGuestToSeat }: TableVisualizerProps) {
  const capacity = table.capacity
  const [draggedSeatId, setDraggedSeatId] = React.useState<string | null>(null)
  
  const handleDragStart = (e: React.DragEvent, seatId: string) => {
    setDraggedSeatId(seatId)
    e.dataTransfer.effectAllowed = "move"
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }
  
  const handleDrop = async (e: React.DragEvent, targetSeatId: string | null, targetPosition: number) => {
    e.preventDefault()
    const guestIdFromList = e.dataTransfer.getData("guestId")

    // Drop from guest list onto an empty slot
    if (guestIdFromList && !targetSeatId && onAssignGuestToSeat) {
      await onAssignGuestToSeat(table.id, guestIdFromList.replace(/^(.+)-plus-one-\d+$/, "$1"), targetPosition + 1)
      setDraggedSeatId(null)
      return
    }

    if (!draggedSeatId || draggedSeatId === targetSeatId) {
      setDraggedSeatId(null)
      return
    }
    
    // All seat moves go through onMoveSeatToPosition (handles both empty and occupied targets)
    if (onMoveSeatToPosition) {
      await onMoveSeatToPosition(table.id, draggedSeatId, targetPosition + 1)
    }
    
    setDraggedSeatId(null)
  }

  // Build position-indexed array based on seatNumber (like RectangularTableView does)
  type ExpandedEntry = {
    seat: Seat
    isMainGuest: boolean
    plusOneName: string | null
    displayName: string
    initials: string
  }
  const slots: (ExpandedEntry | undefined)[] = Array.from({ length: capacity }, () => undefined)
  
  // Map seats with explicit seatNumber to their positions
  const seatsWithNumber = table.seats.filter(s => s.seatNumber != null) as Array<Seat & { seatNumber: number }>
  seatsWithNumber.forEach(seat => {
    const i = seat.seatNumber - 1  // seatNumber is 1-indexed, array is 0-indexed
    if (i >= 0 && i < capacity) {
      const displayName = `${seat.guest.firstName} ${seat.guest.lastName}`.trim()
      slots[i] = {
        seat,
        isMainGuest: true,
        plusOneName: null,
        displayName,
        initials: `${seat.guest.firstName.charAt(0)}${seat.guest.lastName.charAt(0)}`,
      }
    }
  })
  
  // Fill remaining empty slots with seats that don't have seatNumber
  const seatsWithoutNumber = table.seats.filter(s => s.seatNumber == null)
  let nextSlot = 0
  seatsWithoutNumber.forEach(seat => {
    while (nextSlot < capacity && slots[nextSlot] != null) nextSlot++
    if (nextSlot < capacity) {
      const displayName = `${seat.guest.firstName} ${seat.guest.lastName}`.trim()
      slots[nextSlot] = {
        seat,
        isMainGuest: true,
        plusOneName: null,
        displayName,
        initials: `${seat.guest.firstName.charAt(0)}${seat.guest.lastName.charAt(0)}`,
      }
      nextSlot++
    }
  })
  
  const expandedSeats = slots

  // Calculate positions for guests around the circle
  const positions = Array.from({ length: capacity }, (_, i) => {
    const angle = (i * 360) / capacity - 90 // Start from top
    const radian = (angle * Math.PI) / 180
    const radius = 42 // percentage
    
    return {
      x: 50 + radius * Math.cos(radian),
      y: 50 + radius * Math.sin(radian),
      rotation: angle + 90,
    }
  })

  return (
    <div className="relative w-full aspect-square max-w-2xl mx-auto">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Table center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="size-32 md:size-40 rounded-full border-4 border-primary bg-background flex flex-col items-center justify-center shadow-2xl z-10">
          <span className="text-4xl md:text-5xl font-bold font-serif">{table.name.replace("Table ", "")}</span>
          <span className="text-xs text-muted-foreground mt-1">
            {table._count.seats}/{capacity}
          </span>
        </div>
      </div>

      {/* Guest positions */}
      {positions.map((pos, index) => {
        const expandedSeat = expandedSeats[index]
        const isEmpty = !expandedSeat

        return (
          <div
            key={index}
            className="absolute"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {isEmpty ? (
              <div 
                className="flex flex-col items-center gap-1"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, null, index)}
              >
                <div className="size-12 md:size-14 rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/20 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">{index + 1}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Empty</span>
              </div>
            ) : (
              <div 
                className="flex flex-col items-center gap-1 group"
                draggable={expandedSeat.isMainGuest}
                onDragStart={(e) => expandedSeat.isMainGuest && handleDragStart(e, expandedSeat.seat.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, expandedSeat.seat.id, index)}
              >
                <div className="relative">
                  <div className={cn(
                    "size-12 md:size-14 rounded-full border-2 flex items-center justify-center shadow-lg",
                    !expandedSeat.isMainGuest ? "border-blue-500 bg-blue-500/20" : "border-primary bg-primary/10 cursor-move"
                  )}>
                    <span className="text-xs font-medium text-center leading-tight px-1">
                      {expandedSeat.initials}
                    </span>
                  </div>
                  {expandedSeat.isMainGuest && (
                    <button
                      onClick={() => onRemoveGuest(expandedSeat.seat.id, expandedSeat.seat.guestId, table.id)}
                      className="absolute -top-1 -right-1 size-5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="text-center max-w-[100px]">
                  <p className="text-[10px] font-medium leading-tight">
                    {expandedSeat.displayName}
                  </p>
                  {!expandedSeat.isMainGuest && (
                    <p className="text-[9px] text-blue-600">Plus One</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Connecting circle */}
      <svg className="absolute inset-0 pointer-events-none opacity-10" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2 2"
        />
      </svg>
    </div>
  )
}

function RectangularTableView({ table, onRemoveGuest, onSwapSeats, onMoveSeatToPosition, onAssignGuestToSeat }: TableVisualizerProps) {
  const capacity = table.capacity
  const [draggedSeatId, setDraggedSeatId] = React.useState<string | null>(null)
  
  const handleDragStart = (e: React.DragEvent, seatId: string) => {
    setDraggedSeatId(seatId)
    e.dataTransfer.effectAllowed = "move"
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }
  
  const handleDrop = async (e: React.DragEvent, targetSeatId: string | null, targetPosition: number) => {
    e.preventDefault()
    const guestIdFromList = e.dataTransfer.getData("guestId")

    // Drop from guest list onto an empty slot
    if (guestIdFromList && !targetSeatId && onAssignGuestToSeat) {
      const guestId = guestIdFromList.replace(/^(.+)-plus-one-\d+$/, "$1")
      await onAssignGuestToSeat(table.id, guestId, targetPosition + 1)
      setDraggedSeatId(null)
      return
    }

    if (!draggedSeatId || draggedSeatId === targetSeatId) {
      setDraggedSeatId(null)
      return
    }
    
    // All seat moves go through onMoveSeatToPosition (handles both empty and occupied targets)
    if (onMoveSeatToPosition) {
      await onMoveSeatToPosition(table.id, draggedSeatId, targetPosition + 1)
    }
    
    setDraggedSeatId(null)
  }

  // Build one entry per slot: position i shows the seat with seatNumber i+1 (enables move-to-seat)
  type ExpandedEntry = {
    seat: Seat
    isMainGuest: boolean
    plusOneName: string | null
    displayName: string
    initials: string
  }
  const slots: (ExpandedEntry | undefined)[] = Array.from({ length: capacity }, () => undefined)
  const seatsWithNumber = table.seats.filter(s => s.seatNumber != null) as Array<Seat & { seatNumber: number }>
  const seatsWithoutNumber = table.seats.filter(s => s.seatNumber == null)
  seatsWithNumber.forEach(seat => {
    const i = seat.seatNumber - 1
    if (i >= 0 && i < capacity) {
      const guestFullName = `${seat.guest.firstName} ${seat.guest.lastName}`.trim()
      slots[i] = {
        seat,
        isMainGuest: true,
        plusOneName: null,
        displayName: guestFullName,
        initials: `${seat.guest.firstName.charAt(0)}${seat.guest.lastName.charAt(0)}`,
      }
    }
  })
  let nextSlot = 0
  seatsWithoutNumber.forEach(seat => {
    while (nextSlot < capacity && slots[nextSlot] != null) nextSlot++
    if (nextSlot < capacity) {
      const guestFullName = `${seat.guest.firstName} ${seat.guest.lastName}`.trim()
      slots[nextSlot] = {
        seat,
        isMainGuest: true,
        plusOneName: null,
        displayName: guestFullName,
        initials: `${seat.guest.firstName.charAt(0)}${seat.guest.lastName.charAt(0)}`,
      }
      nextSlot++
    }
  })
  const expandedSeats = slots

  // Rectangular head table with seats on BOTH sides of left/right arms
  // Top: 8 seats (3 + groom + bride + 3)
  // Left side: 5 seats on outside AND 5 seats on inside = 10 seats
  // Right side: 5 seats on outside AND 5 seats on inside = 10 seats
  // Interior bottom: 3 seats (facing bride/groom from inside the U)
  // Total: 8 + 10 + 10 + 3 = 31 seats
  const topCount = 8
  const leftOuterCount = 5  // Seats on outside of left arm
  const rightOuterCount = 5 // Seats on outside of right arm
  const bottomInteriorCount = 3 // Seats in interior bottom row

  const topSeats = expandedSeats.slice(0, Math.min(topCount, expandedSeats.length))
  const leftOuterSeats = expandedSeats.slice(topCount, topCount + leftOuterCount)
  const rightOuterSeats = expandedSeats.slice(topCount + leftOuterCount, topCount + leftOuterCount + rightOuterCount)
  const leftInnerSeats = expandedSeats.slice(topCount + leftOuterCount + rightOuterCount, topCount + leftOuterCount + rightOuterCount + leftOuterCount)
  const rightInnerSeats = expandedSeats.slice(topCount + leftOuterCount + rightOuterCount + leftOuterCount, topCount + leftOuterCount + rightOuterCount + leftOuterCount + rightOuterCount)
  const bottomInteriorSeats = expandedSeats.slice(topCount + leftOuterCount + rightOuterCount + leftOuterCount + rightOuterCount, topCount + leftOuterCount + rightOuterCount + leftOuterCount + rightOuterCount + bottomInteriorCount)

  const renderSeat = (
    expandedSeat: {
      seat: Seat
      isMainGuest: boolean
      plusOneName: string | null
      displayName: string
      initials: string
    } | undefined,
    index: number,
    position: 'top' | 'left-outer' | 'right-outer' | 'left-inner' | 'right-inner' | 'bottom-interior',
    positionIndex: number
  ) => {
    // Check if this seat has BRIDE or GROOM in notes
    const isBrideByNotes = expandedSeat?.seat.notes === "BRIDE"
    const isGroomByNotes = expandedSeat?.seat.notes === "GROOM"
    
    // Hardcode: Check if this is Jeffery Erhunse (Groom) or Sasha Contreras (Bride). Candida Contreras is Mother of the Bride.
    const isJefferyErhunse = expandedSeat?.isMainGuest && 
                             expandedSeat?.seat.guest.firstName === "Jeffery" && 
                             expandedSeat?.seat.guest.lastName === "Erhunse"
    const isSashaContreras = (expandedSeat?.isMainGuest && 
                              expandedSeat?.seat.guest.firstName === "Sasha" && 
                              expandedSeat?.seat.guest.lastName === "Contreras") ||
                             (!expandedSeat?.isMainGuest && 
                              expandedSeat?.displayName === "Sasha Contreras")
    
    // Bride and groom are at positions 3 and 4 in the top row (center of 8 seats)
    // OR they are hardcoded by name OR marked in notes
    const isGroom = (position === 'top' && positionIndex === 3) || isGroomByNotes || isJefferyErhunse
    const isBride = (position === 'top' && positionIndex === 4) || isBrideByNotes || isSashaContreras
    const isVIP = isBride || isGroom

    if (!expandedSeat) {
      return (
        <div
          key={`empty-${position}-${positionIndex}`}
          className={cn(
            "flex flex-col items-center gap-0.5",
            (onMoveSeatToPosition || onAssignGuestToSeat) && "cursor-copy"
          )}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, null, index)}
        >
          {isVIP && (
            <span className="text-[8px] uppercase tracking-wider text-primary font-semibold mb-0.5">
              {isGroom ? "Groom" : "Bride"}
            </span>
          )}
          <div className={cn(
            "size-8 rounded-full border-2 border-dashed flex items-center justify-center",
            isVIP ? "border-primary/50 bg-primary/5" : "border-muted-foreground/30 bg-muted/20"
          )}>
            <span className="text-[9px] text-muted-foreground">{index + 1}</span>
          </div>
          <span className="text-[7px] text-muted-foreground">Empty</span>
        </div>
      )
    }

    return (
      <div 
        key={`${expandedSeat.seat.id}-${expandedSeat.isMainGuest ? 'main' : expandedSeat.plusOneName}`} 
        className="flex flex-col items-center gap-0.5 group"
        draggable={expandedSeat.isMainGuest}
        onDragStart={(e) => expandedSeat.isMainGuest && handleDragStart(e, expandedSeat.seat.id)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, expandedSeat.seat.id, index)}
      >        {isVIP && expandedSeat.isMainGuest && (
          <span className="text-[8px] uppercase tracking-wider text-primary font-semibold mb-0.5">
            {isGroom ? "Groom" : "Bride"}
          </span>
        )}
        <div className="relative">
          <div className={cn(
            "size-8 rounded-full border-2 flex items-center justify-center shadow-md",
            !expandedSeat.isMainGuest
              ? "border-blue-500 bg-blue-500/20" 
              : isVIP 
                ? "border-primary bg-primary/20 cursor-move"
                : "border-primary bg-primary/10 cursor-move"
          )}>
            <span className={cn("text-[9px] font-bold", isVIP && expandedSeat.isMainGuest && "text-primary")}>
              {expandedSeat.initials}
            </span>
          </div>
          {expandedSeat.isMainGuest && (
            <button
              onClick={() => onRemoveGuest(expandedSeat.seat.id, expandedSeat.seat.guestId, table.id)}
              className="absolute -top-1 -right-1 size-3.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
            >
              <X className="h-2 w-2" />
            </button>
          )}
        </div>
        <div className="text-center max-w-[60px]">
          <p className={cn(
            "text-[8px] font-medium leading-tight",
            isVIP && expandedSeat.isMainGuest && "font-bold text-primary"
          )}>
            {expandedSeat.displayName}
          </p>
          {!expandedSeat.isMainGuest && (
            <p className="text-[6px] text-blue-600">Plus One</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="w-full p-3">
        {/* Title */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center mb-1">
            <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-serif italic text-primary">The Wedding Party</h3>
        </div>

        {/* U-shaped table (open at bottom) with all seats */}
        <div className="flex flex-col items-center w-full">
          {/* Middle section with left arm, center space, and right arm - render first to get width */}
          <div className="relative flex items-stretch justify-center" style={{ marginBottom: '-2px' }}>
            {/* Left side - seats on both sides */}
            <div className="flex gap-0">
              {/* Outer seats (left side) */}
              <div className="flex flex-col justify-start gap-1 pr-0.5">
                {Array.from({ length: leftOuterCount }, (_, i) => {
                  const expandedSeat = leftOuterSeats[i]
                  return renderSeat(expandedSeat, topCount + i, 'left-outer', i)
                })}
              </div>
              {/* Left table arm */}
              <div className="w-8 bg-primary/10 border-2 border-r-0 border-l-0 border-t-0 border-primary/30 rounded-bl-lg" style={{ minHeight: '200px' }}>
              </div>
              {/* Inner seats (left side) */}
              <div className="flex flex-col justify-start gap-1 pl-0.5">
                {Array.from({ length: leftOuterCount }, (_, i) => {
                  const expandedSeat = leftInnerSeats[i]
                  return renderSeat(expandedSeat, topCount + leftOuterCount + rightOuterCount + i, 'left-inner', i)
                })}
              </div>
            </div>

            {/* Center space (open area) */}
            <div className="flex items-center justify-center px-2" style={{ minWidth: '120px', maxWidth: '140px' }}>
              <div className="text-center">
                <div className="flex gap-2 justify-center mb-1">
                  <p className="text-[10px] font-serif tracking-wider text-primary/60">GROOM</p>
                  <p className="text-[10px] font-serif tracking-wider text-primary/60">BRIDE</p>
                </div>
                <h3 className="text-sm font-serif font-bold mb-0.5 text-primary">{table.name}</h3>
                <p className="text-[7px] text-muted-foreground uppercase tracking-wider">
                  Main Table
                </p>
                <p className="text-[7px] text-muted-foreground mt-0.5">
                  {table._count.seats} / {capacity} seated
                </p>
              </div>
            </div>

            {/* Interior bottom row - 3 seats facing bride/groom */}
            {bottomInteriorCount > 0 && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full" style={{ marginTop: '80px' }}>
                <div className="flex justify-center items-start gap-1">
                  {Array.from({ length: bottomInteriorCount }, (_, i) => {
                    const expandedSeat = bottomInteriorSeats[i]
                    const seatIndex = topCount + leftOuterCount + rightOuterCount + leftOuterCount + rightOuterCount + i
                    return renderSeat(expandedSeat, seatIndex, 'bottom-interior', i)
                  })}
                </div>
              </div>
            )}

            {/* Right side - seats on both sides */}
            <div className="flex gap-0">
              {/* Inner seats (right side) */}
              <div className="flex flex-col justify-start gap-1 pr-0.5">
                {Array.from({ length: rightOuterCount }, (_, i) => {
                  const expandedSeat = rightInnerSeats[i]
                  return renderSeat(expandedSeat, topCount + leftOuterCount + rightOuterCount + leftOuterCount + i, 'right-inner', i)
                })}
              </div>
              {/* Right table arm */}
              <div className="w-8 bg-primary/10 border-2 border-r-0 border-l-0 border-t-0 border-primary/30 rounded-br-lg" style={{ minHeight: '200px' }}>
              </div>
              {/* Outer seats (right side) */}
              <div className="flex flex-col justify-start gap-1 pl-0.5">
                {Array.from({ length: rightOuterCount }, (_, i) => {
                  const expandedSeat = rightOuterSeats[i]
                  return renderSeat(expandedSeat, topCount + leftOuterCount + i, 'right-outer', i)
                })}
              </div>
            </div>
          </div>

          {/* Top section - 8 seats attached to top of table - width matches the middle section */}
          <div className="flex flex-col items-center">
            {/* Top table bar - width matches exactly the width of arms */}
            <div className="bg-primary/10 border-2 border-b-0 border-primary/30 rounded-t-lg" style={{ height: '32px', width: 'calc(100% - 2px)' }}>
            </div>
            {/* Top seats */}
            <div className="flex justify-center items-start gap-1 mt-0">
              {Array.from({ length: topCount }, (_, i) => {
                const expandedSeat = topSeats[i]
                return renderSeat(expandedSeat, i, 'top', i)
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
