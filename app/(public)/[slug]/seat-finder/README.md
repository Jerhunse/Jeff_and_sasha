# Seat Finder Feature

## Overview
Public-facing page that allows wedding guests to search for their table assignments by name or phone number.

## URL Pattern
`/{wedding-slug}/seat-finder`

Example: `https://yoursite.com/thompson-wedding/seat-finder`

## Features
- **Search by name or phone**: Case-insensitive partial matching on first name, last name, or phone number
- **Elegant results display**: Shows table assignment with large decorative table name
- **Tablemates list**: 2-column grid showing other guests at the same table
- **Floor plan preview**: Placeholder modal for future floor plan integration
- **Responsive design**: Mobile-first design with elegant desktop split-screen layout
- **Error handling**: Graceful error boundary with retry functionality

## Components

### Main Files
- **`page.tsx`** - Server Component (main page layout)
  - Hero image section (desktop only)
  - Header with couple name and back link
  - Content area with search form
  - Footer with date and venue

- **`search-form.tsx`** - Client Component (search interface)
  - Search input with Material Symbols icons
  - Loading states with progress indicator
  - Results display with table assignment
  - Tablemates list with bullet styling
  - Action buttons (floor plan, new search)

- **`actions.ts`** - Server Actions (search logic)
  - `searchGuestSeat(slug, searchQuery)` function
  - Prisma database queries
  - Type-safe results with SearchResult interface

- **`floor-plan-modal.tsx`** - Client Component (floor plan preview)
  - Full-screen modal overlay
  - Placeholder content for future floor plan images
  - Close button with smooth transitions

- **`error.tsx`** - Error Boundary
  - Handles runtime errors gracefully
  - Retry functionality

## Usage

### For Guests
1. Navigate to `/{slug}/seat-finder`
2. Enter your first name, last name, or phone number
3. Press Enter or click the search icon
4. View your table assignment and tablemates
5. Optionally view floor plan (coming soon)

### For Administrators
1. Ensure wedding has a published seating chart in admin panel
2. Create tables in the seating chart
3. Assign guests to tables via the seating management interface
4. Share the seat-finder URL with guests

## Technical Details

### Database Queries
- Uses Prisma ORM with PostgreSQL
- Joins: Guest → Seat → Table → SeatingChart
- Only returns guests with seat assignments
- Case-insensitive partial matching using `mode: 'insensitive'`
- Includes tablemates (other guests at same table)

### Search Behavior
- **Search fields**: firstName, lastName, phone
- **Match type**: Partial, case-insensitive (e.g., "jul" matches "Julian")
- **Results**: Returns first matching guest only
- **No results**: Shows "No seating assignment found" message

### Styling
- **Colors**: 
  - Gold Leaf: `#c5a059` (primary accent)
  - Ivory: `#fdfcfb` (light backgrounds)
  - Charcoal: `#1a1a1a` (text)
- **Fonts**: 
  - Display: Cormorant Garamond (headings)
  - Script: Dancing Script (table names)
  - Sans: Inter (body text)
- **Icons**: Material Symbols Outlined

### Performance
- Server-side rendering for initial page load
- Server Actions for search (protects guest data)
- Client-side state management for interactivity
- Optimized Prisma queries with selective includes

## Data Requirements

### Required Database Setup
1. **Couple** - Published wedding with valid slug
2. **SeatingChart** - At least one seating chart for the wedding
3. **Table** - Tables created within seating chart
4. **Seat** - Guest assignments to tables
5. **Guest** - Guests with firstName, lastName, and/or phone

### Guest Data
Guests must have:
- Valid `firstName` and `lastName`
- Optional `phone` (for phone number search)
- At least one `Seat` record (linked to a Table)

### Example Query Result
```typescript
{
  guest: {
    id: "...",
    firstName: "Julian",
    lastName: "Barnes"
  },
  table: {
    name: "Table Seven",
    capacity: 8
  },
  seatingChart: {
    name: "Reception Seating",
    description: "The Rose Garden Pavilion"
  },
  tablemates: [
    { firstName: "Elena", lastName: "Thompson" },
    { firstName: "Michael", lastName: "Richardson" },
    // ... other guests at table
  ]
}
```

