# Head Table Interior Seats Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 3 seats to the head table interior bottom area, increasing capacity from 28 to 31 seats.

**Architecture:** Update database capacity, modify the table visualizer component to render a new interior bottom row of 3 seats positioned in the U-shape opening facing the bride and groom, and update related scripts.

**Tech Stack:** Next.js, React, Prisma, TypeScript, Tailwind CSS

---

## Task 1: Update Database Capacity Scripts

**Files:**
- Modify: `scripts/fix-head-table-capacity.ts:6`
- Modify: `scripts/update-head-table-capacity.ts:6`
- Modify: `app/(admin)/admin/seating/page.tsx:106`

**Step 1: Update fix-head-table-capacity.ts**

Change the target capacity from 28 to 31:

```typescript
console.log("🔧 Fixing Head Table capacity to 31...")

const result = await prisma.table.updateMany({
  where: {
    name: "Head Table",
  },
  data: {
    capacity: 31,
  },
})

console.log(`✅ Updated ${result.count} Head Table(s) to capacity 31`)
```

**Step 2: Update update-head-table-capacity.ts**

Change the target capacity from 18 to 31:

```typescript
console.log("Updating head table capacity to 31...")

const updated = await prisma.table.updateMany({
  where: {
    name: "Head Table",
  },
  data: {
    capacity: 31,
  },
})

console.log(`✓ Updated ${updated.count} head table(s) to capacity 31`)
```

**Step 3: Update seating page initial capacity**

In `app/(admin)/admin/seating/page.tsx`, update the head table creation:

```typescript
// Create 18 round tables (capacity 10) and 1 head table (capacity 31)
const tablesToCreate = [
  // Head table
  {
    seatingChartId: createdChart.id,
    name: "Head Table",
    capacity: 31,
    shape: "rectangular",
  },
```

**Step 4: Commit capacity updates**

```bash
git add scripts/fix-head-table-capacity.ts scripts/update-head-table-capacity.ts app/(admin)/admin/seating/page.tsx
git commit -m "feat: update head table capacity to 31"
```

---

## Task 2: Run Capacity Update Script

**Files:**
- Execute: `scripts/fix-head-table-capacity.ts`

**Step 1: Run the capacity update script**

Run the script to update the existing head table in the database:

```bash
npx tsx scripts/fix-head-table-capacity.ts
```

Expected output:
```
🔧 Fixing Head Table capacity to 31...
✅ Updated 1 Head Table(s) to capacity 31

📊 Current Head Table status:
  - Head Table: 27/31 seats (rectangular)
```

**Step 2: Verify the update**

The output should show the head table now has capacity 31 with the current number of assigned seats.

---

## Task 3: Update Table Visualizer Component - Add Bottom Interior Row

**Files:**
- Modify: `components/admin/seating/table-visualizer.tsx:350-364`
- Modify: `components/admin/seating/table-visualizer.tsx:374`

**Step 1: Update capacity constants and seat slicing**

Replace lines 350-363 with:

```typescript
  // Rectangular head table with seats on BOTH sides of left/right arms
  // Top: 8 seats (3 + groom + bride + 3)
  // Left side: 5 seats on outside AND 5 seats on inside = 10 seats
  // Right side: 5 seats on outside AND 5 seats on inside = 10 seats
  // Interior bottom: 3 seats (facing bride/groom from inside the U)
  // Total: 8 + 10 + 10 + 3 = 31 seats
  const topCount = 8
  const leftOuterCount = 5  // Seats on outside of left arm
  const rightOuterCount = 5 // Seats on outside of right arm
  const bottomInteriorCount = 3 // Seats in interior bottom row

  const topSeats = expandedSeats.slice(0, Math.min(topCount, expandedSeats.length))
  const leftOuterSeats = expandedSeats.slice(topCount, topCount + leftOuterCount)
  const rightOuterSeats = expandedSeats.slice(topCount + leftOuterCount, topCount + leftOuterCount + rightOuterCount)
  const leftInnerSeats = expandedSeats.slice(topCount + leftOuterCount + rightOuterCount, topCount + leftOuterCount + rightOuterCount + leftOuterCount)
  const rightInnerSeats = expandedSeats.slice(topCount + leftOuterCount + rightOuterCount + leftOuterCount, topCount + leftOuterCount + rightOuterCount + leftOuterCount + rightOuterCount)
  const bottomInteriorSeats = expandedSeats.slice(topCount + leftOuterCount + rightOuterCount + leftOuterCount + rightOuterCount, topCount + leftOuterCount + rightOuterCount + leftOuterCount + rightOuterCount + bottomInteriorCount)
```

**Step 2: Update position type**

Update the `position` parameter type in the `renderSeat` function signature (line 374):

```typescript
    position: 'top' | 'left-outer' | 'right-outer' | 'left-inner' | 'right-inner' | 'bottom-interior',
```

**Step 3: Commit visualizer logic updates**

