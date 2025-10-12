/**
 * Dedupe Algorithm for Guest Management
 * 
 * Uses multiple matching strategies to find duplicate guests:
 * 1. Exact email match (highest confidence)
 * 2. Exact phone match (high confidence)
 * 3. Name similarity + address match (medium confidence)
 * 4. Fuzzy name matching (low confidence)
 */

// Levenshtein distance for string similarity
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

function similarityScore(a: string, b: string): number {
  if (!a || !b) return 0
  
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase())
  const maxLength = Math.max(a.length, b.length)
  
  if (maxLength === 0) return 0
  
  return 1 - distance / maxLength
}

export interface Guest {
  id: string
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  addressLine1?: string | null
  city?: string | null
  state?: string | null
  householdId?: string | null
}

export interface DuplicateMatch {
  guest1: Guest
  guest2: Guest
  confidence: "high" | "medium" | "low"
  matchReasons: string[]
  score: number
}

export function findDuplicates(guests: Guest[]): DuplicateMatch[] {
  const matches: DuplicateMatch[] = []
  const seen = new Set<string>()

  for (let i = 0; i < guests.length; i++) {
    for (let j = i + 1; j < guests.length; j++) {
      const g1 = guests[i]
      const g2 = guests[j]

      // Create unique pair ID
      const pairId = [g1.id, g2.id].sort().join("-")
      if (seen.has(pairId)) continue

      const match = compareGuests(g1, g2)
      if (match) {
        matches.push(match)
        seen.add(pairId)
      }
    }
  }

  // Sort by confidence and score
  return matches.sort((a, b) => {
    const confidenceOrder = { high: 3, medium: 2, low: 1 }
    const confDiff = confidenceOrder[b.confidence] - confidenceOrder[a.confidence]
    if (confDiff !== 0) return confDiff
    return b.score - a.score
  })
}

function compareGuests(g1: Guest, g2: Guest): DuplicateMatch | null {
  const matchReasons: string[] = []
  let confidence: "high" | "medium" | "low" = "low"
  let score = 0

  // Exact email match - HIGH confidence
  if (g1.email && g2.email && g1.email.toLowerCase() === g2.email.toLowerCase()) {
    matchReasons.push("Exact email match")
    confidence = "high"
    score += 100
  }

  // Exact phone match - HIGH confidence
  const phone1 = normalizePhone(g1.phone)
  const phone2 = normalizePhone(g2.phone)
  if (phone1 && phone2 && phone1 === phone2) {
    matchReasons.push("Exact phone match")
    confidence = "high"
    score += 100
  }

  // Name similarity
  const firstNameSimilarity = similarityScore(g1.firstName, g2.firstName)
  const lastNameSimilarity = similarityScore(g1.lastName, g2.lastName)

  if (firstNameSimilarity >= 0.8 && lastNameSimilarity >= 0.8) {
    matchReasons.push("Very similar names")
    score += 60
    if (confidence === "low") confidence = "medium"
  } else if (firstNameSimilarity >= 0.6 && lastNameSimilarity >= 0.6) {
    matchReasons.push("Similar names")
    score += 30
  }

  // Exact name match
  if (
    g1.firstName.toLowerCase() === g2.firstName.toLowerCase() &&
    g1.lastName.toLowerCase() === g2.lastName.toLowerCase()
  ) {
    matchReasons.push("Exact name match")
    score += 80
    if (confidence === "low") confidence = "medium"
  }

  // Address match (if names are similar)
  if (firstNameSimilarity >= 0.7 && lastNameSimilarity >= 0.7) {
    if (
      g1.addressLine1 &&
      g2.addressLine1 &&
      g1.addressLine1.toLowerCase() === g2.addressLine1.toLowerCase()
    ) {
      matchReasons.push("Same address")
      score += 40
      confidence = "high"
    }

    if (
      g1.city &&
      g2.city &&
      g1.state &&
      g2.state &&
      g1.city.toLowerCase() === g2.city.toLowerCase() &&
      g1.state.toLowerCase() === g2.state.toLowerCase()
    ) {
      matchReasons.push("Same city/state")
      score += 20
    }
  }

  // Same household
  if (g1.householdId && g2.householdId && g1.householdId === g2.householdId) {
    matchReasons.push("Same household")
    score += 50
    if (confidence === "low") confidence = "medium"
  }

  // Threshold for match
  if (score >= 30 && matchReasons.length > 0) {
    return {
      guest1: g1,
      guest2: g2,
      confidence,
      matchReasons,
      score,
    }
  }

  return null
}

