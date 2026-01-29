"use client"

import { useState } from "react"
import { Guest, Tag, GuestTag, Household, RsvpStatus } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Users,
  Baby,
  Star,
  Key,
  Copy,
} from "lucide-react"
import Link from "next/link"

type GuestWithRelations = Guest & {
  tags: (GuestTag & {
    tag: Tag
  })[]
  household: Household | null
  address?: {
    city: string
    state: string
    postal: string
    line1: string
  } | null
  rsvpResponses?: Array<{
    id: string
    status: RsvpStatus
    respondedAt: Date
  }>
  _count: {
    rsvpResponses: number
  }
}

interface GuestListTableProps {
  guests: GuestWithRelations[]
  tags: Tag[]
  currentPage: number
  totalPages: number
  totalCount: number
}

function getRsvpStatusBadge(status: RsvpStatus | null | undefined) {
  // Map Prisma enum values to display values
  const statusMap: Record<string, RsvpStatus> = {
    YES: "ATTENDING" as RsvpStatus,
    NO: "DECLINED" as RsvpStatus,
    MAYBE: "MAYBE" as RsvpStatus,
    PENDING: "PENDING" as RsvpStatus,
  }
  
  // Convert Prisma enum to display enum, default to PENDING
  const displayStatus = status ? (statusMap[status] || "PENDING" as RsvpStatus) : ("PENDING" as RsvpStatus)
  
  const variants: Record<string, { variant: any; label: string }> = {
    PENDING: { variant: "secondary", label: "Pending" },
    ATTENDING: { variant: "default", label: "Attending" },
    DECLINED: { variant: "destructive", label: "Declined" },
    MAYBE: { variant: "outline", label: "Maybe" },
  }

  const config = variants[displayStatus] || variants.PENDING
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export function GuestListTable({
  guests,
  tags,
  currentPage,
  totalPages,
  totalCount,
}: GuestListTableProps) {
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set())

  const toggleGuestSelection = (guestId: string) => {
    const newSelection = new Set(selectedGuests)
    if (newSelection.has(guestId)) {
      newSelection.delete(guestId)
    } else {
      newSelection.add(guestId)
    }
    setSelectedGuests(newSelection)
  }

  const toggleAllGuests = () => {
    if (selectedGuests.size === guests.length) {
      setSelectedGuests(new Set())
    } else {
      setSelectedGuests(new Set(guests.map((g) => g.id)))
    }
  }

  const showingFrom = (currentPage - 1) * 50 + 1
  const showingTo = Math.min(currentPage * 50, totalCount)

  return (
    <div className="space-y-4">
      {selectedGuests.size > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedGuests.size} guest{selectedGuests.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Add Tag
              </Button>
              <Button variant="outline" size="sm">
                Bulk Edit
              </Button>
              <Button variant="outline" size="sm">
                Send Invite
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedGuests(new Set())}
              >
                Clear
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedGuests.size === guests.length && guests.length > 0}
                    onCheckedChange={toggleAllGuests}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Household</TableHead>
                <TableHead>RSVP Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No guests found. Start by importing or adding guests manually.
                  </TableCell>
                </TableRow>
              ) : (
                guests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedGuests.has(guest.id)}
                        onCheckedChange={() => toggleGuestSelection(guest.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <Link
                            href={`/admin/guests/${guest.id}`}
                            className="font-medium hover:underline"
                          >
                            {guest.firstName} {guest.lastName}
                          </Link>
                          <div className="flex items-center gap-1 mt-0.5">
                            {guest.isVIP && (
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            )}
                            {guest.isChild && (
                              <Badge variant="secondary" className="text-xs">
                                <Baby className="h-3 w-3 mr-1" />
                                Child
                              </Badge>
                            )}
                            {guest.isPrimaryContact && guest.household && (
                              <Badge variant="outline" className="text-xs">
                                Primary
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {guest.email && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">{guest.email}</span>
                          </div>
                        )}
                        {guest.phone && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{guest.phone}</span>
                          </div>
                        )}
                        {guest.address && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{guest.address.city}, {guest.address.state}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {guest.household ? (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{guest.household.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getRsvpStatusBadge(guest.rsvpResponses?.[0]?.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {guest.tags.length === 0 ? (
                          <span className="text-sm text-muted-foreground">-</span>
                        ) : (
                          guest.tags.map((guestTag) => (
                            <Badge
                              key={guestTag.id}
                              variant="outline"
                              style={{
                                borderColor: guestTag.tag.color,
                                color: guestTag.tag.color,
                              }}
                              className="text-xs"
                            >
                              {guestTag.tag.name}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        {guest.allowPlusOne && (
                          <Badge variant="secondary" className="text-xs">
                            +1
                          </Badge>
                        )}
                        {/* Dietary restrictions and accommodation info are stored in RSVP responses, not directly on Guest */}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/guests/${guest.id}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/guests/${guest.id}/edit`}>
                              Edit Guest
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => {
                              try {
                                const response = await fetch(
                                  `/api/admin/guests/${guest.id}/generate-invite-code`,
                                  { method: "POST" }
                                )

                                const data = await response.json()

                                if (data.success) {
                                  // Copy to clipboard
                                  await navigator.clipboard.writeText(data.rsvpUrl)
                                  alert(
                                    `Invite code generated!\n\nCode: ${data.inviteCode}\n\nRSVP URL copied to clipboard:\n${data.rsvpUrl}`
                                  )
                                } else {
                                  alert(`Error: ${data.error}`)
                                }
                              } catch (error) {
                                console.error("Error generating invite code:", error)
                                alert("Failed to generate invite code. Please try again.")
                              }
                            }}
                          >
                            <Key className="h-4 w-4 mr-2" />
                            Generate Invite Code
                          </DropdownMenuItem>
                          {guest.inviteToken && (
                            <DropdownMenuItem
                              onClick={async () => {
                                const baseUrl =
                                  process.env.NEXT_PUBLIC_APP_URL ||
                                  window.location.origin
                                const rsvpUrl = `${baseUrl}/rsvp/${guest.inviteToken}`
                                await navigator.clipboard.writeText(rsvpUrl)
                                alert(`RSVP URL copied to clipboard:\n${rsvpUrl}`)
                              }}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy RSVP Link
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>Send Invite</DropdownMenuItem>
                          <DropdownMenuItem>Add to Household</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Delete Guest
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {showingFrom} to {showingTo} of {totalCount} guests
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                asChild
              >
                <Link href={`/admin/guests?page=${currentPage - 1}`}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                asChild
              >
                <Link href={`/admin/guests?page=${currentPage + 1}`}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

