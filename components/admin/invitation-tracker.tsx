"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Mail,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import { Guest, Household, Invitation, RsvpStatus } from "@prisma/client"
import { SendInvitationsDialog } from "./send-invitations-dialog"

type GuestWithInvitations = Guest & {
  invitations: Invitation[]
  household: Household | null
}

interface InvitationTrackerProps {
  guests: GuestWithInvitations[]
}

function getInvitationStatusBadge(guest: GuestWithInvitations, type: "STD" | "INVITE") {
  if (type === "STD") {
    if (guest.saveTheDateOpened) {
      return (
        <Badge variant="default" className="gap-1">
          <Eye className="h-3 w-3" />
          Opened
        </Badge>
      )
    }
    if (guest.saveTheDateSent) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Send className="h-3 w-3" />
          Sent
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    )
  } else {
    // INVITE
    if (guest.rsvpStatus !== "PENDING") {
      return (
        <Badge variant="default" className="gap-1 bg-green-600">
          <CheckCircle className="h-3 w-3" />
          Replied
        </Badge>
      )
    }
    if (guest.inviteViewed) {
      return (
        <Badge variant="default" className="gap-1 bg-blue-600">
          <Eye className="h-3 w-3" />
          Opened
        </Badge>
      )
    }
    if (guest.inviteSent) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Send className="h-3 w-3" />
          Sent
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    )
  }
}

function getRsvpStatusBadge(status: RsvpStatus) {
  const variants: Record<RsvpStatus, { variant: any; icon: any; label: string }> = {
    PENDING: {
      variant: "outline",
      icon: Clock,
      label: "Pending",
    },
    ATTENDING: {
      variant: "default",
      icon: CheckCircle,
      label: "Attending",
    },
    DECLINED: {
      variant: "destructive",
      icon: XCircle,
      label: "Declined",
    },
    MAYBE: {
      variant: "secondary",
      icon: AlertCircle,
      label: "Maybe",
    },
  }

  const config = variants[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

export function InvitationTracker({ guests }: InvitationTrackerProps) {
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [sendType, setSendType] = useState<"SAVE_THE_DATE" | "INVITATION">("SAVE_THE_DATE")

  const toggleGuestSelection = (guestId: string) => {
    const newSelection = new Set(selectedGuests)
    if (newSelection.has(guestId)) {
      newSelection.delete(guestId)
    } else {
      newSelection.add(guestId)
    }
    setSelectedGuests(newSelection)
  }

  const toggleAllGuests = (filteredGuests: GuestWithInvitations[]) => {
    if (selectedGuests.size === filteredGuests.length) {
      setSelectedGuests(new Set())
    } else {
      setSelectedGuests(new Set(filteredGuests.map((g) => g.id)))
    }
  }

  // Filter guests
  const filteredGuests = guests.filter((guest) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const fullName = `${guest.firstName} ${guest.lastName}`.toLowerCase()
      const email = guest.email?.toLowerCase() || ""
      if (!fullName.includes(query) && !email.includes(query)) {
        return false
      }
    }

    // Status filter
    if (filterStatus !== "all") {
      switch (filterStatus) {
        case "std-pending":
          if (guest.saveTheDateSent) return false
          break
        case "std-sent":
          if (!guest.saveTheDateSent || guest.saveTheDateOpened) return false
          break
        case "std-opened":
          if (!guest.saveTheDateOpened) return false
          break
        case "invite-pending":
          if (guest.inviteSent) return false
          break
        case "invite-sent":
          if (!guest.inviteSent || guest.inviteViewed) return false
          break
        case "invite-opened":
          if (!guest.inviteViewed || guest.rsvpStatus !== "PENDING") return false
          break
        case "rsvp-replied":
          if (guest.rsvpStatus === "PENDING") return false
          break
        case "rsvp-pending":
          if (guest.rsvpStatus !== "PENDING") return false
          break
      }
    }

    return true
  })

  const handleSendInvitations = (type: "SAVE_THE_DATE" | "INVITATION") => {
    setSendType(type)
    setShowSendDialog(true)
  }

  return (
    <div className="space-y-4">
      {/* Filters & Actions */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Guests</SelectItem>
              <SelectItem value="std-pending">STD - Pending</SelectItem>
              <SelectItem value="std-sent">STD - Sent</SelectItem>
              <SelectItem value="std-opened">STD - Opened</SelectItem>
              <SelectItem value="invite-pending">Invite - Pending</SelectItem>
              <SelectItem value="invite-sent">Invite - Sent</SelectItem>
              <SelectItem value="invite-opened">Invite - Opened</SelectItem>
              <SelectItem value="rsvp-replied">RSVP - Replied</SelectItem>
              <SelectItem value="rsvp-pending">RSVP - Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedGuests.size > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedGuests.size} guest{selectedGuests.size !== 1 ? "s" : ""}{" "}
              selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSendInvitations("SAVE_THE_DATE")}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Save the Date
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSendInvitations("INVITATION")}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Invitation
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

      {/* Guest Table */}
      <Card>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedGuests.size === filteredGuests.length &&
                      filteredGuests.length > 0
                    }
                    onCheckedChange={() => toggleAllGuests(filteredGuests)}
                  />
                </TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Save the Date</TableHead>
                <TableHead>Invitation</TableHead>
                <TableHead>RSVP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No guests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredGuests.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedGuests.has(guest.id)}
                        onCheckedChange={() => toggleGuestSelection(guest.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {guest.firstName} {guest.lastName}
                        </div>
                        {guest.household && (
                          <div className="text-sm text-muted-foreground">
                            {guest.household.name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {guest.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {guest.email}
                          </div>
                        )}
                        {!guest.email && !guest.phone && (
                          <span className="text-muted-foreground">
                            No contact info
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getInvitationStatusBadge(guest, "STD")}
                      {guest.saveTheDateSent && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(guest.saveTheDateSent).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getInvitationStatusBadge(guest, "INVITE")}
                      {guest.inviteSent && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(guest.inviteSent).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {getRsvpStatusBadge(guest.rsvpStatus)}
                      {guest.rsvpDate && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(guest.rsvpDate).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Send Dialog */}
      <SendInvitationsDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        selectedGuestIds={Array.from(selectedGuests)}
        type={sendType}
        onSuccess={() => {
          setSelectedGuests(new Set())
          // Refresh the page
          window.location.reload()
        }}
      />
    </div>
  )
}

