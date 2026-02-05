"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Search,
  Download,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Send,
  Eye,
  Filter
} from "lucide-react"
import { toast } from "sonner"

interface RSVPResponse {
  id: string
  status: string
  answersJSON: string | null
  message: string | null
  plusOneName: string | null
  respondedAt: Date
}

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  inviteToken: string
  allowPlusOne: boolean
  maxGuestsAllowed: number
  notes: string | null
  rsvpResponses: RSVPResponse[]
}

interface Couple {
  id: string
  partner1Name: string
  partner2Name: string
  weddingDate: Date
  slug: string
  primaryColor: string
  secondaryColor: string
}

interface Props {
  initialGuests: Guest[]
  couple: Couple
}

export function RSVPDashboardClient({ initialGuests, couple }: Props) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [sendingEmail, setSendingEmail] = useState(false)

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshGuests(true) // true = silent refresh (no toast)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const refreshGuests = async (silent = false) => {
    setIsRefreshing(true)
    try {
      const response = await fetch(`/api/admin/guests?coupleId=${couple.id}`)
      if (response.ok) {
        const data = await response.json()
        setGuests(data.guests)
        if (!silent) {
          toast.success("Guest list refreshed!")
        }
      }
    } catch (error) {
      console.error("Failed to refresh guests:", error)
      if (!silent) {
        toast.error("Failed to refresh guest list")
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  // Calculate statistics
  const stats = useMemo(() => {
    // Total includes household quantities (maxGuestsAllowed)
    const total = guests.reduce((sum, g) => sum + g.maxGuestsAllowed, 0)
    const responded = guests.filter(g => g.rsvpResponses.length > 0).length
    const attending = guests.filter(g => 
      g.rsvpResponses.length > 0 && g.rsvpResponses[0].status === "YES"
    ).length
    const declined = guests.filter(g => 
      g.rsvpResponses.length > 0 && g.rsvpResponses[0].status === "NO"
    ).length
    const pending = guests.length - responded

    return { total, responded, attending, declined, pending }
  }, [guests])

  // Filter guests
  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      const matchesSearch = 
        guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email?.toLowerCase().includes(searchTerm.toLowerCase())

      const latestResponse = guest.rsvpResponses[0]
      const status = latestResponse ? latestResponse.status : "PENDING"

      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "pending" && !latestResponse) ||
        (statusFilter === "yes" && status === "YES") ||
        (statusFilter === "no" && status === "NO") ||
        (statusFilter === "maybe" && status === "MAYBE")

      return matchesSearch && matchesStatus
    })
  }, [guests, searchTerm, statusFilter])

  const getRSVPStatus = (guest: Guest) => {
    if (guest.rsvpResponses.length === 0) {
      return { label: "Pending", variant: "secondary" as const, icon: Clock }
    }
    
    const status = guest.rsvpResponses[0].status
    switch (status) {
      case "YES":
        return { label: "Attending", variant: "default" as const, icon: CheckCircle }
      case "NO":
        return { label: "Declined", variant: "destructive" as const, icon: XCircle }
      case "MAYBE":
        return { label: "Maybe", variant: "outline" as const, icon: Clock }
      default:
        return { label: "Pending", variant: "secondary" as const, icon: Clock }
    }
  }

  const handleViewDetails = (guest: Guest) => {
    setSelectedGuest(guest)
  }

  const handleEmailGuest = (guest: Guest) => {
    if (!guest.email) {
      toast.error("This guest does not have an email address.")
      return
    }
    setSelectedGuest(guest)
    setEmailSubject(`Message from ${couple.partner1Name} & ${couple.partner2Name}`)
    setEmailBody(`Dear ${guest.firstName},\n\n\n\nBest regards,\n${couple.partner1Name} & ${couple.partner2Name}`)
    setEmailDialogOpen(true)
  }

  const handleSendEmail = async () => {
    if (!selectedGuest?.email) return
    
    setSendingEmail(true)
    try {
      const response = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedGuest.email,
          subject: emailSubject,
          body: emailBody,
          guestName: `${selectedGuest.firstName} ${selectedGuest.lastName}`,
          coupleId: couple.id
        })
      })

      if (response.ok) {
        toast.success("Email sent successfully!")
        setEmailDialogOpen(false)
        setEmailSubject("")
        setEmailBody("")
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to send email")
      }
    } catch (error) {
      console.error("Error sending email:", error)
      toast.error("Failed to send email")
    } finally {
      setSendingEmail(false)
    }
  }

  const handleExportCSV = () => {
    const csvData = [
      ["First Name", "Last Name", "Email", "Phone", "RSVP Status", "Plus One Allowed", "Response Date", "Message"]
    ]

    guests.forEach(guest => {
      const latestResponse = guest.rsvpResponses[0]
      const status = latestResponse ? latestResponse.status : "PENDING"
      const responseDate = latestResponse ? new Date(latestResponse.respondedAt).toLocaleDateString() : "N/A"
      const message = latestResponse?.message || ""

      csvData.push([
        guest.firstName,
        guest.lastName,
        guest.email || "",
        guest.phone || "",
        status,
        guest.allowPlusOne ? "Yes" : "No",
        responseDate,
        message
      ])
    })

    const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `rsvp-list-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success("CSV exported successfully!")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-serif tracking-tight">RSVP Dashboard</h1>
        <p className="text-muted-foreground">
          Manage and track all guest RSVPs for {couple.partner1Name} & {couple.partner2Name}&apos;s wedding
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attending</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.attending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Declined</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search guests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="yes">Attending</SelectItem>
                  <SelectItem value="no">Declined</SelectItem>
                  <SelectItem value="maybe">Maybe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshGuests()}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plus One</TableHead>
                  <TableHead>Response Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No guests found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGuests.map((guest) => {
                    const status = getRSVPStatus(guest)
                    const StatusIcon = status.icon
                    const latestResponse = guest.rsvpResponses[0]
                    const responseDate = latestResponse 
                      ? new Date(latestResponse.respondedAt).toLocaleDateString()
                      : "N/A"

                    return (
                      <TableRow key={guest.id}>
                        <TableCell className="font-medium">
                          {guest.firstName} {guest.lastName}
                        </TableCell>
                        <TableCell>{guest.email || <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell>{guest.phone || <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {guest.allowPlusOne ? (
                            <Badge variant="outline">
                              {latestResponse?.plusOneName || "Allowed"}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>{responseDate}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(guest)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {guest.email && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEmailGuest(guest)}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Guest Details Dialog */}
      <Dialog open={!!selectedGuest && !emailDialogOpen} onOpenChange={(open) => !open && setSelectedGuest(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedGuest && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif">
                  {selectedGuest.firstName} {selectedGuest.lastName}
                </DialogTitle>
                <DialogDescription>Guest Information and RSVP Details</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{selectedGuest.email || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="font-medium">{selectedGuest.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Plus One Allowed</Label>
                      <p className="font-medium">{selectedGuest.allowPlusOne ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Max Guests</Label>
                      <p className="font-medium">{selectedGuest.maxGuestsAllowed}</p>
                    </div>
                  </div>
                </div>

                {/* RSVP Response */}
                {selectedGuest.rsvpResponses.length > 0 ? (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      RSVP Response
                    </h3>
                    {selectedGuest.rsvpResponses.map((response) => {
                      const status = getRSVPStatus(selectedGuest)
                      const StatusIcon = status.icon
                      let answers: any = {}
                      try {
                        answers = response.answersJSON ? JSON.parse(response.answersJSON) : {}
                      } catch (e) {
                        console.error("Failed to parse answers:", e)
                      }

                      return (
                        <div key={response.id} className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Badge variant={status.variant} className="flex items-center gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Responded on {new Date(response.respondedAt).toLocaleDateString()} at{" "}
                              {new Date(response.respondedAt).toLocaleTimeString()}
                            </span>
                          </div>

                          {response.plusOneName && (
                            <div>
                              <Label className="text-muted-foreground">Plus One</Label>
                              <p className="font-medium">{response.plusOneName}</p>
                            </div>
                          )}

                          {Object.keys(answers).length > 0 && (
                            <div>
                              <Label className="text-muted-foreground">Additional Details</Label>
                              <div className="mt-2 space-y-2">
                                {Object.entries(answers).map(([key, value]) => (
                                  <div key={key} className="text-sm">
                                    <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>{" "}
                                    <span>{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {response.message && (
                            <div>
                              <Label className="text-muted-foreground">Message</Label>
                              <p className="mt-1 text-sm bg-muted p-3 rounded-md italic">
                                &quot;{response.message}&quot;
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No RSVP response yet</p>
                  </div>
                )}

                {/* Notes */}
                {selectedGuest.notes && (
                  <div>
                    <h3 className="font-semibold mb-3">Internal Notes</h3>
                    <p className="text-sm bg-muted p-3 rounded-md">{selectedGuest.notes}</p>
                  </div>
                )}

                {/* Invite Link */}
                <div>
                  <Label className="text-muted-foreground">Personal RSVP Link</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      readOnly
                      value={`${window.location.origin}/rsvp/${selectedGuest.inviteToken}`}
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/rsvp/${selectedGuest.inviteToken}`
                        )
                        toast.success("Link copied to clipboard!")
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                {selectedGuest.email && (
                  <Button onClick={() => handleEmailGuest(selectedGuest)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Email to {selectedGuest?.firstName} {selectedGuest?.lastName}</DialogTitle>
            <DialogDescription>
              Compose and send an email to this guest
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-to">To</Label>
              <Input id="email-to" value={selectedGuest?.email || ""} disabled />
            </div>
            <div>
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
            <div>
              <Label htmlFor="email-body">Message</Label>
              <Textarea
                id="email-body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Email message"
                rows={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={sendingEmail || !emailSubject || !emailBody}>
              <Send className="h-4 w-4 mr-2" />
              {sendingEmail ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