```bash
git add components/admin/seating/table-visualizer.tsx
git commit -m "feat: add bottom interior seats logic to visualizer"
```

---

## Task 4: Update Table Visualizer Component - Render Bottom Interior Row

**Files:**
- Modify: `components/admin/seating/table-visualizer.tsx:487-564`

**Step 1: Add bottom interior row rendering**

After the center space div (around line 527), before the closing of the middle section, add the bottom interior row rendering. Insert this code after the center space closing div `</div>` and before the closing of the flex container (line 549):

```typescript
          {/* Center space (open area) */}
          <div className="flex items-center justify-center px-2" style={{ minWidth: '120px', maxWidth: '140px' }}>
            <div className="text-center">
              <div className="flex gap-2 justify-center mb-1">
                <p className="text-[10px] font-serif tracking-wider text-primary/60">GROOM</p>
                <p className="text-[10px] font-serif tracking-wider text-primary/60">BRIDE</p>
              </div>
              <h3 className="text-sm font-serif font-bold mb-0.5 text-primary">{table.name}</h3>
              <p className="text-[7px] text-muted-foreground uppercase tracking-wider">
                Main Table
              </p>
              <p className="text-[7px] text-muted-foreground mt-0.5">
                {table._count.seats} / {capacity} seated
              </p>
            </div>
          </div>
```

After this div, add:

```typescript
          {/* Interior bottom row - 3 seats facing bride/groom */}
          {bottomInteriorCount > 0 && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-2">
              <div className="flex justify-center items-start gap-1">
                {Array.from({ length: bottomInteriorCount }, (_, i) => {
                  const expandedSeat = bottomInteriorSeats[i]
                  const seatIndex = topCount + leftOuterCount + rightOuterCount + leftOuterCount + rightOuterCount + i
                  return renderSeat(expandedSeat, seatIndex, 'bottom-interior', i)
                })}
              </div>
            </div>
          )}
```

**Step 2: Update parent container positioning**

Find the middle section container (line 490) and add `relative` positioning:

```typescript
          {/* Middle section with left arm, center space, and right arm - render first to get width */}
          <div className="relative flex items-stretch justify-center" style={{ marginBottom: '-2px' }}>
```

**Step 3: Test the rendering**

Start the development server and navigate to the seating chart:

```bash
npm run dev
```

Navigate to `/admin/seating` and verify:
- The head table shows 31 capacity
- 3 seats appear in the interior bottom area
- The layout is centered and visually balanced

**Step 4: Commit rendering updates**

```bash
git add components/admin/seating/table-visualizer.tsx
git commit -m "feat: render bottom interior seats in visualizer"
```

---

## Task 5: Update Documentation

**Files:**
- Modify: `docs/SEATING_CHART_FEATURE.md`

**Step 1: Update seating chart documentation**

Find the head table description (around line 12) and update:

```markdown
- 1 U-shaped rectangular head table (capacity: 31 guests)
  - 8 seats across the top
  - 10 seats on left arm (5 outer + 5 inner)
  - 10 seats on right arm (5 outer + 5 inner)
  - 3 seats in interior bottom area (facing bride/groom)
```

**Step 2: Commit documentation**

```bash
git add docs/SEATING_CHART_FEATURE.md
git commit -m "docs: update head table capacity documentation"
```

---

## Task 6: Verification and Testing

**Files:**
- Test: Admin seating chart interface
- Test: Seat assignment functionality

**Step 1: Verify capacity update**

Check the database to ensure capacity is 31:

```bash
npx tsx scripts/fix-head-table-capacity.ts
```

Expected: Shows "27/31 seats" or similar.

**Step 2: Test seat assignment**

1. Navigate to `/admin/seating`
2. Verify head table displays with 31 seat positions
3. Try assigning a guest to one of the 3 new interior bottom seats
4. Verify the assignment works and displays correctly
5. Verify drag-and-drop works for the new seats

**Step 3: Visual verification**

Verify the visual layout:
- Interior bottom seats are centered
- Proper spacing from surrounding elements
- Seats are clickable/draggable
- Empty seat indicators work correctly

**Step 4: Final commit if any fixes needed**

If any adjustments were made during testing:

```bash
git add .
git commit -m "fix: adjust interior bottom seat positioning"
```

---

## Completion Checklist

- [ ] Capacity scripts updated to 31
- [ ] Database capacity updated to 31
- [ ] Visualizer constants and slicing updated
- [ ] Position type updated to include 'bottom-interior'
- [ ] Interior bottom row rendering added
- [ ] Documentation updated
- [ ] Visual layout verified
- [ ] Seat assignment tested
- [ ] All changes committed

## Notes

- The interior bottom seats are positioned using absolute positioning within a relative container
- Seat numbers 29-31 correspond to the interior bottom row
- The visualizer will display empty seat indicators for unassigned interior seats
- All existing seat assignment functionality works with the new seats
