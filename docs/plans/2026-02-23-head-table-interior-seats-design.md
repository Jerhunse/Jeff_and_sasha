# Head Table Interior Seats Addition

**Date**: 2026-02-23  
**Status**: Approved  
**Type**: Feature Enhancement

## Overview

Add 3 additional seats to the head table, positioned in the interior bottom area of the U-shaped layout. These seats will face the bride and groom from inside the U, creating an intimate seating arrangement for honored guests.

## Current State

The head table currently has 28 seats arranged in a U-shape:
- **Top section**: 8 seats distributed around the top of the U
- **Left arm**: 10 seats (5 outer + 5 inner facing each other)
- **Right arm**: 10 seats (5 outer + 5 inner facing each other)
- **Total capacity**: 28 seats

The bride sits at position 4 and groom at position 3 in the top section (per `assign-bride-groom-seats.ts`).

## Design Decision

### Chosen Approach: Interior Bottom Row

Add 3 seats in a horizontal row positioned in the open center area of the U-shape, facing toward the bride and groom. This creates an intimate setting for special guests who can have direct sightlines to the couple.

**New layout (31 seats)**:
- Top section: 8 seats (unchanged)
- Left arm: 10 seats (unchanged)
- Right arm: 10 seats (unchanged)
- **Interior bottom row**: 3 new seats (positions 29-31)
- **Total capacity**: 31 seats

### Visual Layout

```
┌─────────────────────────────────────┐
│  [LEFT ARM - 10]  [TOP - 8]  [RIGHT ARM - 10]  │
│                                     │
│         [Interior Bottom - 3 NEW]   │
│              ○  ○  ○               │
│              ↓  ↓  ↓               │
│          [GROOM] [BRIDE]           │
│     [WEDDING PARTY BOTTOM ROW]      │
└─────────────────────────────────────┘
```

### Seat Numbering

Current seat numbering will be adjusted:
- Seats 1-8: Top section (unchanged)
- Seats 9-18: Left arm outer/inner (unchanged)
- Seats 19-28: Right arm outer/inner (unchanged)
- **Seats 29-31: Interior bottom row (NEW)**

## Implementation Details

### Components to Update

1. **`components/admin/seating/table-visualizer.tsx`**
   - Add `bottomInteriorCount = 3` constant
   - Create `bottomInteriorSeats` array by slicing seats 29-31
   - Add rendering section for the interior bottom row
   - Position the row in the center space between the table label and bottom edge
   - Update the `position` type to include `'bottom-interior'`

2. **Database Scripts**
   - `scripts/fix-head-table-capacity.ts`: Update target capacity from 28 to 31
   - `scripts/update-head-table-capacity.ts`: Update target capacity to 31
   - `app/(admin)/admin/seating/page.tsx`: Update initial head table capacity to 31

### CSS/Layout Considerations

The new interior row will be:
- Centered horizontally in the U-shape opening
- Positioned between the "Head Table" label area and the bottom edge
- Rendered with adequate spacing from surrounding elements
- Use the same seat rendering function with position type `'bottom-interior'`

### Data Flow

1. The table capacity is set to 31 in the database
2. Seats 1-31 can be assigned to guests via the seating manager
3. The visualizer component displays all 31 seats in their proper positions
4. Interior bottom seats (29-31) are treated like any other seats for assignment purposes

## Alternative Approaches Considered

### Option 2: Dynamic Capacity-Based Layout
Calculate bottom seats dynamically based on remaining capacity. Rejected because it's less explicit and harder to maintain.

### Option 3: Extend One Arm
Add 3 seats to one arm (making it 13 seats vs 10 on the other). Rejected because it creates asymmetry and doesn't achieve the "facing bride and groom" positioning.

## Testing Considerations

1. Verify capacity updates correctly in database
2. Ensure all 31 seats can be assigned to guests
3. Confirm visual layout displays correctly with various seat occupancy levels
4. Test drag-and-drop functionality for the new seats
5. Verify seat numbering is consistent and sequential

## Success Criteria

- Head table capacity increases from 28 to 31 seats
- 3 new seats appear in the interior bottom area of the U-shaped visualizer
- Seats can be assigned to guests through the admin interface
- Visual layout is clear, centered, and aesthetically balanced
- No regressions in existing seating functionality
