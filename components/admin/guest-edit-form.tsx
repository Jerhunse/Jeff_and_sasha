"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, X } from "lucide-react"
import { toast } from "sonner"

interface GuestEditFormProps {
  guest: {
    id: string
    firstName: string
    lastName: string
    email?: string | null
    phone?: string | null
    isChild: boolean
    isVIP: boolean
    allowPlusOne: boolean
    maxGuestsAllowed: number
    notes?: string | null
    doNotContact: boolean
    isPrimaryContact: boolean
    relationship?: string | null
  }
}

export function GuestEditForm({ guest }: GuestEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: guest.firstName,
    lastName: guest.lastName,
    email: guest.email || "",
    phone: guest.phone || "",
    isChild: guest.isChild,
    isVIP: guest.isVIP,
    allowPlusOne: guest.allowPlusOne,
    maxGuestsAllowed: guest.maxGuestsAllowed,
    notes: guest.notes || "",
    doNotContact: guest.doNotContact,
    isPrimaryContact: guest.isPrimaryContact,
    relationship: guest.relationship || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/guests/${guest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update guest")
      }

      toast.success("Guest updated successfully")

      // Redirect back to guest detail page
      router.push(`/admin/guests/${guest.id}`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/admin/guests/${guest.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update guest name and contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
                placeholder="John"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
                placeholder="Smith"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Input
              id="relationship"
              value={formData.relationship}
              onChange={(e) =>
                setFormData({ ...formData, relationship: e.target.value })
              }
              placeholder="e.g., Friend, Cousin, Coworker"
            />
            <p className="text-xs text-muted-foreground">
              How this guest is related to you
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Guest Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Guest Settings</CardTitle>
          <CardDescription>Configure guest permissions and details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="maxGuestsAllowed">Maximum Guests Allowed</Label>
            <Input
              id="maxGuestsAllowed"
              type="number"
              min="1"
              value={formData.maxGuestsAllowed}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxGuestsAllowed: parseInt(e.target.value) || 1,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Total number of people this guest can bring (including themselves)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allowPlusOne">Allow Plus-One</Label>
              <p className="text-sm text-muted-foreground">
                Guest can bring an additional person
              </p>
            </div>
            <Switch
              id="allowPlusOne"
              checked={formData.allowPlusOne}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, allowPlusOne: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isVIP">VIP Guest</Label>
              <p className="text-sm text-muted-foreground">
                Mark as an important guest
              </p>
            </div>
            <Switch
              id="isVIP"
              checked={formData.isVIP}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isVIP: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isChild">Child Guest</Label>
              <p className="text-sm text-muted-foreground">
                Guest is under 18 years old
              </p>
            </div>
            <Switch
              id="isChild"
              checked={formData.isChild}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isChild: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isPrimaryContact">Primary Contact</Label>
              <p className="text-sm text-muted-foreground">
                Main contact for their household
              </p>
            </div>
            <Switch
              id="isPrimaryContact"
              checked={formData.isPrimaryContact}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isPrimaryContact: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="doNotContact">Do Not Contact</Label>
              <p className="text-sm text-muted-foreground">
                Exclude from email/SMS campaigns
              </p>
            </div>
            <Switch
              id="doNotContact"
              checked={formData.doNotContact}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, doNotContact: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Internal Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Internal Notes</CardTitle>
          <CardDescription>Private notes about this guest (not visible to them)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Add any internal notes about this guest..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
