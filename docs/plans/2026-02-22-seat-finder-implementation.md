# Seat Finder Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a public-facing seat finder page allowing wedding guests to search for their table assignments by name or phone number.

**Architecture:** Server Component page at `/{slug}/seat-finder` with Client Component search form. Server Actions handle database queries. Prisma queries Guest → Seat → Table for assignments and tablemates. Split-screen design with hero image and search interface.

**Tech Stack:** Next.js 15 App Router, React Server Components, Server Actions, Prisma ORM, PostgreSQL, Tailwind CSS, TypeScript

---

## Task 1: Create Page Structure and Routing

**Files:**
- Create: `app/(public)/[slug]/seat-finder/page.tsx`

**Step 1: Create the page file with basic Server Component structure**

Create `app/(public)/[slug]/seat-finder/page.tsx`:

```typescript
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"

interface SeatFinderPageProps {
  params: Promise<{ slug: string }>
}

async function getWedding(slug: string) {
  const wedding = await prisma.couple.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      partner1Name: true,
      partner2Name: true,
      weddingDate: true,
      isPublished: true,
      heroImageUrl: true,
      venueName: true,
    },
  })

  if (!wedding || !wedding.isPublished) {
    return null
  }

  return wedding
}

export async function generateMetadata({
  params,
}: SeatFinderPageProps): Promise<Metadata> {
  const { slug } = await params
  const wedding = await getWedding(slug)

  if (!wedding) {
    return {
      title: "Wedding Not Found",
    }
  }

  return {
    title: `Find Your Seat | ${wedding.partner1Name} & ${wedding.partner2Name}`,
    description: `Find your table assignment for ${wedding.partner1Name} and ${wedding.partner2Name}'s wedding.`,
  }
}

