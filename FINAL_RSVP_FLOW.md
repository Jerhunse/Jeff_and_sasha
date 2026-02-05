# Final RSVP Flow - Guest Lookup Required

## Overview

The RSVP system now requires ALL guests to be in the database before they can RSVP. Guests cannot RSVP without being found in the system.

## Complete Flow

### Entry Points

There are two ways guests can access the RSVP system:

1. **Via Wedding Slug**: `/rsvp/jeff-and-sasha`
   - Shows lookup form
   - Guest must search to find their invitation
   
2. **Via Direct Invite Link**: `/rsvp/[inviteToken]`
   - Skips lookup (already identified)
   - Goes directly to attendance selection

---

## Step-by-Step User Journey

### Option A: Guest Has Direct Invite Link

```
User clicks: https://yoursite.com/rsvp/cm1abc123xyz

↓ [System finds guest automatically]

Step 1: Attendance Selection
Step 2: Confirm Guest Count
Step 3: Guest Details
Step 4: Submit → Success
```

### Option B: Guest Uses Website Link

```
User visits: https://yoursite.com/rsvp/jeff-and-sasha

↓

STEP 0: Guest Lookup (NEW)
- Enter name OR phone number
- Click "Find My Invitation"
- System searches database

↓ [If found]

STEP 1: Attendance Selection
STEP 2: Confirm Guest Count  
STEP 3: Guest Details
STEP 4: Submit → Success
```

---

## Detailed Step Breakdown

### STEP 0: Guest Lookup (Required for Website Entry)

**Screen Title**: "Find Your Invitation"

**Description**: "Enter your name or phone number to get started"

**Fields**:
- Name: Text input (e.g., "John Smith")
- — OR —
- Phone: Tel input (e.g., "(555) 123-4567")

**Validation**:
- At least one field must be filled
- Phone numbers are normalized (removes formatting)
- Name searches are case-insensitive

**Button**: "Find My Invitation"

**Possible Outcomes**:

1. **Single Match Found**
   - Redirects to: `/rsvp/[their-invite-token]`
   - Loads guest data automatically
   - Proceeds to Step 1

2. **Multiple Matches Found**
   - Shows dialog: "Multiple Matches Found"
   - Lists all matching guests with:
     - Full name
     - Phone number (if available)
     - Guest count allocation
   - Guest clicks their entry
   - Redirects to their invite page

3. **No Match Found**
   - Error message: "We couldn't find an invitation for that name or phone number. Please verify your information or contact the couple."
   - Shows contact link
   - **Cannot proceed without being in database**

**Example - Single Match**:
```
User enters: "Walter"
System finds: Walter (1 guest)
→ Redirects to /rsvp/[walter-token]
```

**Example - Multiple Matches**:
```
User enters: "Martinez"
System finds:
  - Pedro Martinez (3 guests) - (770) 310-4042
  - Jose Martinez (2 guests) - (404) 437-8496
  - Tino Martinez (2 guests) - No phone

User clicks: "Pedro Martinez"
→ Redirects to /rsvp/[pedro-token]
```

**Example - No Match**:
```
User enters: "Smith"
System finds: No matches
Error shown: "We couldn't find an invitation..."
→ Contact link provided
→ CANNOT RSVP
```

---

### STEP 1: Attendance Selection

**Screen Title**: "RSVP for [Guest Name]"

**Description**: "Will you be attending?"

**Large Buttons**:
```
┌─────────────────────┐  ┌─────────────────────┐
│         ✓           │  │         ✗           │
│  Joyfully Accepts   │  │ Regretfully Declines│
└─────────────────────┘  └─────────────────────┘
```

**Flow**:
- **If "Joyfully Accepts"**: → Step 2 (Confirm Count)
- **If "Regretfully Declines"**: → Step 3 (Optional Message)

---

### STEP 2: Confirm Guest Count (Attending Only)

**Screen Title**: "Confirm Your Party Size"

**Shows**:
```
┌────────────────────────────┐
│  Allocated guests: 4       │
│  Including yourself        │
└────────────────────────────┘

How many guests will be attending?

[1]  [2]  [3]  [4]
```

**Rules**:
- Minimum: 1 (the guest themselves)
- Maximum: Their allocated `maxGuestsAllowed`
- Buttons shown: 1 through maxGuestsAllowed
- Clicking a number immediately proceeds

**Examples**:

**Solo Guest (allocated 1)**:
```
Buttons shown: [1]
Only option: Themselves
```

**Couple (allocated 2)**:
```
Buttons shown: [1] [2]
Can choose: Solo or both
```

**Family (allocated 4)**:
```
Buttons shown: [1] [2] [3] [4]
Can choose: Any number from 1 to 4
```

**Back Button**: Returns to Step 1 (Attendance)

---

### STEP 3: Guest Details

#### For ATTENDING Guests:

**Section 1: Guest Names** (Required)

Shows N input fields based on confirmed count:

**Example - 3 guests selected**:
```
Guest Names
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your Name *
[Naomi Rodriguez                 ] (pre-filled, editable)

Guest 2 Name *
[                                ]

Guest 3 Name *
[                                ]
```

**Validation**:
- All fields required
- For single guest: Must have first AND last name
- Names are trimmed and checked for content

**Section 2: Contact Information** (Required)

```
Contact Information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email Address *
[naomi@example.com               ]
ℹ️ We'll send your confirmation here

Phone Number (Optional)
[(346) 203-7296                  ]
```