function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null
  
  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, "")
  
  // Return last 10 digits (US format)
  if (digits.length >= 10) {
    return digits.slice(-10)
  }
  
  return digits || null
}

export interface MergeStrategy {
  firstName: "guest1" | "guest2" | "custom"
  lastName: "guest1" | "guest2" | "custom"
  email: "guest1" | "guest2" | "custom"
  phone: "guest1" | "guest2" | "custom"
  address: "guest1" | "guest2" | "custom"
  household: "guest1" | "guest2" | "custom"
  tags: "merge" | "guest1" | "guest2"
  rsvpResponses: "merge" | "guest1" | "guest2"
  invitations: "merge" | "guest1" | "guest2"
  customValues?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }
}

export function buildMergeData(
  guest1: any,
  guest2: any,
  strategy: MergeStrategy
) {
  const merged: any = {}

  // Simple fields
  const fields = ["firstName", "lastName", "email", "phone"]
  fields.forEach((field) => {
    const strategyValue = strategy[field as keyof MergeStrategy]
    if (strategyValue === "guest1") {
      merged[field] = guest1[field]
    } else if (strategyValue === "guest2") {
      merged[field] = guest2[field]
    } else if (strategyValue === "custom" && strategy.customValues) {
      merged[field] = strategy.customValues[field as keyof typeof strategy.customValues]
    }
  })

  // Address fields
  if (strategy.address === "guest1") {
    merged.addressLine1 = guest1.addressLine1
    merged.addressLine2 = guest1.addressLine2
    merged.city = guest1.city
    merged.state = guest1.state
    merged.zipCode = guest1.zipCode
    merged.country = guest1.country
    merged.addressId = guest1.addressId
  } else if (strategy.address === "guest2") {
    merged.addressLine1 = guest2.addressLine1
    merged.addressLine2 = guest2.addressLine2
    merged.city = guest2.city
    merged.state = guest2.state
    merged.zipCode = guest2.zipCode
    merged.country = guest2.country
    merged.addressId = guest2.addressId
  }

  // Household
  if (strategy.household === "guest1") {
    merged.householdId = guest1.householdId
  } else if (strategy.household === "guest2") {
    merged.householdId = guest2.householdId
  }

  return merged
}

export function detectConflicts(guest1: any, guest2: any): string[] {
  const conflicts: string[] = []

  if (
    guest1.email &&
    guest2.email &&
    guest1.email.toLowerCase() !== guest2.email.toLowerCase()
  ) {
    conflicts.push("Different emails")
  }

  if (guest1.phone && guest2.phone) {
    const p1 = normalizePhone(guest1.phone)
    const p2 = normalizePhone(guest2.phone)
    if (p1 && p2 && p1 !== p2) {
      conflicts.push("Different phone numbers")
    }
  }

  if (
    guest1.householdId &&
    guest2.householdId &&
    guest1.householdId !== guest2.householdId
  ) {
    conflicts.push("Different households")
  }

  if (
    guest1.addressLine1 &&
    guest2.addressLine1 &&
    guest1.addressLine1.toLowerCase() !== guest2.addressLine1.toLowerCase()
  ) {
    conflicts.push("Different addresses")
  }

  // RSVP status conflicts
  const rsvpStatuses = ["YES", "NO", "MAYBE"]
  if (guest1.rsvpResponses?.length > 0 && guest2.rsvpResponses?.length > 0) {
    const status1 = guest1.rsvpResponses[0].status
    const status2 = guest2.rsvpResponses[0].status
    if (status1 !== status2 && rsvpStatuses.includes(status1) && rsvpStatuses.includes(status2)) {
      conflicts.push("Different RSVP responses")
    }
  }

  return conflicts
}

