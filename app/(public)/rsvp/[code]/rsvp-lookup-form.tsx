"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Heart, Mail, Key } from "lucide-react"

interface RsvpLookupFormProps {
  slug: string
}

export function RsvpLookupForm({ slug }: RsvpLookupFormProps) {
  const [code, setCode] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setError("Please enter your invite code")
      return
    }
    router.push(`/rsvp/${code.trim()}`)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!email.trim()) {
      setError("Please enter your email address")
      setLoading(false)
      return
    }

    try {
      // Try to find guest by email and wedding slug
      const response = await fetch(`/api/rsvp/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), slug }),
      })

      const data = await response.json()

      if (response.ok && data.found) {
        if (data.source === "supabase") {
          // Found in Supabase - redirect to view/edit page with email
          router.push(`/rsvp/email/${encodeURIComponent(email.trim().toLowerCase())}?slug=${slug}`)
        } else if (data.inviteToken) {
          // Found in Prisma - redirect to token-based RSVP
          router.push(`/rsvp/${data.inviteToken}`)
        } else {
          setError("We found your RSVP but couldn't load it. Please contact the couple.")
        }
      } else {
        setError(data.error || "We couldn't find an RSVP for that email address. Please check your email for your unique RSVP link, or contact the couple.")
      }
    } catch (err) {
      setError("Something went wrong. Please try again or use your invite code.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 bg-gradient-to-br from-primary/10 via-secondary to-accent/10">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
            <Heart className="h-8 w-8 text-primary fill-primary" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">
            RSVP
          </h1>
          <p className="text-lg text-muted-foreground">
            Please enter your invite code or email address to RSVP
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Invite Code Method */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-5 w-5 text-primary" />
                <CardTitle>I have my invite code</CardTitle>
              </div>
              <CardDescription>
                Enter the code from your invitation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="code">Invite Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter your code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Email Method */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle>Look up by email</CardTitle>
              </div>
              <CardDescription>
                We'll find your invitation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Looking up..." : "Find My Invitation"}
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
            Can't find your invitation?{" "}
            <a
              href={`/${slug}/contact`}
              className="text-primary hover:underline font-medium"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
