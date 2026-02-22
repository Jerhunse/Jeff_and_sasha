# Household Seating - Quick Test Checklist

## Pre-Test Setup

- [ ] Development server running on http://localhost:3002
- [ ] Logged in as admin user
- [ ] Valle's household exists (run `npx tsx scripts/setup-valle-household.ts` if needed)

## Visual Inspection

Open http://localhost:3002/admin/seating

### Guest Directory (Right Panel)

- [ ] Valle's household appears with header showing "Valle's" and member count badge (3)
- [ ] Three members listed under Valle's:
  - [ ] Valle
  - [ ] Becky Valle
  - [ ] Rigo Valle
- [ ] Each guest card is draggable (cursor changes to move icon on hover)
- [ ] Household icon (Users icon) appears next to "Valle's" header

### Tables (Left Panel)

- [ ] Head Table visible at top
- [ ] Table 1-18 visible in grid below
- [ ] Each table shows capacity (e.g., "0 / 10")
- [ ] Tables have hover effect and cursor pointer

### Stats Bar (Top)

- [ ] Total Capacity shows correct number
- [ ] Total Guests count visible
- [ ] Seated / Unseated counts displayed

---

## Test Scenario 1: Initial Assignment

**Goal:** Assign Valle's household to Table 1

### Steps:
1. [ ] Locate Valle's household in Guest Directory (right panel)
2. [ ] Click and hold on any Valle household member card
3. [ ] Drag to "Table 1" in the round tables grid
4. [ ] Release mouse button

### Expected Results:
- [ ] Success toast appears: "Assigned 3 members of Valle's to Table 1"
- [ ] Table 1 count updates to "3 / 10"
- [ ] Table 1 card shows 3 badges with names:
  - [ ] Valle
  - [ ] Becky Valle
  - [ ] Rigo Valle
- [ ] Stats bar updates: Seated count increases by 3
- [ ] Valle household members show "Table 1" badge in Guest Directory
- [ ] Valle household cards get green background (seated indicator)

### Screenshots:
- [ ] Before drag (unseated guests)
- [ ] During drag (mouse over Table 1)
- [ ] After drop (success toast visible)
- [ ] Table 1 detail showing all 3 members

---

## Test Scenario 2: Duplicate Prevention

**Goal:** Try to assign already-seated household to same table

### Steps:
1. [ ] Valle's household should still be at Table 1 from Scenario 1
2. [ ] Try to drag Valle's household to Table 1 again
3. [ ] Release mouse button

### Expected Results:
- [ ] Error toast appears: "Guest(s) already assigned to this table"
- [ ] Table 1 count remains "3 / 10" (no change)
- [ ] No duplicate entries appear in Table 1
- [ ] Valle household remains in same state (seated at Table 1)

### Screenshots:
- [ ] Error toast message

---

## Test Scenario 3A: Move Confirmation Dialog

**Goal:** Verify confirmation dialog appears when moving to different table

### Steps:
1. [ ] Valle's household should still be at Table 1
2. [ ] Drag Valle's household to Table 2
3. [ ] Release mouse button

### Expected Results:
- [ ] Confirmation dialog appears with:
  - [ ] Title: "Guest Already Assigned"
  - [ ] Message: "Valle's is already assigned to Table 1. Would you like to move them to the new table?"
  - [ ] Two buttons: "Cancel" and "Move to New Table"
- [ ] Dialog overlays the page (modal)
- [ ] Page behind dialog is slightly dimmed

### Screenshots:
- [ ] Confirmation dialog

---

## Test Scenario 3B: Confirm Move

**Goal:** Move household to new table

### Steps:
1. [ ] With dialog open from Scenario 3A
2. [ ] Click "Move to New Table" button

### Expected Results:
- [ ] Dialog closes automatically
- [ ] Success toast appears: "Assigned 3 members of Valle's to Table 2"
- [ ] Table 1 count updates to "0 / 10" (empty)
- [ ] Table 1 shows no badges (empty table)
- [ ] Table 2 count updates to "3 / 10"
- [ ] Table 2 shows 3 badges with names:
  - [ ] Valle
  - [ ] Becky Valle
  - [ ] Rigo Valle
