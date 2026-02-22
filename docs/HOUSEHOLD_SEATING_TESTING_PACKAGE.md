# Household Seating Testing - Complete Package

## Summary

I've prepared a comprehensive testing package for the household seating functionality. While I was unable to perform browser testing due to technical limitations with the browser automation tools, I've created everything you need to test the functionality thoroughly.

## What Was Accomplished ✅

### 1. Test Data Setup
- **Created Valle's household** with 3 members (Valle, Becky Valle, Rigo Valle)
- Household ID: `cmlvh3vcu0001y4jnjmixe2rn`
- All members properly linked to the household
- Data ready for testing in your database

### 2. Test Documentation Created

Four comprehensive test documents:

#### `HOUSEHOLD_SEATING_TEST_SUMMARY.md`
- Complete overview of the testing setup
- Code review and analysis
- Component interaction flow diagram
- Success criteria checklist
- Quick reference for all test files

#### `HOUSEHOLD_SEATING_TEST_PLAN.md`
- Detailed test scenarios with step-by-step instructions
- Expected results for each scenario
- Screenshot checklists
- API endpoint testing examples
- Test results template
- Troubleshooting guide

#### `HOUSEHOLD_SEATING_QUICK_CHECKLIST.md`
- Quick visual checklist format
- Easy to follow during testing
- Checkbox format for each test item
- Pre-test setup verification
- Browser compatibility checks

#### `HOUSEHOLD_SEATING_UI_REFERENCE.md`
- ASCII art representations of UI states
- Visual reference for each test scenario
- Color coding guide
- Animation notes
- Responsive layout reference

### 3. Test Scripts Created

#### `scripts/setup-valle-household.ts`
- Creates Valle's household with 3 members
- Idempotent (safe to run multiple times)
- Checks for existing data and updates if needed
- Provides detailed output and next steps

#### `scripts/test-household-seating-api.ts`
- Automated API endpoint testing
- Tests all 5 scenarios programmatically
- Verifies database state after operations
- Provides detailed test results summary
- Note: Requires browser authentication

## Test Scenarios Defined

### ✅ Scenario 1: Initial Assignment
Drag Valle's household to Table 1 → All 3 members assigned

### ✅ Scenario 2: Duplicate Prevention
Try to drag to same table → Error message, no action

### ✅ Scenario 3: Move with Confirmation
Drag to different table → Confirmation dialog → Move all 3 members

### ✅ Scenario 4: Insufficient Capacity
Try to assign to table with only 2 seats → Error message

## Code Verification ✅

I reviewed the implementation and confirmed:

### GuestListDirectory Component
- ✅ Properly groups guests by household
- ✅ Displays household name and member count
- ✅ Makes individual guest cards draggable
- ✅ Shows visual indicators for seated status

### SeatingChartManager Component
- ✅ Extracts householdId from guest data
- ✅ Sends householdId to API
- ✅ Handles conflict scenarios (already seated)
- ✅ Shows confirmation dialog for moves
- ✅ Updates state for all household members
- ✅ Displays appropriate toast messages

### Expected API Behavior
- ✅ Should accept householdId in request body
- ✅ Should fetch all household members
- ✅ Should validate capacity for entire household
- ✅ Should prevent duplicate assignments
- ✅ Should require force flag for moves
- ✅ Should create/update seats atomically

## How to Test

### Option 1: Manual Browser Testing (Recommended)

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Navigate to seating page:**
   ```
   http://localhost:3002/admin/seating
   ```

3. **Follow the checklist:**
   Open `docs/HOUSEHOLD_SEATING_QUICK_CHECKLIST.md` and check off each item

4. **Use UI reference:**
   Refer to `docs/HOUSEHOLD_SEATING_UI_REFERENCE.md` to verify expected UI states

### Option 2: Automated API Testing

1. **Log in via browser:**
   ```
   http://localhost:3002/auth/signin
   ```

2. **Run the test script:**
   ```bash
   npx tsx scripts/test-household-seating-api.ts
   ```

3. **Review results:**
   The script will output pass/fail for each scenario

