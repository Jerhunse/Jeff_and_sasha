# Updated RSVP Flow - Step-by-Step Guide

## Overview

The RSVP flow has been redesigned to match your exact requirements:
1. Guest looks up their invitation by phone or name
2. Guest confirms or adjusts their party size
3. Guest provides names for all attending guests
4. Guest provides email for confirmation
5. Database is updated with all information

## New RSVP Flow

### Step 1: Guest Lookup
**Location**: `/rsvp/jeff-and-sasha`

Guest can search by:
- **Phone Number**: `(404) 980-9690`
- **Name**: `Erhunse` or `Walter`
- **Email**: `guest@example.com`

**What Happens**:
- System searches database for matches
- If multiple matches, shows disambiguation dialog
- Guest selects their entry
- System loads their allocated guest count

---

### Step 2: Attendance Selection
**Screen**: "Will you be attending?"

**Options**:
- ✓ **Joyfully Accepts** → Proceeds to guest count confirmation
- ✗ **Regretfully Declines** → Skips to optional message

**Example**:
```
Guest: Walter
Allocated: 1 guest
Selects: "Joyfully Accepts"
→ Goes to guest count confirmation
```

---

### Step 3: Confirm Guest Count
**Screen**: "Confirm Your Party Size"

**Shows**:
```
Allocated guests: 4
Including yourself

How many guests will be attending?
[1] [2] [3] [4]
```

**Rules**:
- Must select at least 1 guest (themselves)
- Can select up to their allocated amount
- Cannot exceed allocated guest count
- Clicking a number immediately advances to next step

**Example**:
```
Guest: Aunt Naomi
Allocated: 4 guests
Options shown: 1, 2, 3, or 4
Guest selects: 3
→ Goes to guest details with 3 name fields
```

---

### Step 4: Guest Details
**Screen**: "Guest Names"

**For Attending**:

1. **Guest Names** (Required)
   - Shows N input fields (based on confirmed count)
   - First field: "Your Name" (pre-filled if known, editable)
   - Additional fields: "Guest 2 Name", "Guest 3 Name", etc.
   - All fields required
   - For single guest, validates first + last name provided

2. **Email Address** (Required)
   - Used for RSVP confirmation
   - Validation: must be valid email format

3. **Phone Number** (Optional)
   - Can be provided for additional contact

4. **Message** (Optional)
   - Free text for couple

**For Declining**:
- Only shows optional message field
- No guest names or email required

**Example - Attending with 3 guests**:
```
Guest Names:
→ Guest 1: Naomi Rodriguez [pre-filled]
→ Guest 2: Carlos Rodriguez
→ Guest 3: Maria Rodriguez

Email Address: naomi@example.com
Phone: (346) 203-7296 [optional]
Message: Can't wait! [optional]
```

**Example - Single Guest**:
```
Guest Names:
→ Your Name: Walter Johnson
  (Must include both first and last name)

Email Address: walter@example.com
```

---

### Step 5: Confirmation & Database Update

**What Gets Saved**:

```javascript
{
  status: "YES" (or "NO"),
  confirmedGuestCount: 3,
  allGuestNames: [
    "Naomi Rodriguez",
    "Carlos Rodriguez", 
    "Maria Rodriguez"
  ],
  email: "naomi@example.com",
  phone: "(346) 203-7296",
  message: "Can't wait!",
  respondedAt: "2025-02-04T..."
}
```

**Database Updates**:
1. **Guest Table**: Updates email and phone
2. **RSVPResponse Table**: Creates/updates response with:
   - Status (YES/NO/MAYBE)
   - All guest names (stored in `plusOneName` as comma-separated)
   - Confirmed count (in `answersJSON`)
   - Message
3. **Guest Notes**: Appends RSVP details for admin reference
4. **Supabase Sync**: Updates legacy RSVP table

**Success Message**:
```
✓ Thank You!
Your RSVP has been submitted successfully.
Redirecting you to the wedding website...
```

---

## Key Features Removed

### ❌ Meal Choice Questions
**Why**: Wedding is buffet style, no meal selection needed

Previously asked:
- Meal choice (Chicken, Beef, Fish, Vegetarian)
- Dietary restrictions

Now: Not included in flow

### ❌ Song Requests
**Why**: Not part of new simplified flow

### ❌ Bus Transportation
**Why**: Not part of new simplified flow

---

## Validation Rules

### Attending Guests

1. **Guest Count**:
   - Minimum: 1 guest
   - Maximum: `maxGuestsAllowed` (from database)
   - Cannot exceed allocated amount

2. **Guest Names**:
   - All name fields must be filled
   - For single guest: Must include first AND last name
   - Names are trimmed and validated as non-empty

3. **Email**:
   - Required for attending guests
   - Must be valid email format
   - Used for confirmation email

4. **Phone**:
   - Optional
   - Saved if provided

### Declining Guests

- No required fields
- Optional message only

---

## User Experience Examples

### Example 1: Solo Guest

