"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Heart, Mail, PenLine } from "lucide-react"

interface RsvpLookupFormProps {
  slug: string
}

export function RsvpLookupForm({ slug }: RsvpLookupFormProps) {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const trimmedEmail = email.trim()
    const trimmedPhone = phone.replace(/\D/g, "").trim()

    if (!trimmedEmail && !trimmedPhone) {
      setError("Please enter your email address or phone number")
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
        }),
      })

      const data = await response.json()

      if (response.ok && data.found) {
        if (data.source === "supabase" && data.email) {
          router.push(`/rsvp/email/${encodeURIComponent(data.email.toLowerCase())}?slug=${slug}`)
        } else if (data.inviteToken) {
          router.push(`/rsvp/${data.inviteToken}`)
        } else {
          setError("We found your invitation but couldn't load it. Please contact the couple.")
        }
      } else {
        setError(data.error || "We couldn't find an invitation for that email or phone number. You can RSVP now without a code, or contact the couple.")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
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
            Choose how you&rsquo;d like to RSVP
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* RSVP now - no code required */}
          <Card className="border-gold/30 hover:border-gold/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <PenLine className="h-5 w-5 text-primary" />
                <CardTitle>RSVP now</CardTitle>
              </div>
              <CardDescription>
                Fill out the form — no invite code needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link href={`/rsvp/${slug}/new`}>Continue to RSVP form</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Search by email or phone */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle>Find my invitation</CardTitle>
              </div>
              <CardDescription>
                Look up by email or phone to view or update your RSVP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLookupSubmit} className="space-y-4">
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
        </div>

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
      </div>
    </div>
  )
}
