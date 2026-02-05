# RSVP Navigation Enhancement

## Overview
Added a "Back to Home" button to the RSVP form that allows users to easily navigate back to the wedding website home page at any point during the RSVP process.

## Changes Made

### File: `components/rsvp/rsvp-form.tsx`

#### 1. Added Icons
```typescript
import { ArrowLeft, Home } from "lucide-react"
```

#### 2. Added Navigation Handler
```typescript
const handleGoBack = () => {
  // Navigate to the wedding home page
  router.push(`/${couple.slug}`)
}
```

#### 3. Updated Card Header Layout
- Changed header to use flexbox layout with `justify-between`
- Added a "Back to Home" button in the top-right corner
- Button features:
  - Ghost variant (subtle appearance)
  - Home icon for visual clarity
  - Text "Back to Home" that hides on small screens (mobile)
  - Responsive design (icon-only on mobile, icon + text on desktop)

## Visual Design

The button appears in the top-right corner of the RSVP form card:

```
┌─────────────────────────────────────────────────┐
│  RSVP for John Smith        [🏠 Back to Home]  │
├─────────────────────────────────────────────────┤
│                                                  │
│  [Form Content]                                  │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Responsive Behavior:
- **Desktop/Tablet**: Shows home icon + "Back to Home" text
- **Mobile**: Shows home icon only (text hidden with `hidden sm:inline`)

## User Experience

### Navigation Flow:
1. User clicks "Back to Home" at any point in the RSVP process
2. User is redirected to `/{couple.slug}` (wedding home page)
3. Works from all RSVP steps:
   - Guest lookup
   - Attendance selection
   - Guest count confirmation
   - Guest details entry

### Benefits:
- **Exit Strategy**: Users can leave the RSVP form without completing it
- **Exploration**: Users can review wedding details before completing RSVP
- **Flexibility**: Users aren't trapped in the RSVP flow
- **Better UX**: Matches user expectations for web navigation

## Technical Details

### Button Properties:
- **Type**: `button` (prevents form submission)
- **Variant**: `ghost` (subtle, non-intrusive)
- **Size**: `sm` (compact)
- **Classes**: `flex items-center gap-2` (icon + text layout)
- **Responsive**: `hidden sm:inline` on text span

### Navigation Target:
- Destination: `/${couple.slug}`
- Example: `/jeff-and-sasha`
- This is the main wedding website home page

## Alternative Considered

Instead of a separate home button, we could have used:
- Browser back button (but this navigates through history, not necessarily to home)
- Cancel button (but might imply discarding changes)
- Exit link in footer (but less discoverable)

The home button in the header was chosen for:
- Clear intent (going to home page)
- High visibility (always in header)
- Universal understanding (home icon)
- Non-destructive action

## Future Enhancements

Potential improvements:
- Add confirmation dialog if form has unsaved changes
- Add breadcrumb navigation (Home > RSVP > Step Name)
- Add "Save & Continue Later" functionality
- Add progress indicator with navigation

## Testing

To test:
1. Visit any RSVP page (e.g., `/rsvp/{inviteToken}`)
2. Click "Back to Home" button in top-right corner
3. Verify navigation to `/{couple.slug}`
4. Test on mobile (verify text is hidden, icon remains)
5. Test on desktop (verify both icon and text appear)

## Status

✅ **Complete** - Navigation enhancement is live and functional.