- [ ] Valle household cards in Guest Directory now show "Table 2" badge
- [ ] Stats remain consistent (Seated: still 3)

### Screenshots:
- [ ] After move: Table 1 empty
- [ ] After move: Table 2 with 3 members
- [ ] Success toast

---

## Test Scenario 3C: Cancel Move

**Goal:** Verify cancel button works

### Steps:
1. [ ] Valle's household should be at Table 2 from Scenario 3B
2. [ ] Drag Valle's household to Table 3
3. [ ] In the confirmation dialog, click "Cancel"

### Expected Results:
- [ ] Dialog closes
- [ ] No changes to table assignments
- [ ] Valle household remains at Table 2
- [ ] No toast message appears

### Screenshots:
- [ ] Optional: Dialog with Cancel button highlighted

---

## Test Scenario 4: Insufficient Capacity

**Goal:** Test capacity validation

### Setup Steps:
1. [ ] Find Table 3 (capacity 10)
2. [ ] Drag 8 individual guests (not Valle household) to Table 3
3. [ ] Verify Table 3 shows "8 / 10"

### Test Steps:
4. [ ] Try to drag Valle's household (3 members) to Table 3
5. [ ] Release mouse button

### Expected Results:
- [ ] Error toast appears with capacity message (exact wording may vary):
  - "Insufficient capacity" or
  - "Table 3 has 2 seats available but household requires 3 seats"
- [ ] Valle household remains at previous table (Table 2)
- [ ] Table 3 count remains "8 / 10" (no change)
- [ ] No partial assignment (no members added to Table 3)

### Screenshots:
- [ ] Table 3 at 8/10 capacity before attempt
- [ ] Error toast with capacity message

---

## Additional Checks

### Filtering
- [ ] Click "Unseated" filter → Valle household disappears (if seated)
- [ ] Click "All" filter → Valle household reappears
- [ ] Click "Seated" filter → Valle household appears (if seated)

### Search
- [ ] Type "Valle" in search box → Valle household appears
- [ ] Type "Becky" → Only Becky's card or Valle household appears
- [ ] Clear search → All guests reappear

### Selected Table Detail
- [ ] Click on Table 2 (where Valle household is assigned)
- [ ] Selected Table Detail card appears below floor plan
- [ ] Shows table name, shape, capacity
- [ ] Shows TableVisualizer component with all members
- [ ] Each member has X button to remove from table

### Remove from Table
- [ ] Click X button on one Valle household member in table
- [ ] Verify behavior: Does it remove just that member, or the entire household?
  - Expected: [Depends on implementation - document what happens]

---

## Browser Compatibility (Optional)

Test in multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Accessibility Checks (Optional)

- [ ] Tab navigation works through guest cards
- [ ] Keyboard drag-and-drop works (if implemented)
- [ ] Screen reader announces household groupings
- [ ] Color contrast meets WCAG standards

---

## Performance Checks (Optional)

- [ ] Drag-and-drop is smooth (no lag)
- [ ] Toast messages appear instantly
- [ ] Table updates happen without full page reload
- [ ] Large guest lists (100+) don't cause slowdown

---

## Test Results

**Date:** _______________
**Tester:** _______________
**Browser:** _______________
**Screen Size:** _______________

**Overall Result:** ☐ PASS | ☐ FAIL | ☐ PARTIAL

**Scenarios Passed:** ___ / 4

**Issues Found:**
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Notes:**
_____________________________________________________
_____________________________________________________
_____________________________________________________

---

## Quick Commands

```bash
# Setup Valle's household
npx tsx scripts/setup-valle-household.ts

# Run API tests (after browser login)
npx tsx scripts/test-household-seating-api.ts

# Open database viewer
npx prisma studio

# Start dev server
npm run dev
```
