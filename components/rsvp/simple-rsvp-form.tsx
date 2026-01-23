"use client"

import { useState } from "react"
import { supabase, RsvpEntry } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, CheckCircle, Heart, MapPin, Clock, Calendar } from "lucide-react"

interface WeddingEvent {
  name: string
  startTime: Date | string
  endTime?: Date | string | null
  location?: string | null
  address?: string | null
  venue?: string | null
}

interface WeddingDetails {
  venueName?: string | null
  venueAddress?: string | null
  venueCity?: string | null
  venueState?: string | null
  venueZip?: string | null
  events?: WeddingEvent[]
}

interface SimpleRsvpFormProps {
  partner1Name: string
  partner2Name: string
  weddingDate: string
  onSuccess?: () => void
  weddingDetails?: WeddingDetails
  initialData?: {
    email?: string
    firstName?: string
    lastName?: string
    isAttending?: boolean
    numberOfGuests?: number
    plusOneFirstName?: string
    plusOneLastName?: string
  }
}

export function SimpleRsvpForm({
  partner1Name,
  partner2Name,
  weddingDate,
  onSuccess,
  weddingDetails,
  initialData,
}: SimpleRsvpFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Determine if we need custom number based on initial data
  const initialNumberOfGuests = initialData?.numberOfGuests || 1
  const isInitialCustom = initialNumberOfGuests > 2

  const [formData, setFormData] = useState({
    email: initialData?.email || "",
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    isAttending: initialData?.isAttending ?? true,
    numberOfGuests: initialNumberOfGuests,
    customNumberOfGuests: isInitialCustom ? String(initialNumberOfGuests) : "",
    isCustomNumber: isInitialCustom,
    plusOneFirstName: initialData?.plusOneFirstName || "",
    plusOneLastName: initialData?.plusOneLastName || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validation
    if (!formData.email || !formData.firstName || !formData.lastName) {
      setError("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    // Determine the actual number of guests
    let actualNumberOfGuests = formData.numberOfGuests
    if (formData.isCustomNumber) {
      if (!formData.customNumberOfGuests || formData.customNumberOfGuests.trim() === "") {
        setError("Please enter the number of people attending")
        setIsSubmitting(false)
        return
      }
      const customNum = parseInt(formData.customNumberOfGuests)
      if (isNaN(customNum) || customNum < 1) {
        setError("Please enter a valid number of guests (1 or more)")
        setIsSubmitting(false)
        return
      }
      actualNumberOfGuests = customNum
    }

    // Validate plus one name if more than 1 guest
    if (formData.isAttending && actualNumberOfGuests > 1) {
      if (!formData.plusOneFirstName || !formData.plusOneLastName) {
        setError("Please provide your guest's first and last name")
        setIsSubmitting(false)
        return
      }
    }

    try {
      // Determine the actual number of guests
      let actualNumberOfGuests = formData.numberOfGuests
      if (formData.isCustomNumber) {
        actualNumberOfGuests = parseInt(formData.customNumberOfGuests)
      }

      // Prepare the data for Supabase (using snake_case to match database schema)
      const rsvpData = {
        email: formData.email.trim().toLowerCase(),
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        is_attending: formData.isAttending,
        number_of_guests: actualNumberOfGuests,
        plus_one_first_name:
          actualNumberOfGuests > 1 && formData.plusOneFirstName
            ? formData.plusOneFirstName.trim()
            : null,
        plus_one_last_name:
          actualNumberOfGuests > 1 && formData.plusOneLastName
            ? formData.plusOneLastName.trim()
            : null,
      }

      // Insert into Supabase
      const { error: insertError } = await supabase
        .from("rsvp")
        .insert([rsvpData])

      if (insertError) {
        // Check if it's a duplicate email error
        if (
          insertError.code === "23505" ||
          insertError.message.includes("duplicate") ||
          insertError.message.includes("unique")
        ) {
          // Update existing record instead
          const { error: updateError } = await supabase
            .from("rsvp")
            .update(rsvpData)
            .eq("email", rsvpData.email)

          if (updateError) {
            throw updateError
          }
        } else {
          throw insertError
        }
      }

      setIsSuccess(true)
      
      // Store in localStorage that they've RSVP'd
      localStorage.setItem("rsvp_submitted", "true")
      localStorage.setItem("rsvp_email", formData.email)

      // Call success callback after a short delay
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (err: any) {
      console.error("RSVP submission error:", err)
      setError(err.message || "Failed to submit RSVP. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-4">
              Your RSVP has been submitted successfully.
            </p>
            <p className="text-sm text-muted-foreground">
              We can't wait to celebrate with you!
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
          <CardTitle className="font-serif text-2xl text-center">
            RSVP for {partner1Name} & {partner2Name}
          </CardTitle>
          <p className="text-center text-sm text-muted-foreground mt-2">
            {new Date(weddingDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base">
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

          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-base">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              placeholder="Your first name"
              required
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-base">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              placeholder="Your last name"
              required
            />
          </div>

          {/* Attending Status */}
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-base">Will you be attending?</Label>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="attending"
                  checked={formData.isAttending}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      isAttending: checked === true,
                      numberOfGuests: checked === true ? 1 : 0,
                    })
                  }
                />
                <Label
                  htmlFor="attending"
                  className="text-base cursor-pointer font-normal"
                >
                  Yes, I'll be there!
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notAttending"
                  checked={!formData.isAttending}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      isAttending: checked !== true,
                      numberOfGuests: 0,
                    })
                  }
                />
                <Label
                  htmlFor="notAttending"
                  className="text-base cursor-pointer font-normal"
                >
                  Sorry, can't make it
                </Label>
              </div>
            </div>
          </div>

          {/* Number of Guests (only if attending) */}
          {formData.isAttending && (
            <div className="space-y-4 pt-4 border-t">
              <Label htmlFor="numberOfGuests" className="text-base">
                How many people will be attending?
              </Label>
              <div className="flex gap-2">
                {[1, 2].map((num) => (
                  <Button
                    key={num}
                    type="button"
                    variant={
                      !formData.isCustomNumber && formData.numberOfGuests === num
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setFormData({
                        ...formData,
                        numberOfGuests: num,
                        isCustomNumber: false,
                        customNumberOfGuests: "",
                      })
                    }
                    className="flex-1"
                  >
                    {num} {num === 1 ? "Person" : "People"}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant={formData.isCustomNumber ? "default" : "outline"}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      isCustomNumber: true,
                      customNumberOfGuests: formData.numberOfGuests > 2 ? String(formData.numberOfGuests) : "",
                    })
                  }
                  className="flex-1"
                >
                  Other
                </Button>
              </div>
              {formData.isCustomNumber && (
                <div className="space-y-2">
                  <Label htmlFor="customNumberOfGuests">
                    Number of people <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customNumberOfGuests"
                    type="number"
                    min="1"
                    value={formData.customNumberOfGuests}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customNumberOfGuests: e.target.value,
                        numberOfGuests: parseInt(e.target.value) || 1,
                      })
                    }
                    placeholder="Enter number"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Please enter the total number of people attending
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Plus One Information (only if more than 1 guest) */}
          {formData.isAttending && 
            (formData.isCustomNumber 
              ? (formData.customNumberOfGuests && parseInt(formData.customNumberOfGuests) > 1)
              : formData.numberOfGuests > 1) && (
            <div className="space-y-4 pt-4 border-t p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium">
                {formData.isCustomNumber && formData.customNumberOfGuests && parseInt(formData.customNumberOfGuests) > 2
                  ? "First Additional Guest Information"
                  : "Guest Information"}
              </h4>
              {formData.isCustomNumber && formData.customNumberOfGuests && parseInt(formData.customNumberOfGuests) > 2 && (
                <p className="text-sm text-muted-foreground">
                  Please provide the name of your first additional guest. We'll contact you if we need information about other guests.
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="plusOneFirstName">
                  Guest's First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="plusOneFirstName"
                  type="text"
                  value={formData.plusOneFirstName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      plusOneFirstName: e.target.value,
                    })
                  }
                  placeholder="Guest's first name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plusOneLastName">
                  Guest's Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="plusOneLastName"
                  type="text"
                  value={formData.plusOneLastName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      plusOneLastName: e.target.value,
                    })
                  }
                  placeholder="Guest's last name"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Wedding Details Section */}
          {weddingDetails && (
            <div className="space-y-6 pt-6 border-t">
              <h3 className="font-serif text-xl font-bold text-center">
                Wedding Details
              </h3>

              {/* Location */}
              {(weddingDetails.venueName || weddingDetails.venueAddress) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Location</span>
                  </div>
                  <div className="pl-6 space-y-1">
                    {weddingDetails.venueName && (
                      <p className="font-medium">{weddingDetails.venueName}</p>
                    )}
                    {weddingDetails.venueAddress && (
                      <p className="text-sm text-muted-foreground">
                        {weddingDetails.venueAddress}
                        {weddingDetails.venueCity && `, ${weddingDetails.venueCity}`}
                        {weddingDetails.venueState && `, ${weddingDetails.venueState}`}
                        {weddingDetails.venueZip && ` ${weddingDetails.venueZip}`}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline/Events */}
              {weddingDetails.events && weddingDetails.events.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Timeline</span>
                  </div>
                  <div className="pl-6 space-y-3">
                    {weddingDetails.events
                      .sort((a, b) => {
                        const aTime = new Date(a.startTime).getTime()
                        const bTime = new Date(b.startTime).getTime()
                        return aTime - bTime
                      })
                      .map((event, index) => {
                        const startTime = new Date(event.startTime)
                        const endTime = event.endTime ? new Date(event.endTime) : null
                        
                        return (
                          <div key={index} className="border-l-2 border-primary/30 pl-4 pb-3">
                            <div className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="font-medium">{event.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {startTime.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  })}{" "}
                                  at{" "}
                                  {startTime.toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                  {endTime &&
                                    ` - ${endTime.toLocaleTimeString("en-US", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })}`}
                                </p>
                                {(event.location || event.venue || event.address) && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {event.venue || event.location || event.address}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
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
        </CardContent>
      </Card>
    </form>
  )
}
