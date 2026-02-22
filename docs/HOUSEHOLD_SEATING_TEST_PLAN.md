# Household Seating Functionality - Manual Test Plan

## Test Environment Setup

**Prerequisites:**
1. Server running at http://localhost:3002
2. Logged in as admin user
3. Valle's household should exist with 3 members:
   - Valle
   - Becky Valle  
   - Rigo Valle

If Valle's household doesn't exist, run the setup script first:
```bash
npx tsx scripts/setup-valle-household.ts
```

## Test Scenarios

### Scenario 1: Initial Assignment to Empty Table

**Goal:** Verify that dragging a household head assigns all household members

**Steps:**
1. Navigate to http://localhost:3002/admin/seating
2. Verify Valle's household appears in the Guest Directory (right panel)
   - Should show "Valle's" as the household name
   - Should show 3 members listed under it
3. Locate Table 1 in the floor plan (left panel)
4. Drag Valle (or Valle's household) from the Guest Directory to Table 1
5. Wait for the assignment to complete

**Expected Results:**
- ✅ All 3 household members (Valle, Becky Valle, Rigo Valle) are added to Table 1
- ✅ Table 1 count increases from 0/10 to 3/10
- ✅ Success toast shows: "Assigned 3 members of Valle's to Table 1"
- ✅ All 3 names appear as badges in Table 1
- ✅ Valle's household is removed from the unseated guests list (if filtering by "Unseated")

**Screenshot Checklist:**
- [ ] Table 1 showing 3/10 with all Valle family members listed
- [ ] Success toast message
- [ ] Updated stats at top (Seated count increased by 3)

---

### Scenario 2: Duplicate Assignment Prevention

**Goal:** Verify that attempting to assign already-seated guests to the same table is prevented

**Steps:**
1. Continue from Scenario 1 (Valle's household is already at Table 1)
2. Try to drag Valle's household to Table 1 again
3. Watch for the error response

**Expected Results:**
- ✅ No action occurs (household stays at Table 1)
- ✅ Error toast shows: "Guest(s) already assigned to this table"
- ✅ Table 1 count remains 3/10 (no duplicates added)
- ✅ No confirmation dialog appears

**Screenshot Checklist:**
- [ ] Error toast message showing duplicate assignment warning
- [ ] Table 1 unchanged with same 3 members

---

### Scenario 3: Move to Different Table (Confirmation Required)

**Goal:** Verify that moving a household to a different table requires confirmation

**Steps:**
1. Continue from Scenario 1 (Valle's household is at Table 1)
2. Drag Valle's household to Table 2
3. A confirmation dialog should appear

**Expected Results - Part A (Dialog Appears):**
- ✅ Confirmation dialog appears with title: "Guest Already Assigned"
- ✅ Dialog message includes: "Valle's is already assigned to Table 1. Would you like to move them to the new table?"
- ✅ Dialog has two buttons: "Cancel" and "Move to New Table"

**Screenshot Checklist:**
- [ ] Confirmation dialog overlaying the page
- [ ] Clear message about current and target tables

**Steps - Part B:**
4. Click "Move to New Table" button

**Expected Results - Part B (After Confirmation):**
- ✅ All 3 Valle household members are removed from Table 1
- ✅ All 3 Valle household members are added to Table 2
- ✅ Table 1 count changes from 3/10 to 0/10
- ✅ Table 2 count changes from 0/10 to 3/10
- ✅ Success toast shows: "Assigned 3 members of Valle's to Table 2"
- ✅ Dialog closes automatically

**Screenshot Checklist:**
- [ ] Table 1 showing 0/10 (empty)
- [ ] Table 2 showing 3/10 with all Valle family members
- [ ] Success toast message

**Optional Test - Part C:**
Repeat steps 1-3 but click "Cancel" instead:
- ✅ Dialog closes
- ✅ Valle's household remains at Table 1
- ✅ No changes to any table assignments

---

### Scenario 4: Insufficient Capacity Error

**Goal:** Verify that assigning a household to a table without enough seats shows an error

**Setup Steps:**
1. First, we need to create a table with limited available seats
2. Find Table 3 and add 8 individual guests (non-household) to it
   - This leaves only 2 available seats on a capacity-10 table
3. Verify Table 3 shows 8/10

**Test Steps:**
4. Try to drag Valle's household (3 members) to Table 3 (only 2 seats available)

**Expected Results:**
- ✅ Assignment is rejected
- ✅ Error toast shows: "Insufficient capacity. Table 3 has 2 seats available but household requires 3 seats"
- ✅ Valle's household remains at their previous table (Table 1 or wherever they were)
- ✅ Table 3 count remains 8/10 (unchanged)
- ✅ No members are partially assigned

**Screenshot Checklist:**
- [ ] Table 3 showing 8/10 before attempt
- [ ] Error toast with capacity message
- [ ] Table 3 still showing 8/10 after attempt (no changes)
- [ ] Valle's household unchanged at original table

---

## Additional Verification Tests

### Test 5: Individual Household Member Assignment

**Goal:** Verify that individual household members cannot be separately assigned

**Steps:**
1. Expand Valle's household in the Guest Directory
2. Try to drag just "Becky Valle" (individual member) to a different table

**Expected Results:**
- Either: Individual members are not draggable separately (preferred)
- Or: Dragging an individual member moves the entire household with confirmation

### Test 6: Stats Panel Updates

**Goal:** Verify that statistics update correctly after household operations

**Steps:**
1. Note initial stats: Total Capacity, Total Guests, Seated, Unseated
2. Assign Valle's household (3 members) to Table 1
3. Verify stats update:
   - Seated increases by 3
   - Unseated decreases by 3

### Test 7: Filter by Seated/Unseated

**Goal:** Verify that filtering works with household assignments

**Steps:**
1. Click "Unseated" filter button
2. Verify Valle's household appears if not yet seated
3. Assign Valle's household to a table
4. Verify Valle's household disappears from the "Unseated" filtered view
5. Click "Seated" filter button
6. Verify Valle's household now appears in the "Seated" filtered view

---

## API Endpoint Testing (Backend Verification)

If you want to verify the backend directly:

```bash
# Test 1: Assign household to table
curl -X POST http://localhost:3002/api/admin/seating/[SEATING_CHART_ID]/tables/[TABLE_ID]/seats \
  -H "Content-Type: application/json" \
  -H "Cookie: [AUTH_COOKIE]" \
  -d '{
    "guestId": "[VALLE_GUEST_ID]",
    "householdId": "[VALLE_HOUSEHOLD_ID]"
  }'

# Expected: 200 OK with array of seat objects (3 seats created)

# Test 2: Try to assign to same table (should fail)
curl -X POST http://localhost:3002/api/admin/seating/[SEATING_CHART_ID]/tables/[TABLE_ID]/seats \
  -H "Content-Type: application/json" \
  -H "Cookie: [AUTH_COOKIE]" \
  -d '{
    "guestId": "[VALLE_GUEST_ID]",
    "householdId": "[VALLE_HOUSEHOLD_ID]"
  }'

# Expected: 409 Conflict with error: "ALREADY_AT_TABLE"

# Test 3: Assign to different table (should require force flag)
curl -X POST http://localhost:3002/api/admin/seating/[SEATING_CHART_ID]/tables/[DIFFERENT_TABLE_ID]/seats \
  -H "Content-Type: application/json" \
  -H "Cookie: [AUTH_COOKIE]" \
  -d '{
    "guestId": "[VALLE_GUEST_ID]",
    "householdId": "[VALLE_HOUSEHOLD_ID]",
    "force": true
  }'

# Expected: 200 OK with array of seat objects (3 seats created at new table, removed from old)
```

---

## Test Results Template

Copy this template for documenting your test results:

```
Test Date: ___________
Tester: ___________
Server Port: 3002
Browser: ___________

[ ] Scenario 1: Initial Assignment - PASSED / FAILED
    Notes: ___________

[ ] Scenario 2: Duplicate Prevention - PASSED / FAILED  
    Notes: ___________

[ ] Scenario 3: Move with Confirmation - PASSED / FAILED
    Notes: ___________

[ ] Scenario 4: Insufficient Capacity - PASSED / FAILED
    Notes: ___________

Issues Found:
1. ___________
2. ___________

Screenshots Attached:
- scenario1_result.png
- scenario2_error.png
- scenario3_dialog.png
- scenario3_after_move.png
- scenario4_capacity_error.png
```

---

## Known Limitations

Based on the current implementation:

1. **Household Creation**: The system assumes households are pre-created in the database
2. **Household Display**: The guest directory should group household members visually
3. **Drag Target**: Only the household head (primary guest) should be draggable
4. **Atomicity**: All household members are assigned/moved together (cannot split households)

---

## Troubleshooting

**If Valle's household doesn't appear:**
- Check database: `npx prisma studio` and verify Household table has "Valle's" entry
- Check Guest records have householdId set to Valle's household
- Verify the seating page query includes household data (it should based on the code)

**If drag-and-drop doesn't work:**
- Check browser console for JavaScript errors
- Verify the guest item has `draggable="true"` attribute
- Check network tab for API call failures

**If confirmation dialog doesn't appear:**
- Check browser console for errors
- Verify AlertDialog component is imported correctly
- Check that `confirmDialog` state is being set properly