export default async function SeatFinderPage({ params }: SeatFinderPageProps) {
  const { slug } = await params
  const wedding = await getWedding(slug)

  if (!wedding) {
    notFound()
  }

  return (
    <div className="flex h-screen w-full">
      {/* Hero Image Section - Desktop Only */}
      <aside className="hidden lg:block lg:w-1/2 relative h-full overflow-hidden">
        <img
          alt={`${wedding.partner1Name} & ${wedding.partner2Name}`}
          className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-[3000ms]"
          src={
            wedding.heroImageUrl ||
            "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=1600&fit=crop"
          }
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-12 left-12 text-white z-10">
          <p className="font-sans text-xs tracking-[0.4em] uppercase opacity-80 mb-2">
            Celebrating Love
          </p>
          <h2 className="font-display text-4xl italic">
            {wedding.partner1Name} & {wedding.partner2Name}
          </h2>
        </div>
      </aside>

      {/* Main Content Section */}
      <main className="w-full lg:w-1/2 h-full flex flex-col bg-white overflow-y-auto relative">
        {/* Header */}
        <header className="p-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gold-leaf">flare</span>
            <span className="font-display tracking-widest uppercase text-xs">
              The {wedding.partner1Name.split(" ").pop()}s
            </span>
          </div>
          <a
            className="text-xs uppercase tracking-widest text-charcoal/60 hover:text-gold-leaf transition-colors"
            href={`/${wedding.slug}`}
          >
            Back to home
          </a>
        </header>

        {/* Content Area - Will contain search form */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-20 py-12">
          <div className="w-full max-w-md space-y-12">
            <div className="space-y-4 text-center">
              <h1 className="font-display text-4xl md:text-5xl text-charcoal">
                Find Your Seat
              </h1>
              <p className="font-sans text-sm text-charcoal/50 uppercase tracking-[0.2em]">
                Enter your name to view your table
              </p>
            </div>
            {/* Search form will go here */}
            <div className="text-center text-charcoal/40">
              Search form coming soon...
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-8 text-center">
          <p className="font-display italic text-charcoal/30 text-sm">
            {new Date(wedding.weddingDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            • {wedding.venueName || "The Estate"}
          </p>
        </footer>
      </main>
    </div>
  )
}
```

**Step 2: Test the page loads**

Run: `npm run dev`
Navigate to: `http://localhost:3001/{your-test-slug}/seat-finder`
Expected: Page loads with hero image, header, placeholder content, and footer

**Step 3: Verify styling works**

Check:
- Split screen layout on desktop (50/50)
- Hero image on left, content on right
- Mobile: full-width content (hero hidden)
- Typography: Playfair Display for headings
- Colors match theme

**Step 4: Commit**

```bash
git add app/(public)/[slug]/seat-finder/page.tsx
git commit -m "feat: create seat finder page structure and routing"
```

---

## Task 2: Create Server Action for Guest Search

**Files:**
- Create: `app/(public)/[slug]/seat-finder/actions.ts`

**Step 1: Create Server Action file with search function**

Create `app/(public)/[slug]/seat-finder/actions.ts`:

```typescript
"use server"

import { prisma } from "@/lib/prisma"

export interface SearchResult {
  guest: {
    id: string
    firstName: string
    lastName: string
  }
  table: {
    name: string
    capacity: number
  }
  seatingChart: {
    name: string
    description: string | null
  }
  tablemates: Array<{
    firstName: string
    lastName: string
  }>
}

export async function searchGuestSeat(
  slug: string,
  searchQuery: string
): Promise<SearchResult | null> {
  // Validate input
  if (!searchQuery || searchQuery.trim().length === 0) {
    return null
  }

  const trimmedQuery = searchQuery.trim()

  // Get wedding couple ID
  const wedding = await prisma.couple.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!wedding) {
    return null
  }

  // Search for guest with seat assignment
  const guests = await prisma.guest.findMany({
    where: {
      coupleId: wedding.id,
      AND: [
        {
          seats: {
            some: {}, // Only guests with seat assignments
          },
        },
        {
          OR: [
            {
              firstName: {
                contains: trimmedQuery,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: trimmedQuery,
                mode: "insensitive",
              },
            },
            {
              phone: {
                contains: trimmedQuery,
                mode: "insensitive",
              },
            },
          ],
        },
      ],
    },
    include: {
      seats: {
        include: {
          table: {
            include: {
              seatingChart: {
                select: {
                  name: true,
                  description: true,
                },
              },
              seats: {
                include: {
                  guest: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    take: 1,
  })

  // Return null if no guest found
  if (guests.length === 0 || !guests[0].seats[0]) {
    return null
  }

  const guest = guests[0]
  const seat = guest.seats[0]
  const table = seat.table

  // Get tablemates (exclude the searching guest)
  const tablemates = table.seats
    .filter((s) => s.guest.id !== guest.id)
    .map((s) => ({
      firstName: s.guest.firstName,
      lastName: s.guest.lastName,
    }))

  return {
    guest: {
      id: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
    },
    table: {
      name: table.name,
      capacity: table.capacity,
    },
    seatingChart: {
      name: table.seatingChart.name,
      description: table.seatingChart.description,
    },
    tablemates,
  }
}
```

**Step 2: Test Server Action manually (optional verification)**

You can test this later with the search form. For now, verify TypeScript compilation:

Run: `npm run build` (or just let it compile in dev mode)
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add app/(public)/[slug]/seat-finder/actions.ts
git commit -m "feat: add server action for guest seat search"
```

---

## Task 3: Create Search Form Client Component

**Files:**
- Create: `app/(public)/[slug]/seat-finder/search-form.tsx`

**Step 1: Create search form Client Component**

Create `app/(public)/[slug]/seat-finder/search-form.tsx`:

```typescript
"use client"

import { useState } from "react"
import { searchGuestSeat, SearchResult } from "./actions"

interface SearchFormProps {
  slug: string
}

export function SearchForm({ slug }: SearchFormProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()

    if (!searchQuery.trim()) {
      return
    }

    setIsSearching(true)
    setHasSearched(true)

    try {
      const data = await searchGuestSeat(slug, searchQuery)
      setResult(data)
    } catch (error) {
      console.error("Search error:", error)
      setResult(null)
    } finally {
      setIsSearching(false)
    }
  }

  function handleReset() {
    setSearchQuery("")
    setResult(null)
    setHasSearched(false)
  }

  return (
    <div className="w-full space-y-12">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative group">
        <input
          className="w-full bg-transparent border-0 border-b border-charcoal/10 py-4 px-0 font-display text-2xl italic focus:ring-0 focus:border-gold-leaf placeholder:text-charcoal/20 transition-all disabled:opacity-50"
          placeholder="First or Last Name"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isSearching}
        />
        <button
          type="submit"
          className="absolute right-0 bottom-4 text-gold-leaf hover:scale-110 transition-transform disabled:opacity-50"
          disabled={isSearching}
        >
          <span className="material-symbols-outlined">
            {isSearching ? "progress_activity" : "search"}
          </span>
        </button>
      </form>

      {/* Results */}
      {hasSearched && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {result ? (
            <div className="pt-12 border-t border-charcoal/5 space-y-10">
              {/* Table Assignment */}
              <div className="text-center space-y-2">
                <span className="font-sans text-[10px] uppercase tracking-[0.5em] text-gold-leaf font-bold">
                  Assigned Table
                </span>
                <div className="font-script text-7xl md:text-8xl text-gold-leaf pt-4">
                  {result.table.name}
                </div>
                {result.seatingChart.description && (
                  <p className="font-display italic text-charcoal/60 text-lg">
                    {result.seatingChart.description}
                  </p>
                )}
              </div>

              {/* Tablemates */}
              {result.tablemates.length > 0 && (
                <div className="bg-ivory/50 p-8 rounded-sm space-y-6">
                  <h4 className="font-sans text-[10px] uppercase tracking-[0.3em] text-charcoal/40 text-center mb-4">
                    Your Tablemates
                  </h4>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm font-sans text-charcoal/70">
                    {result.tablemates.map((mate, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-gold-leaf rounded-full" />
                        <span>
                          {mate.firstName} {mate.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  className="w-full bg-charcoal text-white py-5 px-8 font-sans text-xs uppercase tracking-[0.3em] hover:bg-gold-leaf transition-colors flex items-center justify-center gap-3"
                  onClick={() => alert("Floor plan coming soon!")}
                >
                  <span className="material-symbols-outlined text-sm">map</span>
                  View Floor Plan
                </button>
                <button
                  type="button"
                  className="w-full border border-charcoal/10 py-4 font-sans text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hover:bg-ivory transition-colors"
                  onClick={handleReset}
                >
                  Search Different Name
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-12 border-t border-charcoal/5 text-center space-y-4">
              <p className="font-sans text-charcoal/60">
                No seating assignment found
              </p>
              <p className="font-sans text-sm text-charcoal/40">
                Please check your spelling or try searching by phone number
              </p>
              <button
                type="button"
                className="mt-6 border border-charcoal/10 py-4 px-8 font-sans text-[10px] uppercase tracking-[0.2em] text-charcoal/40 hover:bg-ivory transition-colors"
                onClick={handleReset}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Test component compiles**

Run: `npm run dev` (let TypeScript compile)
Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add app/(public)/[slug]/seat-finder/search-form.tsx
git commit -m "feat: add search form client component with results display"
```

---

## Task 4: Integrate Search Form into Page

**Files:**
- Modify: `app/(public)/[slug]/seat-finder/page.tsx`

**Step 1: Import and add SearchForm component**

Replace the placeholder content in `app/(public)/[slug]/seat-finder/page.tsx`:

Change from:
```typescript
            {/* Search form will go here */}
            <div className="text-center text-charcoal/40">
              Search form coming soon...
            </div>
```

To:
```typescript
            <SearchForm slug={wedding.slug} />
```

And add the import at the top:
```typescript
import { SearchForm } from "./search-form"
```

Full updated section:

```typescript
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import { SearchForm } from "./search-form"

// ... rest of the file stays the same until the content area ...

        {/* Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-20 py-12">
          <div className="w-full max-w-md space-y-12">
            <div className="space-y-4 text-center">
              <h1 className="font-display text-4xl md:text-5xl text-charcoal">
                Find Your Seat
              </h1>
              <p className="font-sans text-sm text-charcoal/50 uppercase tracking-[0.2em]">
                Enter your name to view your table
              </p>
            </div>
            <SearchForm slug={wedding.slug} />
          </div>
        </div>
```

**Step 2: Test the integrated page**

Run: `npm run dev`
Navigate to: `http://localhost:3001/{your-test-slug}/seat-finder`
Expected: Search form appears with input field and search icon

**Step 3: Verify basic interactions**

Test:
- Type in the input field
- Click search button
- See loading state (spinning icon)

**Step 4: Commit**

```bash
git add app/(public)/[slug]/seat-finder/page.tsx
git commit -m "feat: integrate search form into seat finder page"
```

---

## Task 5: Add Custom Fonts Configuration

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Add Google Fonts to layout**

Add the Pinyon Script font import to the existing fonts configuration in `app/layout.tsx`:

Check if the file already has font imports. If it does, add Pinyon Script to them. If not, add:

```typescript
import { Playfair_Display, Inter } from "next/font/google"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})
```

Note: You'll need to check if Pinyon Script is available via next/font/google or use the existing Google Fonts link in the head.

**Step 2: Verify fonts are working**

Run: `npm run dev`
Check: Table names display in script font when results show

**Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: add custom fonts configuration for seat finder"
```

---

## Task 6: Add Tailwind Custom Classes

**Files:**
- Modify: `tailwind.config.ts`

**Step 1: Verify custom color classes exist**

Check `tailwind.config.ts` for these custom colors:
- `gold-leaf`: `#c5a059`
- `ivory`: `#fdfcfb`
- `charcoal`: `#1a1a1a`

If they don't exist, add them to the theme.extend.colors section:

```typescript
colors: {
  "gold-leaf": "#c5a059",
  "ivory": "#fdfcfb",
  "charcoal": "#1a1a1a",
  // ... other colors
}
```

**Step 2: Verify font families**

Check for these font families in theme.extend.fontFamily:
```typescript
fontFamily: {
  "display": ["Playfair Display", "serif"],
  "sans": ["Inter", "sans-serif"],
  "script": ["Pinyon Script", "cursive"],
  // ... other fonts
}
```

**Step 3: Test custom classes work**

Run: `npm run dev`
Inspect elements to verify classes apply correctly

**Step 4: Commit if changes were made**

```bash
git add tailwind.config.ts
git commit -m "feat: add custom tailwind classes for seat finder styling"
```

---

## Task 7: Add Material Symbols Icons Support

**Files:**
- Modify: `app/layout.tsx` or `app/(public)/[slug]/seat-finder/page.tsx`

**Step 1: Add Material Symbols stylesheet**

Check if Material Symbols is already loaded in the app. If not, add to the seat-finder page metadata or root layout:

```typescript
<link
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
  rel="stylesheet"
/>
```

Since we're using Next.js 15, you can add this via the metadata or in a `<head>` section.

Actually, checking the mockup HTML you provided, it uses a `<link>` tag in the head. For Next.js App Router, we can add this to the page component using the `<link>` tag in a head export or use `next/head`.

For simplicity, add it directly in the page component if not already globally available.

**Step 2: Test icons render**

Run: `npm run dev`
Check: Search icon, map icon, and flare icon all display correctly

**Step 3: Commit if changes were made**

```bash
git add [modified-files]
git commit -m "feat: add material symbols icons support"
```

---

## Task 8: End-to-End Testing with Real Data

**Files:**
- None (testing only)

**Step 1: Create test data in database**

Using Prisma Studio or admin panel:
1. Ensure a wedding with known slug exists
2. Create a seating chart for that wedding
3. Create a table in that seating chart
4. Assign at least 3-4 guests to that table
5. Note one guest's first name and phone number

**Step 2: Test search by first name**

Navigate to: `http://localhost:3001/{slug}/seat-finder`
- Enter guest's first name
- Click search
- Verify: Table assignment displays
- Verify: Tablemates list shows other guests
- Verify: Searching guest is NOT in tablemates list

**Step 3: Test search by last name**

- Click "Search Different Name"
- Enter guest's last name
- Click search
- Verify: Same results appear

**Step 4: Test search by phone**

- Click "Search Different Name"
- Enter guest's phone number
- Click search
- Verify: Results appear

**Step 5: Test partial search**

- Search with only first 3-4 letters of first name
- Verify: Guest is found

**Step 6: Test no results**

- Search for non-existent name
- Verify: "No seating assignment found" message appears
- Verify: "Try Again" button works

**Step 7: Test floor plan button**

- Search for a guest with valid results
- Click "View Floor Plan"
- Verify: Alert shows "Floor plan coming soon!"

**Step 8: Test responsive design**

- Resize browser to mobile width
- Verify: Layout stacks properly
- Verify: Hero image is hidden
- Verify: Content is full-width
- Verify: All interactions still work

**Step 9: Document test results**

Create notes of any issues found for fixes

---

## Task 9: Fix Any Bugs Found in Testing

**Files:**
- Varies based on bugs found

**Step 1: Address any TypeScript errors**

Fix type mismatches or missing types

**Step 2: Address any styling issues**

Fix responsive breakpoints, spacing, colors that don't match design

**Step 3: Address any functionality issues**

Fix search logic, state management, or data fetching problems

**Step 4: Commit fixes**

```bash
git add [fixed-files]
git commit -m "fix: resolve issues found in seat finder testing"
```

---

## Task 10: Add Loading States Improvement (Optional Enhancement)

**Files:**
- Modify: `app/(public)/[slug]/seat-finder/search-form.tsx`

**Step 1: Add better loading indicator**

Replace the simple spinning icon with a more elegant loading state:

```typescript
{isSearching && (
  <div className="pt-12 border-t border-charcoal/5 text-center">
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-charcoal/10 rounded w-1/4 mx-auto" />
      <div className="h-16 bg-charcoal/5 rounded w-1/2 mx-auto" />
      <div className="h-4 bg-charcoal/10 rounded w-1/3 mx-auto" />
    </div>
  </div>
)}
```

**Step 2: Test loading state**

Add artificial delay to test:
```typescript
await new Promise(resolve => setTimeout(resolve, 1000))
```

Then remove it after testing.

**Step 3: Commit**

```bash
git add app/(public)/[slug]/seat-finder/search-form.tsx
git commit -m "feat: improve loading state animation"
```

---

## Task 11: Add Error Boundary (Optional Enhancement)

**Files:**
- Create: `app/(public)/[slug]/seat-finder/error.tsx`

**Step 1: Create error boundary**

Create `app/(public)/[slug]/seat-finder/error.tsx`:

```typescript
"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex h-screen items-center justify-center bg-ivory">
      <div className="text-center space-y-6 p-8">
        <h1 className="font-display text-3xl text-charcoal">
          Something went wrong
        </h1>
        <p className="font-sans text-charcoal/60">
          We encountered an error loading the seat finder.
        </p>
        <button
          onClick={reset}
          className="bg-charcoal text-white py-3 px-8 font-sans text-xs uppercase tracking-wider hover:bg-gold-leaf transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
```

**Step 2: Test error boundary**

Temporarily throw an error in the page component to test:
```typescript
throw new Error("Test error")
```

Verify error boundary catches it. Then remove the test error.

**Step 3: Commit**

```bash
git add app/(public)/[slug]/seat-finder/error.tsx
git commit -m "feat: add error boundary to seat finder page"
```

---

## Task 12: Final Verification and Documentation

**Files:**
- Create: `app/(public)/[slug]/seat-finder/README.md`

**Step 1: Create feature documentation**

Create `app/(public)/[slug]/seat-finder/README.md`:

```markdown
# Seat Finder Feature

## Overview
Public-facing page that allows wedding guests to search for their table assignments by name or phone number.

## URL Pattern
`/{wedding-slug}/seat-finder`

## Features
- Search by first name, last name, or phone number
- Case-insensitive partial matching
- Display table assignment and location
- Show list of tablemates
- Placeholder for floor plan view
- Responsive design (mobile and desktop)

## Components
- `page.tsx` - Server Component (main page)
- `search-form.tsx` - Client Component (search interface)
- `actions.ts` - Server Actions (search logic)

## Usage
1. Guest navigates to `/{slug}/seat-finder`
2. Enters their name or phone number
3. Views their table assignment and tablemates

## Technical Details
- Uses Next.js 15 Server Components + Server Actions
- Database queries via Prisma
- Only shows guests who have been assigned to tables
- Requires published wedding with active seating chart

## Future Enhancements
- Floor plan image integration
- QR code search
- Multi-event support
- Downloadable seating card
```

**Step 2: Run final tests**

- Test all search variations
- Test responsive design
- Test error states
- Test with multiple guests
- Test with no results

**Step 3: Create final commit**

```bash
git add app/(public)/[slug]/seat-finder/README.md
git commit -m "docs: add seat finder feature documentation"
```

**Step 4: Push changes**

```bash
git push origin main
```

---

## Verification Checklist

Before marking complete, verify:

- [ ] Page loads at `/{slug}/seat-finder`
- [ ] Search by first name works
- [ ] Search by last name works
- [ ] Search by phone works
- [ ] Partial matches work
- [ ] Case-insensitive search works
- [ ] Table assignment displays correctly
- [ ] Tablemates list excludes searching guest
- [ ] No results state works
- [ ] "Search Different Name" resets form
- [ ] "View Floor Plan" shows placeholder
- [ ] Responsive design works on mobile
- [ ] Hero image displays on desktop
- [ ] Typography matches design
- [ ] Colors match design (gold-leaf, ivory, charcoal)
- [ ] Animations are smooth
- [ ] Icons display correctly
- [ ] Error boundary works
- [ ] Code is committed to git

---

## Notes

- Ensure Material Symbols icons are loaded (may already be global)
- Verify custom Tailwind classes exist in config
- Test with real wedding data before production
- Floor plan feature is intentionally a placeholder for future work
- Search only returns first match if multiple guests found (expected behavior)
