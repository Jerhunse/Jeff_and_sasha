# Seat Finder Feature Design

**Date:** February 22, 2026  
**Author:** AI Assistant  
**Status:** Approved

## Overview

A public-facing seat finder page that allows wedding guests to search for their table assignment by name or phone number. The page displays the guest's assigned table, location, and tablemates in an elegant, user-friendly interface.

## Requirements

### Functional Requirements
- Guests can search by first name, last name, or phone number
- Case-insensitive partial matching (e.g., "Julian" or "Barnes" finds "Julian Barnes")
- Display table assignment with table name and location
- Show list of other guests seated at the same table
- Placeholder "View Floor Plan" button for future enhancement
- "Search Different Name" functionality to reset the search

### Non-Functional Requirements
- Accessible via public route: `/{slug}/seat-finder`
- No authentication required
- Only show guests who have been assigned to tables
- Guests without table assignments won't appear in search results
- Server-side search to protect guest data privacy
- Responsive design (mobile-first, elegant desktop layout)

## Architecture

### Technology Stack
- **Framework:** Next.js 15 (App Router)
- **Server Components:** For initial page render
- **Client Components:** For search form and interactive elements
- **Server Actions:** For search functionality
- **Database:** PostgreSQL via Prisma ORM
- **Styling:** Tailwind CSS with custom theme

### File Structure
```
app/(public)/[slug]/seat-finder/
├── page.tsx                 # Server Component (main page)
├── actions.ts               # Server Actions (search logic)
└── components/
    ├── search-form.tsx      # Client Component (search input)
    └── search-results.tsx   # Client Component (results display)
```

## Implementation Approach

### Approach Selected: Server-Side Search with Server Actions

**Why this approach:**
- Follows Next.js 15 best practices (Server Components + Server Actions)
- Better SEO and initial page load performance
- Protects guest data (search logic runs server-side)
- No exposed API endpoints to secure
- Type-safe end-to-end with TypeScript and Prisma
- Cleaner architecture without separate API routes

**Trade-offs considered:**
- Requires JavaScript enabled (acceptable for this interactive feature)
- Slightly more complex state management vs. traditional API routes (but benefits outweigh)

## Component Architecture

```
SeatFinderPage (Server Component)
├── Hero Image Section
│   ├── Couple illustration/photo
│   ├── Dark overlay
│   └── Couple names overlay
└── Content Section
    ├── Header
    │   ├── Couple branding
    │   └── "Back to home" link
    ├── SeatSearchForm (Client Component)
    │   ├── Title: "Find Your Seat"
    │   ├── Subtitle with instructions
    │   ├── Search input field
    │   └── Search icon/button
    └── SearchResults (Client Component)
        ├── Conditional rendering based on search state
        ├── Table assignment display
        │   ├── "Assigned Table" label
        │   ├── Table name (large script font)
        │   └── Location/pavilion name
        ├── Tablemates section
        │   ├── Section header
        │   └── 2-column grid of names
        └── Action buttons
            ├── "View Floor Plan" (placeholder)
            └── "Search Different Name"
```

## Data Flow

### Search Process
1. User enters name or phone number in search input
2. User presses Enter or clicks search icon
3. Client Component calls Server Action `searchGuestSeat(slug, query)`
4. Server Action:
   - Validates wedding slug exists
   - Queries database for matching guests with seat assignments
   - Filters by coupleId and search criteria
   - Includes related Seat → Table → SeatingChart data
   - Fetches tablemates (other guests at same table)
5. Server Action returns results to Client Component
6. Client Component updates UI based on results

### Database Query Strategy

**Prisma Query:**
```typescript
await prisma.guest.findMany({
  where: {
    coupleId,
    AND: [
      {
        seats: {
          some: {} // Only guests with seat assignments
        }
      },
      {
        OR: [
          { firstName: { contains: searchQuery, mode: 'insensitive' } },
          { lastName: { contains: searchQuery, mode: 'insensitive' } },
          { phone: { contains: searchQuery, mode: 'insensitive' } }
        ]
      }
    ]
  },
  include: {
    seats: {
      include: {
        table: {
          include: {
            seatingChart: true,
            seats: {
              include: { 
                guest: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  take: 1 // Return first match
})
```

**Query Optimizations:**
- Include only necessary fields for tablemates (firstName, lastName)
- Limit to first matching result (prevents showing duplicates)
- Case-insensitive search using Prisma's `mode: 'insensitive'`
- Composite filter ensures only seated guests are searchable

## UI States

### 1. Initial State
- Empty search input with placeholder: "First or Last Name"
- Search icon visible
- No results displayed
- Hero image visible on left (desktop)

### 2. Searching State
- Loading indicator displayed
- Search input disabled during search
- Previous results (if any) remain visible