**Section 3: Message** (Optional)

```
Message to the Couple (Optional)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Can't wait to celebrate!        ]
[                                ]
[                                ]
```

**Buttons**:
- ← Back (returns to Step 2)
- Submit RSVP (with heart icon)

#### For DECLINING Guests:

**Only Shows**:
```
Message (Optional)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[We'll miss you! Hope to see you ]
[soon.                           ]
```

**Buttons**:
- ← Back (returns to Step 1)
- Submit RSVP

---

### STEP 4: Success Confirmation

**Shows**:
```
┌────────────────────────────┐
│          ✓                 │
│                            │
│       Thank You!           │
│                            │
│ Your RSVP has been         │
│ submitted successfully.    │
│                            │
│ Redirecting to website...  │
└────────────────────────────┘
```

**Actions**:
- Database updated with all information
- Confirmation email sent to guest
- After 3 seconds: Redirects to `/{wedding-slug}`

---

## Database Updates on Submit

### Guest Table
```javascript
{
  email: "naomi@example.com", // Updated
  phone: "(346) 203-7296",    // Updated
  notes: "RSVP Details: {...}" // Appended
}
```

### RSVPResponse Table
```javascript
{
  status: "YES",
  plusOneName: "Naomi Rodriguez, Carlos Rodriguez, Maria Rodriguez",
  answersJSON: {
    confirmedGuestCount: 3,
    allGuestNames: [
      "Naomi Rodriguez",
      "Carlos Rodriguez", 
      "Maria Rodriguez"
    ]
  },
  message: "Can't wait!",
  respondedAt: "2025-02-04T..."
}
```

### Supabase Sync
```javascript
{
  email: "naomi@example.com",
  first_name: "Naomi",
  last_name: "Rodriguez",
  phone: "(346) 203-7296",
  is_attending: true,
  number_of_guests: 3
}
```

---

## Key Rules & Restrictions

### ✅ Allowed

- Guest can select fewer guests than allocated
- Minimum 1 guest (themselves)
- Guest can navigate back through steps
- Guest can update existing RSVP

### ❌ Not Allowed

- **RSVP without being in database** ← NEW
- Exceed allocated guest count
- Skip required fields (names, email)
- Provide incomplete name (single word for solo guest)

---

## Error Messages

### Lookup Errors

**No match found**:
```
We couldn't find an invitation for that name or phone number.
Please verify your information or contact the couple.

[Contact us]
```

**Empty search**:
```
Please enter your phone number or name
```

### RSVP Submission Errors

**Missing guest names**:
```
Please provide names for all 3 guests
```

**Single name only (for solo guest)**:
```
Please provide both first and last name
```

**Missing email**:
```
Please enter your email address
```

**Exceeding allocation**:
```
You are allocated 4 guests, but selected 5
```

---

## Testing Scenarios

### Scenario 1: Direct Link (Skip Lookup)

```
User has link: /rsvp/cm1abc123xyz

Expected:
✓ Skips lookup step
✓ Shows "RSVP for [Name]"
✓ Proceeds through attendance → count → details
```

### Scenario 2: Website Entry (Requires Lookup)

```
User visits: /rsvp/jeff-and-sasha

Expected:
✓ Shows lookup form
✓ Cannot proceed without search
✓ After finding self, redirects to invite page
✓ Then proceeds through normal flow
```

### Scenario 3: Not in Database

```
User searches: "John Doe" (not invited)

Expected:
✓ Error message shown
✓ Contact link provided
✗ Cannot access RSVP form
✗ Cannot submit RSVP
```

### Scenario 4: Multiple Matches

```
User searches: "Martinez"
System finds 3 people

Expected:
✓ Dialog shows all 3 matches
✓ Each shows name, phone, guest count
✓ User selects correct one
✓ Redirects to their invite page
```

### Scenario 5: Reducing Guest Count

```
Guest: Aunt Naomi (allocated 4)
Selects: 2 guests attending

Expected:
✓ Can select 1, 2, 3, or 4
✓ Selects 2
✓ Only 2 name fields shown
✓ Submits successfully with 2 guests
✓ Database shows confirmedGuestCount: 2
```

---

## Files Modified

1. **`components/rsvp/rsvp-form.tsx`**
   - Added lookup step as Step 0
   - Added phone/name search functionality
   - Added multiple matches dialog
   - Guest lookup required before RSVP

2. **`app/(public)/rsvp/[code]/rsvp-lookup-form.tsx`**
   - Removed "RSVP now without code" option
   - Single lookup form (no choice between methods)
   - Clearer messaging: must find invitation

3. **`app/api/rsvp/[code]/route.ts`**
   - Already handles new data structure
   - Validates against database records

---

## Migration Notes

### Existing Behavior Preserved

- Direct invite links still work
- Existing RSVPs remain valid
- Email/phone fields backward compatible

### New Behavior

- **Website entry now requires lookup**
- **No RSVP without being in database**
- Clearer user journey
- Better guest validation

---

## Summary

The RSVP system now has a clear, secure flow:

1. **Guest must be in database** (no walk-ins)
2. **Lookup is required** (unless using direct link)
3. **Guest count confirmed** before name entry
4. **All attending guests named** (not just plus-ones)
5. **Email required** for confirmation
6. **No meal choices** (buffet style)

This ensures only invited guests can RSVP and provides accurate headcount with full guest names.
