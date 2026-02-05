# RSVP Guest List Import - Instructions

This guide will help you import the guest list and enable phone/name-based RSVP lookup.

## What's Changed

1. **Database Schema**: Added `maxGuestsAllowed` field to track party size for each guest
2. **Lookup API**: Updated to support searching by name, email, or phone number
3. **RSVP Form**: Now shows the correct number of allowed guests and validates against it
4. **Import Script**: Created to import all guest data from your CSV

## Step 1: Run Database Migration

Run the Prisma migration to add the new `maxGuestsAllowed` field:

```bash
npx prisma migrate dev --name add_max_guests_allowed
```

If you prefer to push the schema without creating a migration:

```bash
npx prisma db push
```

## Step 2: Import Guest Data

Run the import script to add all guests to the database:

```bash
npx tsx scripts/import-guest-list.ts
```

This script will:
- Create location-based tags (Texas, Georgia, New York, Nashville, Spain)
- Import all 87 guests from your list
- Set the correct party size (`maxGuestsAllowed`) for each guest
- Store phone numbers for lookup
- Skip guests that already exist (based on name or phone)

## Step 3: Verify Import

Check the import results in the console output. You should see:
- Number of guests imported
- Number of guests skipped (if any already existed)
- Any errors encountered

You can also verify in your database or admin panel that guests were created correctly.

## How It Works

### For Guests Without Phone Numbers

Guests without phone numbers in your list can still RSVP by:
1. Going to `/rsvp/jeff-and-sasha` (or your wedding slug)
2. Searching by their name
3. Selecting their name from the results (if multiple matches)
4. Completing the RSVP form with their allocated guest count

### For Guests With Phone Numbers

Guests with phone numbers can RSVP by:
1. Going to `/rsvp/jeff-and-sasha`
2. Entering their phone number OR name
3. Being automatically matched to their invitation
4. Seeing their allocated guest count and completing the RSVP

### Guest Verification Flow

When a guest enters their phone number or name:
1. System looks them up in the database
2. If found, they see a confirmation: "Is this you? [Guest Name] - [X guests]"
3. They can confirm or search again
4. Once confirmed, they complete the RSVP with the exact number of guests allocated to them

### Party Size Management

- The `maxGuestsAllowed` field includes the primary guest + additional guests
- For example, "Valle's, 2 guests" means Valle can bring 1 additional guest
- The RSVP form automatically limits the dropdown to the correct number
- The form shows: "You have X additional guests allowed"

## Guest Data Summary

- **Total Guests**: 87 parties
- **Locations**: Texas (12), Georgia (62), New York (6), Nashville (3), Spain (1)
- **With Phone Numbers**: 73 parties
- **Without Phone Numbers**: 14 parties

## Testing

Test the RSVP flow:

1. **By Phone**: Go to `/rsvp/jeff-and-sasha` and enter a phone number like `(404) 980-9690`
2. **By Name**: Go to `/rsvp/jeff-and-sasha` and search for "Walter" or "Erhunse"
3. **Multiple Matches**: Search for "Martinez" to test the multiple match dialog

## Notes

- Phone numbers are normalized (digits only) for matching
- US numbers with leading "1" are automatically normalized to 10 digits
- International numbers (like Spain) are preserved as-is
- Names with "/" or "&" (like "Damara / Mary") use the first name as primary
- Family groups (like "Erhunse Family") are stored with "Family" as last name
