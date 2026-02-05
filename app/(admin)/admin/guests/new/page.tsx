"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewGuestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    isChild: false,
    isVIP: false,
    allowPlusOne: false,
    maxGuestsAllowed: 1,
    notes: "",
  })

  const handleChange = (field: string, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/admin/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create guest")
      }

      router.push("/admin/guests")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to create guest. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/guests">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Guests
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="font-serif text-4xl font-bold mb-2">Add Guest</h1>
        <p className="text-muted-foreground">
          Add a new guest to your wedding guest list
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Guest Information</CardTitle>
            <CardDescription>Enter the details for your new guest</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="First name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxGuestsAllowed">Party Size (including this guest)</Label>
              <Input
                id="maxGuestsAllowed"
                type="number"
                min={1}
                max={20}
                value={form.maxGuestsAllowed}
                onChange={(e) => handleChange("maxGuestsAllowed", parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground">
                How many total guests can this person bring (including themselves)?
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowPlusOne"
                  checked={form.allowPlusOne}
                  onCheckedChange={(checked) => handleChange("allowPlusOne", !!checked)}
                />
                <Label htmlFor="allowPlusOne">Allow plus one</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isVIP"
                  checked={form.isVIP}
                  onCheckedChange={(checked) => handleChange("isVIP", !!checked)}
                />
                <Label htmlFor="isVIP">VIP guest</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isChild"
                  checked={form.isChild}
                  onCheckedChange={(checked) => handleChange("isChild", !!checked)}
                />
                <Label htmlFor="isChild">Child guest</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Any special notes about this guest..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/guests">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add Guest
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
