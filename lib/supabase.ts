import { createClient } from '@supabase/supabase-js'

// Supabase configuration - using the same credentials from the waitlist
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cwrirmowykxajumjokjj.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3cmlybW93eWt4YWp1bWpva2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MDcwMTcsImV4cCI6MjA4MjE4MzAxN30.MmuI9evAbWX5jIIAIyEbaf9OolPjExqool7TcYbbCg8'

// Create a single supabase client for client-side usage
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// RSVP table interface
export interface RsvpEntry {
  id?: string
  email: string
  firstName: string
  lastName: string
  isAttending: boolean
  numberOfGuests: number
  plusOneFirstName?: string | null
  plusOneLastName?: string | null
  createdAt?: string
  updatedAt?: string
}