### 3. Results Found
- Smooth fade-in animation
- Table assignment card displays:
  - "ASSIGNED TABLE" label (small caps, gold)
  - Table name (large elegant script font)
  - Location/pavilion name (italic)
- Tablemates section displays:
  - "YOUR TABLEMATES" label (small caps)
  - 2-column grid of guest names with bullet points
- Action buttons appear:
  - "View Floor Plan" (dark background)
  - "Search Different Name" (light border)

### 4. No Results Found
- Message: "No seating assignment found"
- Helpful text: "Please check your spelling or try searching by phone number"
- "Search Different Name" button

### 5. Error State
- Generic error message: "Something went wrong. Please try again."
- Option to retry search

## Design Specifications

### Layout
- **Desktop:** Split-screen (50/50)
  - Left: Hero image with couple
  - Right: Search functionality and results
- **Mobile:** Stacked layout
  - Hero image hidden or minimized
  - Full-width content section

### Typography
- **Headings:** Playfair Display (serif)
- **Body:** Inter (sans-serif)
- **Script/Decorative:** Pinyon Script (for table names)

### Colors
- **Primary:** `#c5a059` (gold-leaf)
- **Background:** `#fdfcfb` (ivory)
- **Text:** `#1a1a1a` (charcoal)
- **Accent:** Gold for highlights and decorative elements

### Spacing & Rhythm
- Generous whitespace for elegance
- Consistent padding: 2rem (32px) on mobile, 3rem (48px) on desktop
- Card padding: 2rem

## Floor Plan Feature

### Current Implementation
- Button labeled "View Floor Plan" is present and styled
- Clicking opens a modal with placeholder content:
  - Title: "Floor Plan Coming Soon"
  - Message: "We're preparing the venue floor plan. Check back soon!"
  - Close button

### Future Enhancement
- Upload floor plan image to Media library
- Display floor plan with highlighted table location
- Zoom and pan capabilities for large floor plans
- Mobile-optimized version

## Error Handling

### Edge Cases
1. **Guest with multiple table assignments**
   - Display first assignment only
   - Log warning for admin review

2. **Special characters in names**
   - Prisma handles automatically
   - No sanitization needed (parameterized queries)

3. **Phone number format variations**
   - Search accepts any format (with/without spaces, dashes, parentheses)
   - Database stores normalized format

4. **Empty search query**
   - Show validation message: "Please enter a name or phone number"

5. **Wedding not found (invalid slug)**
   - Return 404 page

6. **Server/database errors**
   - Graceful error message
   - Log error for debugging
   - Allow retry

## Security Considerations

- Server-side search prevents data exposure
- Only seated guests are searchable (privacy for unseated guests)
- No authentication bypass concerns (public feature by design)
- Rate limiting not required (read-only, low-risk)
- Prisma parameterized queries prevent SQL injection

## Performance Considerations

- Server Component for initial render (fast First Contentful Paint)
- Client Component only for interactive search (minimal JS)
- Prisma query optimized with selective includes
- Database indexes on `firstName`, `lastName`, `phone` (already exist)
- Responsive images for hero section

## Testing Strategy

### Manual Testing
- Search by first name (exact and partial)
- Search by last name (exact and partial)
- Search by phone number
- Search with no results
- Search while already showing results
- Mobile and desktop layouts
- Floor plan button (placeholder modal)
- "Search Different Name" button
- Error scenarios (invalid slug, server error)

### Edge Case Testing
- Names with special characters (O'Brien, José, etc.)
- Very long names
- Phone numbers with various formats
- Empty/whitespace-only queries
- Multiple guests with similar names

## Future Enhancements

1. **Floor Plan Integration**
   - Upload and display venue floor plans
   - Highlight guest's table on map
   - Interactive zoom/pan

2. **QR Code Integration**
   - Generate QR codes for each guest
   - Scan to auto-fill search

3. **Multi-Event Support**
   - Select which event (ceremony, reception, etc.)
   - Different seating for different events

4. **Guest Photos**
   - Display tablemate profile pictures
   - Help guests recognize each other

5. **Accessibility**
   - Downloadable PDF of seating chart
   - High contrast mode
   - Screen reader optimization

## Success Metrics

- Guests can find their seat in < 30 seconds
- Zero authentication barriers
- Mobile-friendly (works on all devices)
- Elegant presentation matching wedding aesthetic
- Zero exposed security vulnerabilities

## Timeline & Dependencies

### Dependencies
- Wedding slug must be active and published
- Seating chart must be created in admin
- Guests must be assigned to tables
- Hero image should be uploaded (optional, fallback available)

### Implementation Order
1. Create page structure and routing
2. Implement Server Action for search
3. Build search form Client Component
4. Build results display Client Component
5. Add floor plan placeholder modal
6. Style and responsive design
7. Testing and refinement

---

**Next Steps:** Create detailed implementation plan with step-by-step tasks.