### Option 3: Database Verification

```bash
npx prisma studio
```

Check:
- Household table → Valle's household
- Guest table → 3 members with householdId
- Seat table → Seat assignments for household members

## Files Reference

```
docs/
├── HOUSEHOLD_SEATING_TEST_SUMMARY.md      ← Start here for overview
├── HOUSEHOLD_SEATING_TEST_PLAN.md         ← Detailed test procedures
├── HOUSEHOLD_SEATING_QUICK_CHECKLIST.md   ← Quick testing checklist
└── HOUSEHOLD_SEATING_UI_REFERENCE.md      ← Visual UI reference

scripts/
├── setup-valle-household.ts               ← Create test data
└── test-household-seating-api.ts          ← Automated API tests

components/admin/seating/
├── guest-list-directory.tsx               ← Guest list with households
└── seating-chart-manager.tsx              ← Main seating logic

app/api/admin/seating/[id]/tables/[tableId]/seats/
└── route.ts                                ← API endpoint
```

## Quick Start Commands

```bash
# 1. Setup Valle's household (already done, but can re-run)
npx tsx scripts/setup-valle-household.ts

# 2. Start the development server
npm run dev

# 3. Open browser and test manually
# URL: http://localhost:3002/admin/seating

# 4. (Optional) Run automated API tests after logging in
npx tsx scripts/test-household-seating-api.ts

# 5. (Optional) View database
npx prisma studio
```

## What I Could Not Complete

❌ **Browser Automation Testing:**
- Encountered technical issues with the browser MCP integration
- Could not navigate to the page programmatically
- Could not capture screenshots
- Could not interact with drag-and-drop elements

This means you'll need to perform manual browser testing using the provided checklists and documentation.

## Expected Test Results

Based on the code review, here's what should happen:

| Scenario | Action | Expected Result | Status |
|----------|--------|----------------|---------|
| 1 | Drag Valle to Table 1 | All 3 members assigned, count 3/10 | ✅ Should work |
| 2 | Drag Valle to Table 1 again | Error toast, no change | ✅ Should work |
| 3 | Drag Valle to Table 2 | Confirmation dialog appears | ✅ Should work |
| 3b | Click "Move to New Table" | All 3 moved to Table 2 | ✅ Should work |
| 4 | Drag Valle to nearly-full table | Capacity error toast | ✅ Should work |

## Next Steps

1. ✅ **Test Data Created** - Valle's household is ready
2. ✅ **Documentation Complete** - All test plans written
3. ✅ **Scripts Ready** - Setup and test scripts available
4. ⏳ **Manual Testing Needed** - Follow the quick checklist
5. ⏳ **Document Results** - Fill in test results template
6. ⏳ **Report Issues** - Note any bugs or unexpected behavior

## Questions or Issues?

If you encounter problems:

1. **Valle's household not appearing?**
   - Run: `npx tsx scripts/setup-valle-household.ts`
   - Check database: `npx prisma studio`

2. **Server not running?**
   - Check port 3002: `lsof -i :3002`
   - Start server: `npm run dev`

3. **Authentication issues?**
   - Sign in at: `http://localhost:3002/auth/signin`
   - Use admin credentials

4. **Drag-and-drop not working?**
   - Check browser console for errors
   - Verify guest cards have cursor:move on hover
   - Try a different browser

## Success Metrics

The household seating functionality is working correctly if:

- ✅ Valle's household appears grouped in Guest Directory
- ✅ Dragging one member assigns all 3 to the table
- ✅ Duplicate assignments are prevented
- ✅ Moving requires confirmation
- ✅ Capacity validation works for entire household
- ✅ Stats update correctly (Seated count +3)
- ✅ All members show correct table badges

---

**Testing Package Created:** February 20, 2026  
**Test Data Status:** Ready (Valle's household with 3 members)  
**Documentation Status:** Complete (4 documents, 2 scripts)  
**Browser Testing Status:** Manual testing required  
**Next Action:** Open http://localhost:3002/admin/seating and follow quick checklist

Good luck with the testing! 🚀
