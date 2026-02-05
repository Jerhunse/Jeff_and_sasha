# RSVP System Test Plan

This document outlines the test scenarios to verify the RSVP lookup and submission system.

## Prerequisites

- Database has been migrated with `maxGuestsAllowed` field
- Guest list has been imported via `scripts/import-guest-list.ts`
- Dev server is running: `npm run dev`

## Test Scenarios

### Scenario 1: Phone Number Lookup (Exact Match)

**Objective**: Verify guests can be found by their phone number

**Steps**:
1. Navigate to `/rsvp/jeff-and-sasha`
2. Enter phone number: `(404) 980-9690`
3. Click "Find my invitation"

**Expected Result**:
- System finds "Jeffery Erhunse"
- Redirects to RSVP form
- Form shows party size: 2 guests (1 primary + 1 additional)

### Scenario 2: Name Lookup (Single Match)

**Objective**: Verify guests can be found by name when there's only one match

**Steps**:
1. Navigate to `/rsvp/jeff-and-sasha`
2. Enter name: `Walter`
3. Click "Find my invitation"

**Expected Result**:
- System finds "Walter" immediately
- Redirects to RSVP form
- Form shows party size: 1 guest (no additional guests)

### Scenario 3: Name Lookup (Multiple Matches)

**Objective**: Verify disambiguation dialog for common names

**Steps**:
1. Navigate to `/rsvp/jeff-and-sasha`
2. Enter name: `Martinez`
3. Click "Find my invitation"

**Expected Result**:
- Dialog appears showing 3 matches:
  - Pedro Martinez (3 guests) - (770) 310-4042
  - Jose Martinez (2 guests) - (404) 437-8496
  - Tino Martinez (2 guests) - No phone
- User can select correct match
- Redirects to RSVP form with correct party size

### Scenario 4: Partial Name Match

**Objective**: Verify partial name matching works

**Steps**:
1. Navigate to `/rsvp/jeff-and-sasha`
2. Enter name: `Erhu`
3. Click "Find my invitation"

**Expected Result**:
- Dialog shows multiple matches:
  - Jeffery Erhunse (2 guests)
  - Hamson Erhunse (2 guests)
  - Erhunse Family (3 guests)

### Scenario 5: Guest Without Phone Number

**Objective**: Verify name-based lookup for guests without phone numbers

**Steps**:
1. Navigate to `/rsvp/jeff-and-sasha`
2. Enter name: `Saraí`
3. Click "Find my invitation"

**Expected Result**:
- System finds guest by name
- Form shows party size: 3 guests (1 primary + 2 additional)
- Phone field is empty or optional

### Scenario 6: RSVP Submission with Additional Guests

**Objective**: Verify party can RSVP with correct number of additional guests

**Steps**:
1. Search for: `Aunt Naomi` (4 guests allowed)
2. Select RSVP status: "Joyfully Accepts"
3. Enter contact information
4. Select "3" additional guests
5. Enter names for all 3 additional guests
6. Submit RSVP

**Expected Result**:
- Dropdown limits to 0-3 additional guests (total max: 4)
- Form requires names for all 3 additional guests
- RSVP saves successfully
- Confirmation message displays
- Database shows 4 total guests (1 primary + 3 additional)

### Scenario 7: Guest Count Validation

**Objective**: Verify guests cannot exceed their allocated count

**Steps**:
1. Search for: `Walter` (1 guest allowed)
2. Select RSVP status: "Joyfully Accepts"

**Expected Result**:
- Additional guest dropdown shows only "None"
- No option to add plus-ones
- Form can be submitted with just primary guest

### Scenario 8: Large Party RSVP

**Objective**: Test maximum party size handling

**Steps**:
1. Search for: `Karla Rosada` (5 guests allowed)
2. Select "4" additional guests
3. Enter 4 names

**Expected Result**:
- Dropdown shows 0-4 additional guests
- Form requires all 4 names
- Successfully submits with 5 total guests

### Scenario 9: No Match Found

**Objective**: Verify error handling for non-existent guests

**Steps**:
1. Navigate to `/rsvp/jeff-and-sasha`
2. Enter name: `Nonexistent Person`
3. Click "Find my invitation"

**Expected Result**:
- Error message displays: "We couldn't find an invitation..."
- Form suggests RSVP now without code or contact couple
- User can click "RSVP now" button to proceed without lookup

### Scenario 10: International Phone Number

**Objective**: Verify international phone number handling

**Steps**:
1. Navigate to `/rsvp/jeff-and-sasha`
2. Enter phone: `+34 631 95 81 86` (Spain)
3. Click "Find my invitation"

**Expected Result**:
- System finds "Arimi Family" (5 guests)
- International number is properly normalized and matched

### Scenario 11: Phone Number Normalization

**Objective**: Verify various phone formats are recognized

**Test Cases**:
- `(404) 980-9690` ✓
- `404-980-9690` ✓
- `4049809690` ✓
- `1-404-980-9690` ✓
- `14049809690` ✓

**Expected Result**: All formats find the same guest

### Scenario 12: Declining RSVP