## Future Enhancements

### Planned Features
1. **Floor Plan Integration**
   - Upload venue floor plans to media library
   - Display floor plan with highlighted table location
   - Zoom and pan capabilities for large floor plans
   - Mobile-optimized version

2. **QR Code Integration**
   - Generate unique QR codes for each guest
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
   - Enhanced screen reader support

6. **Analytics**
   - Track search volume
   - Popular search times
   - Most searched names

## Testing

### Manual Testing Checklist
- [ ] Search by first name (exact and partial)
- [ ] Search by last name (exact and partial)
- [ ] Search by phone number
- [ ] Search with no results
- [ ] Search while already showing results
- [ ] Mobile and desktop layouts
- [ ] Floor plan button (modal opens/closes)
- [ ] "Search Different Name" button
- [ ] Error scenarios (invalid slug, server error)
- [ ] Loading states
- [ ] Special characters in names (O'Brien, José, etc.)

### Test Data Setup
```bash
# Create test data via Prisma Studio or admin panel
1. Create/use existing couple (e.g., slug: "thompson-wedding")
2. Create seating chart: "Reception Seating"
3. Create table: "Table Seven" in seating chart
4. Create/assign guests to table:
   - Julian Barnes (phone: 555-1234)
   - Elena Thompson
   - Michael Richardson
   - [etc.]
```

### Testing URLs
- Development: `http://localhost:3001/thompson-wedding/seat-finder`
- Production: `https://yoursite.com/thompson-wedding/seat-finder`

## Troubleshooting

### Common Issues

**Issue**: "No seating assignment found" for valid guest
- **Cause**: Guest not assigned to a table
- **Solution**: Assign guest to table in admin seating panel

**Issue**: Search returns null/error
- **Cause**: Wedding slug invalid or not published
- **Solution**: Verify wedding exists and `isPublished` is true

**Issue**: Tablemates list empty
- **Cause**: Guest is only person at table
- **Solution**: Normal behavior; section won't display if no tablemates

**Issue**: Material Symbols icons not showing
- **Cause**: Font stylesheet not loaded
- **Solution**: Verify `app/layout.tsx` includes Material Symbols link

**Issue**: Styles not matching design
- **Cause**: Custom Tailwind colors not configured
- **Solution**: Verify `app/globals.css` has gold-leaf, ivory, charcoal in @theme

### Debug Mode
Add to search form for debugging:
```typescript
console.log('Search result:', result)
console.log('Wedding slug:', slug)
```

## Security Considerations

- **Server-side search**: Search logic runs on server, not exposed to client
- **Only seated guests searchable**: Unseated guests won't appear in results
- **No authentication required**: Public feature by design
- **Parameterized queries**: Prisma prevents SQL injection
- **Rate limiting**: Not currently implemented (consider for production)

## Performance Optimization

- Server Components for initial render
- Client Components only for interactive elements
- Selective Prisma includes (only fetch needed data)
- Database indexes on `firstName`, `lastName`, `phone`
- Minimal JavaScript bundle

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled for search functionality
- Responsive breakpoints: 320px (mobile) to 1920px+ (desktop)

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus states on all interactive elements
- Sufficient color contrast ratios
- Responsive text sizing

## API Reference

### Server Action: `searchGuestSeat`

```typescript
async function searchGuestSeat(
  slug: string,
  searchQuery: string
): Promise<SearchResult | null>
```

**Parameters:**
- `slug` (string): Wedding slug from URL
- `searchQuery` (string): Search term (name or phone)

**Returns:**
- `SearchResult | null`: Guest seating info or null if not found

**SearchResult Type:**
```typescript
interface SearchResult {
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
```

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review implementation plan: `docs/plans/2026-02-22-seat-finder-implementation.md`
3. Review design doc: `docs/plans/2026-02-22-seat-finder-design.md`
4. Contact development team

## Version History

- **v1.0.0** (2026-02-22): Initial release
  - Basic search functionality
  - Table assignment display
  - Tablemates list
  - Floor plan placeholder
  - Error handling
