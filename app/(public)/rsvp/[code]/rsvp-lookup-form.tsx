"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Heart, Mail, Phone as PhoneIcon } from "lucide-react"
import { RsvpQrCode } from "@/components/wedding/rsvp-qr-code"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface RsvpLookupFormProps {
  slug: string
}

interface GuestMatch {
  inviteToken: string
  firstName: string
  lastName: string
  phone: string | null
  maxGuestsAllowed: number
}

export function RsvpLookupForm({ slug }: RsvpLookupFormProps) {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [rsvpUrl, setRsvpUrl] = useState("")
  const [multipleMatches, setMultipleMatches] = useState<GuestMatch[]>([])
  const [showMultipleDialog, setShowMultipleDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Get the current URL for the QR code
    if (typeof window !== "undefined") {
      setRsvpUrl(`${window.location.origin}/rsvp/${slug}`)
    }
  }, [slug])

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    setMultipleMatches([])

    const trimmedEmail = email.trim()
    const trimmedPhone = phone.replace(/\D/g, "").trim()
    const trimmedName = name.trim()

    if (!trimmedEmail && !trimmedPhone && !trimmedName) {
      setError("Please enter your email address, phone number, or name")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/rsvp/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          ...(trimmedEmail && { email: trimmedEmail }),
          ...(trimmedPhone && { phone: trimmedPhone }),
          ...(trimmedName && { name: trimmedName }),
        }),
      })

      const data = await response.json()

      if (response.ok && data.found) {
        // Handle multiple matches
        if (data.multiple && data.guests) {
          setMultipleMatches(data.guests)
          setShowMultipleDialog(true)
        } else if (data.source === "supabase" && data.email) {
          router.push(`/rsvp/email/${encodeURIComponent(data.email.toLowerCase())}?slug=${slug}`)
        } else if (data.inviteToken) {
          // Add skipEnvelope parameter to go directly to RSVP form
          router.push(`/rsvp/${data.inviteToken}?skipEnvelope=true`)
        } else if (data.guests && data.guests.length === 1) {
          // Single match from name search - skip envelope
          router.push(`/rsvp/${data.guests[0].inviteToken}?skipEnvelope=true`)
        } else {
          setError("We found your invitation but couldn't load it. Please contact the couple.")
        }
      } else {
        setError(data.error || "We couldn't find an invitation for that email, phone number, or name. You can RSVP now without a code, or contact the couple.")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectGuest = (guest: GuestMatch) => {
    setShowMultipleDialog(false)
    // Add skipEnvelope parameter to go directly to RSVP form
    router.push(`/rsvp/${guest.inviteToken}?skipEnvelope=true`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
            <Heart className="h-8 w-8 text-gold fill-gold" />
          </div>
          <h1 className="font-cursive text-4xl md:text-5xl text-gold mb-2">
            RSVP
          </h1>
          <p className="text-lg text-muted-foreground">
            Find your invitation to get started
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>Find Your Invitation</CardTitle>
            </div>
            <CardDescription>
              Look up by name, email, or phone to RSVP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookupSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter at least one — we&rsquo;ll find your invitation
              </p>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Looking up..." : "Find my invitation"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="mt-6 border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Can&rsquo;t find your invitation?{" "}
            <a
              href={`/${slug}/contact`}
              className="text-gold hover:underline font-medium"
            >
              Contact us
            </a>
          </p>
        </div>

        {/* QR Code Section */}
        {rsvpUrl && (
          <div className="mt-12">
            <RsvpQrCode
              rsvpUrl={rsvpUrl}
              title="Share this QR Code"
              description="Guests can scan this code to quickly access the RSVP page"
              size={220}
            />
          </div>
        )}

        {/* Multiple Matches Dialog */}
        <Dialog open={showMultipleDialog} onOpenChange={setShowMultipleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Multiple Matches Found</DialogTitle>
              <DialogDescription>
                We found multiple guests matching your search. Please select your name:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 mt-4">
              {multipleMatches.map((guest) => (
                <Button
                  key={guest.inviteToken}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => handleSelectGuest(guest)}
                >
                  <div className="flex flex-col items-start">
                    <div className="font-medium">
                      {guest.firstName} {guest.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      {guest.phone && (
                        <span className="flex items-center gap-1">
                          <PhoneIcon className="h-3 w-3" />
                          {guest.phone}
                        </span>
                      )}
                      <span className="text-xs">
                        • {guest.maxGuestsAllowed} guest{guest.maxGuestsAllowed > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