```
1. Search: "Walter" + phone "(214) 543-8131"
2. Found: Walter (1 guest allocated)
3. Select: "Joyfully Accepts"
4. Confirm: Clicks "1" (only option)
5. Enter:
   - Name: Walter Martinez
   - Email: walter@example.com
6. Submit → Success!
```

**Result**: 1 guest attending (Walter)

---

### Example 2: Couple

```
1. Search: "(404) 980-9690"
2. Found: Jeffery Erhunse (2 guests allocated)
3. Select: "Joyfully Accepts"  
4. Confirm: Clicks "2" (full party)
5. Enter:
   - Guest 1: Jeffery Erhunse
   - Guest 2: Sasha Contreras
   - Email: jeff@example.com
6. Submit → Success!
```

**Result**: 2 guests attending (Jeffery, Sasha)

---

### Example 3: Family Reducing Count

```
1. Search: "Aunt Naomi"
2. Found: Aunt Naomi (4 guests allocated)
3. Select: "Joyfully Accepts"
4. Confirm: Clicks "2" (only 2 can make it)
5. Enter:
   - Guest 1: Naomi Rodriguez
   - Guest 2: Carlos Rodriguez
   - Email: naomi@example.com
   - Message: "Sorry kids can't make it!"
6. Submit → Success!
```

**Result**: 2 guests attending out of 4 allocated

---

### Example 4: Declining

```
1. Search: "Martinez"
2. Multiple matches shown
3. Select: Tino Martinez (2 guests)
4. Select: "Regretfully Declines"
5. Enter:
   - Message: "Will miss you guys!"
6. Submit → Success!
```

**Result**: 0 guests attending (declined)

---

## Technical Implementation

### Form State Management

```typescript
{
  status: 'ATTENDING' | 'DECLINED' | 'MAYBE',
  step: 'attendance' | 'confirm-count' | 'guest-details',
  confirmedGuestCount: number,
  guestNames: string[], // Array of all guest names
  email: string,
  phone: string,
  message: string
}
```

### Step Navigation

```
[Attendance]
    ↓ (if Attending)
[Confirm Count]
    ↓
[Guest Details] → Submit
    
[Attendance]
    ↓ (if Declining)
[Message] → Submit
```

### Back Button Behavior

- From Guest Details → Confirm Count
- From Confirm Count → Attendance
- From Message (declining) → Attendance

---

## API Request Format

### New Format (Sent by Form)

```json
{
  "status": "ATTENDING",
  "confirmedGuestCount": 3,
  "guestNames": [
    "Naomi Rodriguez",
    "Carlos Rodriguez",
    "Maria Rodriguez"
  ],
  "email": "naomi@example.com",
  "phone": "(346) 203-7296",
  "message": "Can't wait!"
}
```

### Legacy Format (Still Supported)

```json
{
  "status": "ATTENDING",
  "plusOneCount": 2,
  "plusOneNames": ["Guest 2", "Guest 3"],
  "email": "guest@example.com"
}
```

The API automatically handles both formats for backward compatibility.

---

## Database Schema

### RSVPResponse Table

```prisma
model RSVPResponse {
  status: RsvpStatus // YES, NO, MAYBE
  plusOneName: String? // ALL guest names (comma-separated)
  answersJSON: String? // Contains:
    // {
    //   "confirmedGuestCount": 3,
    //   "allGuestNames": ["Name 1", "Name 2", "Name 3"]
    // }
  message: String?
}
```

### Guest Table Updates

```prisma
model Guest {
  email: String? // Updated on RSVP
  phone: String? // Updated on RSVP
  notes: String? // Appended with RSVP details
  maxGuestsAllowed: Int // Maximum party size
}
```

---

## Admin View

Admins can see in guest notes:

```json
RSVP Details: {
  "totalGuests": 3,
  "allGuestNames": [
    "Naomi Rodriguez",
    "Carlos Rodriguez",
    "Maria Rodriguez"
  ],
  "confirmedDate": "2025-02-04T12:34:56.789Z"
}
```

Plus the response status, email, and message in the RSVPResponse record.

---

## Testing Checklist

- [ ] Single guest RSVP (count = 1)
- [ ] Couple RSVP (count = 2)
- [ ] Family RSVP (count = 4)
- [ ] Reducing guest count (allocated 4, select 2)
- [ ] Declining RSVP
- [ ] Validation: Missing guest names
- [ ] Validation: Single name only (should require first + last)
- [ ] Validation: Missing email
- [ ] Validation: Exceeding allocated count
- [ ] Back button navigation
- [ ] Phone number lookup
- [ ] Name lookup with multiple matches
- [ ] Email confirmation sent
- [ ] Database updated correctly

---

## Migration Notes

### Existing RSVPs

Old RSVPs with the previous format will:
- Still display correctly
- Can be updated using new flow
- Get converted to new format on update

### Data Consistency

- `plusOneName` field stores ALL guest names (not just plus-ones)
- `answersJSON` contains structured data with counts and names
- Both maintained for backward compatibility
