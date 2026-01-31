"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Heart, Loader2, CheckCircle } from "lucide-react"

interface RsvpFormProps {
  guest: {
    id: string
    firstName: string
    lastName: string
    email?: string | null
    phone?: string | null
    allowPlusOne: boolean
    plusOneUsed: boolean
    plusOneName?: string | null
    rsvpStatus: string
    inviteCode?: string
    inviteToken?: string
  } | null
  couple: {
    id: string
    partner1Name: string
    partner2Name: string
    weddingDate: Date
    slug: string
    rsvpDeadline?: Date | null
    askMealChoice: boolean
    mealOptions?: string | null
    askSongRequest: boolean
    askBusTransport: boolean
    busRoutes?: string | null
    maxCapacity?: number | null
  }
}

export function RsvpForm({ guest, couple, isNewGuest = false, sharedCode }: RsvpFormProps & { isNewGuest?: boolean; sharedCode?: string }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: guest?.firstName || "",
    lastName: guest?.lastName || "",
    status: guest?.rsvpStatus === "PENDING" ? "" : guest?.rsvpStatus || "",
    email: guest?.email || "",
    phone: guest?.phone || "",
    mealChoice: "",
    dietaryRestrictions: "",
    songRequest: "",
    busRequired: false,
    busRoute: "",
    message: "",
    // Plus one fields
    plusOneCount: guest?.plusOneUsed && guest?.plusOneName 
      ? Math.max(1, guest.plusOneName.split(",").filter((n: string) => n.trim()).length)
      : 0,
    plusOneNames: guest?.plusOneUsed && guest?.plusOneName
      ? guest.plusOneName.split(",").map((n: string) => n.trim()).filter((n: string) => n)
      : [] as string[],
  })

  const mealOptions = couple.mealOptions
    ? JSON.parse(couple.mealOptions)
    : ["Chicken", "Beef", "Fish", "Vegetarian"]
  
  const busRoutes = couple.busRoutes
    ? JSON.parse(couple.busRoutes)
    : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validate required fields
    if (isNewGuest) {
      if (!formData.firstName.trim()) {
        setError("Please enter your first name")
        setIsSubmitting(false)
        return
      }
      if (!formData.lastName.trim()) {
        setError("Please enter your last name")
        setIsSubmitting(false)
        return
      }
      if (!formData.email?.trim()) {
        setError("Please enter your email address")
        setIsSubmitting(false)
        return
      }
    }

    if (!formData.status) {
      setError("Please select your RSVP status")
      setIsSubmitting(false)
      return
    }

    if (formData.status === "ATTENDING" && couple.askMealChoice && !formData.mealChoice) {
      setError("Please select your meal choice")
      setIsSubmitting(false)
      return
    }

    if (formData.plusOneCount > 0) {
      // Validate all plus one names are provided
      const missingNames = formData.plusOneNames.filter((name, index) => 
        index < formData.plusOneCount && !name?.trim()
      )
      if (missingNames.length > 0) {
        setError(`Please provide names for all ${formData.plusOneCount} guest${formData.plusOneCount > 1 ? 's' : ''}`)
        setIsSubmitting(false)
        return
      }
    }

    try {
      // Use shared code endpoint for new guests, otherwise use guest token
      const endpoint = isNewGuest && sharedCode 
        ? `/api/rsvp/${sharedCode}/new`
        : `/api/rsvp/${guest?.inviteCode || guest?.inviteToken}`
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to submit RSVP")
      }

      setIsSuccess(true)
      setTimeout(() => {
        router.push(`/${couple.slug}`)
      }, 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-4">
              Your RSVP has been submitted successfully.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting you to the wedding website...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">
            {guest 
              ? `RSVP for ${guest.firstName} ${guest.lastName}`
              : "RSVP"
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* RSVP Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-base">
              Will you be attending? <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Please select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ATTENDING">
                  ✓ Joyfully Accepts
                </SelectItem>
                <SelectItem value="DECLINED">
                  ✗ Regretfully Declines
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.status === "ATTENDING" && (
            <>
              {/* Name Fields for New Guests */}
              {isNewGuest && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium text-lg">Your Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        placeholder="First Name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        placeholder="Last Name"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-lg">Contact Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
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

              {/* Meal Choice */}
              {couple.askMealChoice && (
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="mealChoice" className="text-base">
                    Meal Choice <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.mealChoice}
                    onValueChange={(value) =>
                      setFormData({ ...formData, mealChoice: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your entrée" />
                    </SelectTrigger>
                    <SelectContent>
                      {mealOptions.map((option: string) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="dietary">Dietary Restrictions</Label>
                    <Input
                      id="dietary"
                      value={formData.dietaryRestrictions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dietaryRestrictions: e.target.value,
                        })
                      }
                      placeholder="Allergies, dietary requirements, etc."
                    />
                  </div>
                </div>
              )}

              {/* Bus Transportation */}
              {couple.askBusTransport && busRoutes.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="busRequired"
                      checked={formData.busRequired}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          busRequired: checked as boolean,
                        })
                      }
                    />
                    <Label
                      htmlFor="busRequired"
                      className="text-base cursor-pointer"
                    >
                      I need bus transportation
                    </Label>
                  </div>

                  {formData.busRequired && (
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="busRoute">Select Your Route</Label>
                      <Select
                        value={formData.busRoute}
                        onValueChange={(value) =>
                          setFormData({ ...formData, busRoute: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a route" />
                        </SelectTrigger>
                        <SelectContent>
                          {busRoutes.map((route: string) => (
                            <SelectItem key={route} value={route}>
                              {route}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {/* Song Request */}
              {couple.askSongRequest && (
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="songRequest" className="text-base">
                    Song Request
                  </Label>
                  <Input
                    id="songRequest"
                    value={formData.songRequest}
                    onChange={(e) =>
                      setFormData({ ...formData, songRequest: e.target.value })
                    }
                    placeholder="What song would you like to hear?"
                  />
                  <p className="text-sm text-muted-foreground">
                    Suggest a song to get everyone on the dance floor!
                  </p>
                </div>
              )}

              {/* Plus One */}
              {(guest?.allowPlusOne || isNewGuest) && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="plusOneCount" className="text-base">
                      Number of additional guests
                    </Label>
                    <Select
                      value={formData.plusOneCount.toString()}
                      onValueChange={(value) => {
                        const count = parseInt(value)
                        // Initialize or trim the plusOneNames array
                        const newNames = [...formData.plusOneNames]
                        if (count > newNames.length) {
                          // Add empty strings for new slots
                          while (newNames.length < count) {
                            newNames.push("")
                          }
                        } else {
                          // Remove extra slots
                          newNames.splice(count)
                        }
                        setFormData({
                          ...formData,
                          plusOneCount: count,
                          plusOneNames: newNames,
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of guests" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">None</SelectItem>
                        <SelectItem value="1">1 guest</SelectItem>
                        <SelectItem value="2">2 guests</SelectItem>
                        <SelectItem value="3">3 guests</SelectItem>
                        <SelectItem value="4">4 guests</SelectItem>
                        <SelectItem value="5">5 guests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.plusOneCount > 0 && (
                    <div className="space-y-4 ml-6 p-4 border rounded-lg bg-muted/30">
                      <h4 className="font-medium">
                        Guest{formData.plusOneCount > 1 ? 's' : ''} Information
                      </h4>
                      
                      {Array.from({ length: formData.plusOneCount }).map((_, index) => (
                        <div key={index} className="space-y-2">
                          <Label htmlFor={`plusOneName-${index}`}>
                            Guest {index + 1} Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id={`plusOneName-${index}`}
                            value={formData.plusOneNames[index] || ""}
                            onChange={(e) => {
                              const newNames = [...formData.plusOneNames]
                              newNames[index] = e.target.value
                              setFormData({
                                ...formData,
                                plusOneNames: newNames,
                              })
                            }}
                            placeholder="Guest's full name"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Message */}
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="message" className="text-base">
                  Message to the Couple (Optional)
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Share your excitement or well wishes..."
                  rows={4}
                />
              </div>
            </>
          )}

          {formData.status === "DECLINED" && (
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="message" className="text-base">
                Message (Optional)
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="We'll miss you! Let us know if anything changes."
                rows={4}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Heart className="mr-2 h-4 w-4" />
                Submit RSVP
              </>
            )}
          </Button>

          {couple.rsvpDeadline && (
            <p className="text-sm text-center text-muted-foreground">
              Please respond by{" "}
              {new Date(couple.rsvpDeadline).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </CardContent>
      </Card>
    </form>
  )
}