**Objective**: Verify declining RSVP works correctly

**Steps**:
1. Search for any guest
2. Select "Regretfully Declines"
3. Optionally add message
4. Submit

**Expected Result**:
- No additional guest fields shown
- RSVP saves with status "DECLINED"
- Confirmation email sent (if email provided)

### Scenario 13: Updating Existing RSVP

**Objective**: Verify guests can update their RSVP

**Steps**:
1. Search for guest who already RSVP'd
2. Change status from "Attending" to "Declined"
3. Submit

**Expected Result**:
- Form pre-fills with existing RSVP data
- Update saves successfully
- Guest activity log records the change

### Scenario 14: Location Tag Verification

**Objective**: Verify location tags were created correctly

**Steps**:
1. Open Prisma Studio: `npx prisma studio`
2. Navigate to Tag table
3. Check for location tags

**Expected Result**:
- 5 tags exist: Texas, Georgia, New York, Nashville, Spain
- Each tag has correct color
- Tags are properly linked to guests via GuestTag

### Scenario 15: Guest Statistics

**Objective**: Verify import statistics are accurate

**Steps**:
1. Run: `npx tsx scripts/verify-guest-import.ts`

**Expected Result**:
```
📋 Total Guest Parties: 120
📞 Parties with Phone Numbers: 91
👥 Total Guest Capacity: 210 people

📍 Breakdown by Location:
   Georgia: 64 parties, 127 guests
   Texas: 12 parties, 24 guests
   ...
```

## Performance Tests

### Load Test: Multiple Concurrent Lookups

**Objective**: Verify system handles multiple simultaneous lookups

**Steps**:
1. Open 10 browser tabs
2. Simultaneously search for different guests
3. Monitor response times

**Expected Result**:
- All lookups complete successfully
- Response times remain reasonable (<2s)
- No database connection issues

### Database Query Efficiency

**Objective**: Verify lookups are performant

**Steps**:
1. Check Prisma query logs
2. Verify indexes are being used
3. Monitor query execution time

**Expected Result**:
- Phone lookup uses `phone` index
- Name lookup uses `firstName` and `lastName` indexes
- Query times <100ms for single lookups

## Edge Cases

### Empty/Null Values

- Guest with null phone number
- Guest with empty last name
- Guest with special characters in name

### Data Integrity

- Duplicate phone numbers (should be prevented)
- Missing required fields
- Invalid phone number formats

### Concurrent Updates

- Two people updating same guest RSVP simultaneously
- Database transaction handling

## Automated Test Examples

```typescript
// Example Jest test
describe('RSVP Lookup API', () => {
  it('should find guest by phone number', async () => {
    const response = await fetch('/api/rsvp/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: 'jeff-and-sasha',
        phone: '(404) 980-9690'
      })
    })
    
    const data = await response.json()
    expect(data.found).toBe(true)
    expect(data.firstName).toBe('Jeffery')
    expect(data.maxGuestsAllowed).toBe(2)
  })
  
  it('should handle multiple matches', async () => {
    const response = await fetch('/api/rsvp/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: 'jeff-and-sasha',
        name: 'Martinez'
      })
    })
    
    const data = await response.json()
    expect(data.found).toBe(true)
    expect(data.multiple).toBe(true)
    expect(data.guests.length).toBeGreaterThan(1)
  })
})
```

## Regression Tests

After any future changes, re-run these critical tests:

1. ✅ Phone number lookup works
2. ✅ Name lookup with disambiguation works
3. ✅ Guest count limits are enforced
4. ✅ RSVP submission saves correctly
5. ✅ No guests can exceed their allocated count

## Known Limitations

1. **Case Sensitivity**: Name searches are case-insensitive (expected behavior)
2. **Partial Matches**: Name search uses `contains` - may return unrelated matches
3. **Phone Format**: Some international formats may need manual verification
4. **Duplicate Names**: Common names require phone number for disambiguation

## Test Data

### Sample Guests for Testing

| Name | Phone | Max Guests | Location |
|------|-------|------------|----------|
| Walter | (214) 543-8131 | 1 | Texas |
| Jeffery Erhunse | (404) 980-9690 | 2 | Georgia |
| Aunt Naomi | (346) 203-7296 | 4 | Texas |
| Karla Rosada | (678) 471-7824 | 5 | Georgia |
| Saraí | None | 3 | Texas |
| Pedro Martinez | (770) 310-4042 | 3 | Georgia |
| Jose Martinez | (404) 437-8496 | 2 | Georgia |
| Tino Martinez | None | 2 | Georgia |

## Bug Reporting Template

If you find issues during testing, report using this format:

```
**Issue**: [Brief description]
**Scenario**: [Which test scenario]
**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: [What should happen]
**Actual Result**: [What actually happened]
**Screenshots**: [If applicable]
**Environment**: [Browser, OS, etc.]
```

## Success Criteria

All tests should:
- ✅ Complete without errors
- ✅ Return correct guest data
- ✅ Enforce party size limits
- ✅ Handle edge cases gracefully
- ✅ Provide clear error messages
- ✅ Maintain data integrity
