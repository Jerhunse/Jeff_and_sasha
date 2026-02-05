# Song Request Feature - Implementation Summary

## Overview
Added a song request field to the RSVP form that allows guests to request songs for the wedding reception. The requests are captured in the database and displayed in the admin dashboard.

## Changes Made

### 1. RSVP Form (Frontend)
**File**: `components/rsvp/rsvp-form.tsx`

- Added `Music` icon import from lucide-react
- Added `songRequest` field to the form state
- Added song request input field in the form UI (between Contact Information and Message sections)
- The field only displays when `couple.askSongRequest` is true
- The field is optional and includes helpful placeholder text: "Artist - Song Title"
- Styled with a gold music icon for visual appeal

### 2. Database Schema
**File**: `prisma/schema.prisma`

Added RSVP feature flags to the `Couple` model:
```prisma
askMealChoice   Boolean      @default(false)
mealOptions     String?      // JSON array of meal options
askSongRequest  Boolean      @default(true)
askBusTransport Boolean      @default(false)
busRoutes       String?      // JSON array of bus routes
```

The `askSongRequest` field defaults to `true`, allowing couples to easily enable/disable this feature.

### 3. API Route (Backend)
**File**: `app/api/rsvp/[code]/route.ts`

The song request is already captured in the API:
- Received from the form submission (line 42)
- Stored in the `answersJSON` field of the RSVPResponse (line 145)
- Included in confirmation emails (line 326)

### 4. Admin Dashboard - RSVP Dashboard
**File**: `app/(admin)/admin/rsvp-dashboard/rsvp-dashboard-client.tsx`

#### CSV Export Enhancement
- Added "Song Request" column to the exported CSV
- Added "Guest Count" and "Guest Names" columns for better tracking
- Song requests are extracted from the `answersJSON` field and included in exports

#### Guest Details Dialog Enhancement
- Song requests are now displayed prominently with a music emoji (🎵)
- Styled in a highlighted box with primary color for visibility
- Separated from other additional details for better UX
- Other metadata fields (like guest count) are filtered out from the display

### 5. Database Migration
Ran `npx prisma db push` to sync the schema changes to the database without data loss.

## How It Works

### For Guests (RSVP Flow):
1. Guest navigates through the RSVP form
2. After confirming attendance and providing contact information
3. The song request field appears (if enabled by the couple)
4. Guest can optionally enter a song request (e.g., "Taylor Swift - Love Story")
5. The request is submitted along with other RSVP details

### For Admins (Dashboard View):
1. Navigate to `/admin/rsvp-dashboard`
2. Click "View Details" (eye icon) on any guest
3. Song requests appear prominently in the "Additional Details" section
4. Export to CSV includes a dedicated "Song Request" column
5. Song requests can be viewed for all attending guests at once via CSV

## Database Structure

Song requests are stored in the `RSVPResponse` table:
- **Field**: `answersJSON` (String, JSON format)
- **Structure**: `{ "songRequest": "Artist - Song Title", ... }`

Example:
```json
{
  "confirmedGuestCount": 2,
  "allGuestNames": ["John Smith", "Jane Smith"],
  "songRequest": "The Beatles - Here Comes The Sun"
}
```

## Configuration

Couples can enable/disable the song request feature by setting `askSongRequest` in their couple record:

```typescript
// Enable song requests
await prisma.couple.update({
  where: { id: coupleId },
  data: { askSongRequest: true }
})

// Disable song requests
await prisma.couple.update({
  where: { id: coupleId },
  data: { askSongRequest: false }
})
```

## Testing

To test the feature:

1. **As a Guest**:
   - Visit an RSVP link (e.g., `/rsvp/{inviteToken}`)
   - Select "Joyfully Accepts"
   - Confirm guest count
   - Fill in contact information
   - Enter a song request in the "Song Request" field
   - Submit the RSVP

2. **As an Admin**:
   - Visit `/admin/rsvp-dashboard`
   - Find the guest who submitted
   - Click the "View Details" button
   - Verify the song request appears in the dialog
   - Export to CSV and verify the "Song Request" column

## Future Enhancements

Potential improvements:
- Add song request validation (check if song exists via Spotify API)
- Show a list of all song requests on a dedicated admin page
- Create a playlist automatically from requests
- Allow admins to mark songs as "approved" or "added to playlist"
- Add song request statistics (most requested artists, genres, etc.)

## Related Files

- `components/rsvp/rsvp-form.tsx` - Form UI
- `app/api/rsvp/[code]/route.ts` - API handler
- `app/(admin)/admin/rsvp-dashboard/rsvp-dashboard-client.tsx` - Admin dashboard
- `prisma/schema.prisma` - Database schema
- `lib/email.ts` - Email confirmation templates (song request included)

## Status

✅ **Complete** - Feature is fully implemented and ready for use.
