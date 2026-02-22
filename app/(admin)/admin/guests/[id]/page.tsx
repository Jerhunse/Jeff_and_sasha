import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { CopyButton } from "./copy-button"
import { GuestTagManager } from "@/components/admin/guest-tag-manager"
import {
  Mail,
  Phone,
  MapPin,
  Users,
  Baby,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  ArrowLeft,
  Edit,
  Send,
  Key
} from "lucide-react"

interface GuestDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function GuestDetailPage({ params }: GuestDetailPageProps) {
  const session = await auth()

  if (!session?.user?.coupleId) {
    redirect("/auth/signin")
  }

  const { id } = await params

  // Fetch the guest with all related data
  const guest = await prisma.guest.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      household: {
        include: {
          guests: {
            where: {
              id: { not: id }
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      },
      rsvpResponses: {
        orderBy: { respondedAt: 'desc' },
      },
      parentGuest: {
        select: { id: true, firstName: true, lastName: true },
      },
      plusOnes: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
    },
  })

  // Check if guest exists and belongs to the couple
  if (!guest || guest.coupleId !== session.user.coupleId) {
    notFound()
  }

  // Get RSVP status
  const latestResponse = guest.rsvpResponses[0]
  const getRSVPStatus = () => {
    if (!latestResponse) {
      return { label: "Pending", variant: "secondary" as const, icon: Clock }
    }
    
    switch (latestResponse.status) {
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

  const status = getRSVPStatus()
  const StatusIcon = status.icon

  // Parse RSVP answers if available
  let answers: any = {}
  let confirmedGuestNames: string[] = []
  let confirmedGuestCount = 0
  if (latestResponse?.answersJSON) {
    try {
      answers = JSON.parse(latestResponse.answersJSON)
      confirmedGuestNames = answers.allGuestNames || []
      confirmedGuestCount = answers.confirmedGuestCount || 0
    } catch (e) {
      console.error("Failed to parse answers:", e)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/guests">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-4xl font-bold">
                {guest.firstName} {guest.lastName}
              </h1>
              <div className="flex items-center gap-2">
                {guest.isVIP && (
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                )}
                {guest.isChild && (
                  <Badge variant="secondary">
                    <Baby className="h-3 w-3 mr-1" />
                    Child
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-muted-foreground">Guest Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/guests/${guest.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>How to reach this guest</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {guest.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{guest.email}</p>
                </div>
              </div>
            )}
            {guest.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{guest.phone}</p>
                </div>
              </div>
            )}
            {(!guest.email && !guest.phone) && (
              <p className="text-sm text-muted-foreground">No contact information provided</p>
            )}
          </CardContent>
        </Card>

        {/* Guest Details */}
        <Card>
          <CardHeader>
            <CardTitle>Guest Details</CardTitle>
            <CardDescription>Additional information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Household Size</Label>
              <div className="flex items-center gap-2 mt-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{guest.maxGuestsAllowed} {guest.maxGuestsAllowed === 1 ? 'person' : 'people'}</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Plus One Allowed</Label>
              <p className="font-medium">{guest.allowPlusOne ? "Yes" : "No"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Tags</Label>
              <div className="mt-2">
                <GuestTagManager guestId={guest.id} currentTags={guest.tags} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Household */}
        {guest.household && (
          <Card>
            <CardHeader>
              <CardTitle>Household</CardTitle>
              <CardDescription>Family or group association</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Household Name</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{guest.household.name}</p>
                </div>
              </div>
              {guest.isPrimaryContact && (
                <Badge variant="outline">Primary Contact</Badge>
              )}
              {guest.household.guests.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Other Members</Label>
                  <div className="space-y-2 mt-2">
                    {guest.household.guests.map((member) => (
                      <Link
                        key={member.id}
                        href={`/admin/guests/${member.id}`}
                        className="block text-sm hover:underline"
                      >
                        {member.firstName} {member.lastName}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Plus Ones / Parent Guest Relationship */}
        {(guest.plusOnes.length > 0 || guest.parentGuest) && (
          <Card>
            <CardHeader>
              <CardTitle>Guest Connections</CardTitle>
              <CardDescription>Parent-guest and plus-one relationships</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {guest.parentGuest && (
                <div>
                  <Label className="text-muted-foreground">Invited By (Parent Guest)</Label>
                  <div className="mt-2">
                    <Link
                      href={`/admin/guests/${guest.parentGuest.id}`}
                      className="flex items-center gap-2 text-sm hover:underline font-medium"
                    >
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {guest.parentGuest.firstName} {guest.parentGuest.lastName}
                    </Link>
                  </div>
                </div>
              )}
              {guest.plusOnes.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Plus Ones ({guest.plusOnes.length})</Label>
                  <div className="space-y-2 mt-2">
                    {guest.plusOnes.map((po) => (
                      <Link
                        key={po.id}
                        href={`/admin/guests/${po.id}`}
                        className="flex items-center gap-2 text-sm hover:underline"
                      >
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{po.firstName} {po.lastName}</span>
                        {po.email && <span className="text-muted-foreground">({po.email})</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* RSVP Status */}
        <Card>
          <CardHeader>
            <CardTitle>RSVP Status</CardTitle>
            <CardDescription>Response and attendance information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Current Status</Label>
              <Badge variant={status.variant} className="flex items-center gap-1 w-fit mt-2">
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
            </div>
            {latestResponse && (
              <>
                <div>
                  <Label className="text-muted-foreground">Responded On</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">
                      {new Date(latestResponse.respondedAt).toLocaleDateString()} at{" "}
                      {new Date(latestResponse.respondedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {confirmedGuestNames.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">
                      Guest Names ({confirmedGuestCount} {confirmedGuestCount === 1 ? 'guest' : 'guests'})
                    </Label>
                    <div className="space-y-1 mt-2">
                      {confirmedGuestNames.map((name, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{name}</span>
                          {index === 0 && <Badge variant="outline" className="text-xs">Primary</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {latestResponse.plusOneName && !confirmedGuestNames.length && (
                  <div>
                    <Label className="text-muted-foreground">Plus One</Label>
                    <p className="font-medium">{latestResponse.plusOneName}</p>
                  </div>
                )}
                {Object.keys(answers).length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Additional Details</Label>
                    <div className="space-y-2 mt-2">
                      {Object.entries(answers).map(([key, value]) => {
                        // Skip fields we're already displaying
                        if (key === 'allGuestNames' || key === 'confirmedGuestCount') {
                          return null
                        }
                        return (
                          <div key={key} className="text-sm">
                            <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>{" "}
                            <span>{String(value)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                {latestResponse.message && (
                  <div>
                    <Label className="text-muted-foreground">Message</Label>
                    <p className="mt-1 text-sm bg-muted p-3 rounded-md italic">
                      &quot;{latestResponse.message}&quot;
                    </p>
                  </div>
                )}
              </>
            )}
            {!latestResponse && (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No RSVP response yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RSVP Response History */}
      {guest.rsvpResponses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>RSVP History</CardTitle>
            <CardDescription>All responses from this guest</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {guest.rsvpResponses.map((response, index) => {
                const isLatest = index === 0
                return (
                  <div
                    key={response.id}
                    className={`p-4 rounded-lg border ${isLatest ? 'bg-muted/50' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          response.status === "YES" ? "default" :
                          response.status === "NO" ? "destructive" : "outline"
                        }>
                          {response.status === "YES" ? "Attending" :
                           response.status === "NO" ? "Declined" : "Maybe"}
                        </Badge>
                        {isLatest && (
                          <Badge variant="secondary">Latest</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(response.respondedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {response.message && (
                      <p className="text-sm mt-2 italic">&quot;{response.message}&quot;</p>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {guest.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
            <CardDescription>Private notes about this guest</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{guest.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Invite Link */}
      <Card>
        <CardHeader>
          <CardTitle>Personal RSVP Link</CardTitle>
          <CardDescription>Share this unique link with the guest</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              readOnly
              value={`${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/rsvp/${guest.inviteToken}`}
              className="text-sm"
            />
            <CopyButton inviteToken={guest.inviteToken} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Send className="h-4 w-4 mr-2" />
              Send Invite Email
            </Button>
            <Button variant="outline">
              <Key className="h-4 w-4 mr-2" />
              Generate QR Code
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
