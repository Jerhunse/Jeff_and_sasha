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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Heart, Loader2, CheckCircle, Users, Search, Phone as PhoneIcon, Music, ArrowLeft, Home } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
    maxGuestsAllowed?: number
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
  
  // If guest is already provided (from invite link), skip lookup
  // Otherwise start with lookup step
  const [step, setStep] = useState<'lookup' | 'attendance' | 'confirm-count' | 'guest-details'>(
    guest ? 'attendance' : 'lookup'
  )
  
  // Lookup state
  const [lookupQuery, setLookupQuery] = useState({ name: '', phone: '' })
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [multipleMatches, setMultipleMatches] = useState<Array<{
    inviteToken: string
    firstName: string
    lastName: string
    phone: string | null
    maxGuestsAllowed: number
  }>>([])
  const [showMultipleDialog, setShowMultipleDialog] = useState(false)

  // Determine max allowed guests for this party
  const maxAllowedGuests = guest?.maxGuestsAllowed || 1

  const handleGoBack = () => {
    // Navigate to the wedding home page
    router.push(`/${couple.slug}`)
  }

  const [formData, setFormData] = useState({
    firstName: guest?.firstName || "",
    lastName: guest?.lastName || "",
    status: guest?.rsvpStatus === "PENDING" ? "" : guest?.rsvpStatus || "",
    email: guest?.email || "",
    phone: guest?.phone || "",
    message: "",
    songRequest: "",
    // Guest count: total number including primary guest
    confirmedGuestCount: maxAllowedGuests,
    guestNames: [] as string[], // Array of full names for all guests including primary
  })

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLookupError(null)
    setLookupLoading(true)
    setMultipleMatches([])

    const trimmedPhone = lookupQuery.phone.replace(/\D/g, "").trim()
    const trimmedName = lookupQuery.name.trim()

    if (!trimmedPhone && !trimmedName) {
      setLookupError("Please enter your phone number or name")
      setLookupLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/rsvp/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: couple.slug,
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
        } else if (data.inviteToken) {
          // Single match - redirect to their invite page
          router.push(`/rsvp/${data.inviteToken}`)
        } else if (data.guests && data.guests.length === 1) {
          // Single match from name search
          router.push(`/rsvp/${data.guests[0].inviteToken}`)
        } else {
          setLookupError("We found your invitation but couldn't load it. Please try again.")
        }
      } else {
        setLookupError(data.error || "We couldn't find an invitation for that name or phone number. Please verify your information or contact the couple.")
      }
    } catch (err) {
      setLookupError("Something went wrong. Please try again.")
    } finally {
      setLookupLoading(false)
    }
  }

  const handleSelectGuest = (guestData: typeof multipleMatches[0]) => {
    setShowMultipleDialog(false)
    router.push(`/rsvp/${guestData.inviteToken}`)
  }

  const handleAttendanceSelect = (status: string) => {
    setFormData({ ...formData, status })
    if (status === "ATTENDING") {
      // Move to guest count confirmation
      setStep('confirm-count')
    } else {
      // For declining, skip directly to message
      setStep('guest-details')
    }
  }

  const handleGuestCountConfirm = (count: number) => {
    // Initialize guest names array with primary guest's name
    const initialNames = guest ? [`${guest.firstName} ${guest.lastName}`.trim()] : [""]
    // Add empty strings for additional guests
    while (initialNames.length < count) {
      initialNames.push("")
    }
    
    setFormData({
      ...formData,
      confirmedGuestCount: count,
      guestNames: initialNames,
    })
    setStep('guest-details')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Validate based on status
    if (!formData.status) {
      setError("Please select your RSVP status")
      setIsSubmitting(false)
      return
    }

    if (formData.status === "ATTENDING") {
      // Validate phone number (now required)
      if (!formData.phone?.trim()) {
        setError("Please enter your phone number")
        setIsSubmitting(false)
        return
      }

      // Validate all guest names are provided
      const missingNames = formData.guestNames.filter((name) => !name?.trim())
      if (missingNames.length > 0) {
        setError(`Please provide names for all ${formData.confirmedGuestCount} guest${formData.confirmedGuestCount > 1 ? 's' : ''}`)
        setIsSubmitting(false)
        return
      }
    }

    try {
      // Use shared code endpoint for new guests, otherwise use guest token
      const endpoint = isNewGuest && sharedCode 
        ? `/api/rsvp/${sharedCode}/new`
        : `/api/rsvp/${guest?.inviteCode || guest?.inviteToken}`
      
      // Prepare the submission data
      const submissionData = {
        status: formData.status,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        songRequest: formData.songRequest,
        confirmedGuestCount: formData.confirmedGuestCount,
        guestNames: formData.guestNames.filter(n => n?.trim()),
        // For backward compatibility with existing API
        plusOneCount: Math.max(0, formData.confirmedGuestCount - 1),
        plusOneNames: formData.guestNames.slice(1).filter(n => n?.trim()),
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
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

  // Check if guest has already RSVPed (status is not PENDING)
  const hasAlreadyRsvped = guest && guest.rsvpStatus !== "PENDING"

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

  // Show already RSVPed message if guest has already submitted
  if (hasAlreadyRsvped) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="font-serif text-2xl">
                RSVP Already Submitted
              </CardTitle>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 space-y-4">
            <CheckCircle className="h-16 w-16 text-gold mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              You've Already RSVPed
            </h3>
            <div className="bg-muted/30 rounded-lg p-6 space-y-3 max-w-md mx-auto">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-semibold">
                  {guest.rsvpStatus === "ATTENDING" ? "✓ Attending" : "✗ Declined"}
                </span>
              </div>
              {guest.email && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{guest.email}</span>
                </div>
              )}
              {guest.phone && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{guest.phone}</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground mt-6">
              If you need to make changes to your RSVP, please contact the couple directly.
            </p>
            <Button
              onClick={handleGoBack}
              size="lg"
              className="mt-6"
            >
              <Home className="mr-2 h-4 w-4" />
              Return to Wedding Website
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={step === 'lookup' ? handleLookupSubmit : handleSubmit}>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="font-serif text-2xl">
                {step === 'lookup' 
                  ? "Find Your Invitation"
                  : guest 
                    ? `RSVP for ${guest.firstName} ${guest.lastName}`
                    : "RSVP"
                }
              </CardTitle>
              {step === 'lookup' && (
                <CardDescription>
                  Enter your name or phone number to get started
                </CardDescription>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Step 0: Guest Lookup */}
          {step === 'lookup' && (
            <div className="space-y-6">
              <div className="text-center py-6">
                <Search className="h-12 w-12 text-gold mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Let's find your invitation
                </h3>
                <p className="text-muted-foreground">
                  Only guests who have been invited can RSVP
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lookup-name">Your Name</Label>
                  <Input
                    id="lookup-name"
                    type="text"
                    placeholder="John Smith"
                    value={lookupQuery.name}
                    onChange={(e) => setLookupQuery({ ...lookupQuery, name: e.target.value })}
                  />
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  — OR —
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lookup-phone">Phone Number</Label>
                  <Input
                    id="lookup-phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={lookupQuery.phone}
                    onChange={(e) => setLookupQuery({ ...lookupQuery, phone: e.target.value })}
                  />
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Enter your name or phone number to look up your invitation
                </p>
              </div>

              {lookupError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200 text-sm">
                  {lookupError}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={lookupLoading}
              >
                {lookupLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Find My Invitation
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                Can't find your invitation?{" "}
                <a
                  href={`/${couple.slug}/contact`}
                  className="text-gold hover:underline font-medium"
                >
                  Contact us
                </a>
              </div>
            </div>
          )}
          
          {/* Step 1: Attendance Selection */}
          {step === 'attendance' && guest && (
            <div className="space-y-4">
              <div className="text-center py-6">
                <Heart className="h-12 w-12 text-gold mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Will you be attending?
                </h3>
                <p className="text-muted-foreground">
                  We're excited to celebrate with you!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  type="button"
                  size="lg"
                  variant={formData.status === "ATTENDING" ? "default" : "outline"}
                  className="h-auto py-6 flex flex-col gap-2"
                  onClick={() => handleAttendanceSelect("ATTENDING")}
                >
                  <span className="text-2xl">✓</span>
                  <span className="font-semibold">Joyfully Accepts</span>
                </Button>

                <Button
                  type="button"
                  size="lg"
                  variant={formData.status === "DECLINED" ? "default" : "outline"}
                  className="h-auto py-6 flex flex-col gap-2"
                  onClick={() => handleAttendanceSelect("DECLINED")}
                >
                  <span className="text-2xl">✗</span>
                  <span className="font-semibold">Regretfully Declines</span>
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Confirm Guest Count (only if attending) */}
          {step === 'confirm-count' && formData.status === "ATTENDING" && (
            <div className="space-y-6">
              <div className="text-center py-6">
                <Users className="h-12 w-12 text-gold mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Confirm Your Party Size
                </h3>
                <p className="text-muted-foreground">
                  You're allocated {maxAllowedGuests} guest{maxAllowedGuests > 1 ? 's' : ''}
                </p>
              </div>

              <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allocated guests:</p>
                    <p className="text-sm text-muted-foreground">
                      Including yourself
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-gold">
                    {maxAllowedGuests}
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Label className="text-base">
                    How many guests will be attending?
                  </Label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {Array.from({ length: maxAllowedGuests }, (_, i) => i + 1).map((num) => (
                      <Button
                        key={num}
                        type="button"
                        variant={formData.confirmedGuestCount === num ? "default" : "outline"}
                        className="h-16 text-lg font-semibold"
                        onClick={() => handleGuestCountConfirm(num)}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground pt-2">
                    Select the total number of guests attending (minimum 1, maximum {maxAllowedGuests})
                  </p>
                </div>
              </div>

              <div className="flex justify-start">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep('attendance')}
                >
                  ← Back
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Guest Details */}
          {step === 'guest-details' && (
            <div className="space-y-6">
              {formData.status === "ATTENDING" ? (
                <>
                  {/* Guest Names */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-lg">Guest Names</h3>
                      <span className="text-sm text-muted-foreground">
                        {formData.confirmedGuestCount} guest{formData.confirmedGuestCount > 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {Array.from({ length: formData.confirmedGuestCount }).map((_, index) => (
                      <div key={index} className="space-y-2">
                        <Label htmlFor={`guestName-${index}`}>
                          {index === 0 ? "Your Name" : `Guest ${index + 1} Name`} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id={`guestName-${index}`}
                          value={formData.guestNames[index] || ""}
                          onChange={(e) => {
                            const newNames = [...formData.guestNames]
                            newNames[index] = e.target.value
                            setFormData({
                              ...formData,
                              guestNames: newNames,
                            })
                          }}
                          placeholder={index === 0 ? "Your Full Name" : "Guest's Full Name"}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Phone and Email */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium text-lg">Contact Information</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="(555) 123-4567"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        We'll send you a confirmation via text
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  {/* Song Request (Optional) */}
                  {couple.askSongRequest && (
                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-gold" />
                        <Label htmlFor="songRequest" className="text-base">
                          Song Request (Optional)
                        </Label>
                      </div>
                      <Input
                        id="songRequest"
                        value={formData.songRequest}
                        onChange={(e) =>
                          setFormData({ ...formData, songRequest: e.target.value })
                        }
                        placeholder="Artist - Song Title"
                      />
                      <p className="text-xs text-muted-foreground">
                        Request a song you'd love to hear at the reception
                      </p>
                    </div>
                  )}

                  {/* Message (Optional) */}
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

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep('confirm-count')}
                    >
                      ← Back
                    </Button>
                  </div>
                </>
              ) : (
                /* Declining RSVP - Just message */
                <>
                  <div className="space-y-2 pt-4">
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

                  <div className="flex justify-start">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep('attendance')}
                    >
                      ← Back
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {step === 'guest-details' && (
            <>
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
            </>
          )}
        </CardContent>
      </Card>

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
            {multipleMatches.map((guestMatch) => (
              <Button
                key={guestMatch.inviteToken}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleSelectGuest(guestMatch)}
              >
                <div className="flex flex-col items-start">
                  <div className="font-medium">
                    {guestMatch.firstName} {guestMatch.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    {guestMatch.phone && (
                      <span className="flex items-center gap-1">
                        <PhoneIcon className="h-3 w-3" />
                        {guestMatch.phone}
                      </span>
                    )}
                    <span className="text-xs">
                      • {guestMatch.maxGuestsAllowed} guest{guestMatch.maxGuestsAllowed > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </form>
  )
}
