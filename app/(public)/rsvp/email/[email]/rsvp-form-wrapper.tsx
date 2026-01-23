"use client"

import { useRouter } from "next/navigation"
import { SimpleRsvpForm } from "@/components/rsvp/simple-rsvp-form"

interface WeddingEvent {
  name: string
  startTime: string
  endTime?: string | null
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

interface SimpleRsvpFormWrapperProps {
  partner1Name: string
  partner2Name: string
  weddingDate: string
  weddingSlug: string
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

export function SimpleRsvpFormWrapper({
  partner1Name,
  partner2Name,
  weddingDate,
  weddingSlug,
  weddingDetails,
  initialData,
}: SimpleRsvpFormWrapperProps) {
  const router = useRouter()

  const handleSuccess = () => {
    router.push(`/${weddingSlug}`)
  }

  return (
    <SimpleRsvpForm
      partner1Name={partner1Name}
      partner2Name={partner2Name}
      weddingDate={weddingDate}
      weddingDetails={weddingDetails}
      initialData={initialData}
      onSuccess={handleSuccess}
    />
  )
}
