# Household Seating - Visual UI Reference

This document shows ASCII representations of what the UI should look like at each test stage.

## Initial State (Before Any Assignment)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ SEATING CHART                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Stats Bar:                                                              │
│ ┌──────────┬──────────┬──────────┬──────────┬──────────┐              │
│ │ Capacity │  Total   │  Seated  │ Unseated │Attending │              │
│ │   200    │    85    │    0     │    85    │    72    │              │
│ └──────────┴──────────┴──────────┴──────────┴──────────┘              │
│                                                                         │
├─────────────────────────────────────┬───────────────────────────────────┤
│ FLOOR PLAN (Left 60%)               │ GUEST DIRECTORY (Right 40%)       │
├─────────────────────────────────────┼───────────────────────────────────┤
│                                     │ 🔍 Search guests...               │
│ HEAD TABLE                          │                                   │
│ ┌─────────────────────────────────┐ │ [All] [Unseated] [Seated]        │
│ │ Head Table                      │ │                                   │
│ │ U-Shaped • Capacity: 18         │ │ ┌───────────────────────────────┐ │
│ │ Badge: 0 / 18                   │ │ │ 👥 Valle's            [3]     │ │
│ └─────────────────────────────────┘ │ ├───────────────────────────────┤ │
│                                     │ │ ┌──────────────────────────┐  │ │
│ ROUND TABLES                        │ │ │ 👤 Valle                │  │ │
│ ┌─────┐ ┌─────┐ ┌─────┐            │ │ │                          │  │ │
│ │  1  │ │  2  │ │  3  │            │ │ └──────────────────────────┘  │ │
│ │     │ │     │ │     │            │ │ ┌──────────────────────────┐  │ │
│ │ 0/10│ │ 0/10│ │ 0/10│            │ │ │ 👤 Becky Valle          │  │ │
│ └─────┘ └─────┘ └─────┘            │ │ │                          │  │ │
│                                     │ │ └──────────────────────────┘  │ │
│ ┌─────┐ ┌─────┐ ┌─────┐            │ │ ┌──────────────────────────┐  │ │
│ │  4  │ │  5  │ │  6  │            │ │ │ 👤 Rigo Valle           │  │ │
│ │     │ │     │ │     │            │ │ │                          │  │ │
│ │ 0/10│ │ 0/10│ │ 0/10│            │ │ └──────────────────────────┘  │ │
│ └─────┘ └─────┘ └─────┘            │ └───────────────────────────────┘ │
│                                     │                                   │
│ ... more tables ...                 │ ... more households ...           │
└─────────────────────────────────────┴───────────────────────────────────┘
```

---

## Scenario 1: After Dragging Valle to Table 1

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ✅ Assigned 3 members of Valle's to Table 1              [Toast]        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ Stats Bar:                                                              │
│ ┌──────────┬──────────┬──────────┬──────────┬──────────┐              │
│ │ Capacity │  Total   │  Seated  │ Unseated │Attending │              │
│ │   200    │    85    │    3     │    82    │    72    │  ← Changed   │
│ └──────────┴──────────┴──────────┴──────────┴──────────┘              │
│                                                                         │
├─────────────────────────────────────┬───────────────────────────────────┤
│ FLOOR PLAN                          │ GUEST DIRECTORY                   │
├─────────────────────────────────────┼───────────────────────────────────┤
│                                     │ ┌───────────────────────────────┐ │
│ ROUND TABLES                        │ │ 👥 Valle's            [3]     │ │
│ ┌─────┐ ┌─────┐ ┌─────┐            │ ├───────────────────────────────┤ │
│ │  1  │ │  2  │ │  3  │            │ │ ┌──────────────────────────┐  │ │
│ │     │ │     │ │     │            │ │ │ 👤 Valle                │  │ │
│ │ 3/10│ │ 0/10│ │ 0/10│ ← Changed  │ │ │ [Table 1]  ← Badge      │  │ │
│ └─────┘ └─────┘ └─────┘            │ │ └──────────────────────────┘  │ │
│   ↓                                 │ │ ┌──────────────────────────┐  │ │
│ Click to expand:                    │ │ │ 👤 Becky Valle          │  │ │
│ ┌─────────────────────────────────┐ │ │ │ [Table 1]  ← Badge      │  │ │
│ │ Table 1                         │ │ │ └──────────────────────────┘  │ │
│ │ Round • Capacity: 10            │ │ │ ┌──────────────────────────┐  │ │
│ │ Badge: 3 / 10                   │ │ │ │ 👤 Rigo Valle           │  │ │
│ │                                 │ │ │ │ [Table 1]  ← Badge      │  │ │
│ │ Members:                        │ │ │ └──────────────────────────┘  │ │
│ │ [Valle ✗] [Becky Valle ✗]      │ │ └───────────────────────────────┘ │
│ │ [Rigo Valle ✗]                  │ │                                   │
│ └─────────────────────────────────┘ │ All cards have green background  │
│                                     │ indicating "seated"               │
└─────────────────────────────────────┴───────────────────────────────────┘
```

---

## Scenario 2: Attempting Duplicate Assignment

```
Action: User drags Valle to Table 1 again (while already there)

┌─────────────────────────────────────────────────────────────────────────┐
│ ❌ Guest(s) already assigned to this table              [Error Toast]   │
└─────────────────────────────────────────────────────────────────────────┘

Result: No changes to UI, error message only
Table 1 remains at 3/10 with same members
```

---

## Scenario 3A: Move Confirmation Dialog

```
Action: User drags Valle to Table 2

┌─────────────────────────────────────────────────────────────────────────┐
│                          [Modal Overlay - Dimmed Background]            │
│                                                                         │
│                    ┌───────────────────────────────────┐                │
│                    │ Guest Already Assigned            │                │
│                    ├───────────────────────────────────┤                │
│                    │                                   │                │
│                    │ Valle's is already assigned to    │                │
│                    │ Table 1. Would you like to move   │                │
│                    │ them to the new table?            │                │
│                    │                                   │                │
│                    ├───────────────────────────────────┤                │
│                    │                                   │                │
│                    │  [Cancel]  [Move to New Table]    │                │
│                    │                                   │                │
│                    └───────────────────────────────────┘                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

Note: Behind the dialog, the floor plan and guest directory remain visible
but are slightly faded/dimmed
```

---

## Scenario 3B: After Confirming Move

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ✅ Assigned 3 members of Valle's to Table 2              [Toast]        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ Stats: (Seated still 3, just moved between tables)                     │
│                                                                         │
├─────────────────────────────────────┬───────────────────────────────────┤
│ FLOOR PLAN                          │ GUEST DIRECTORY                   │
├─────────────────────────────────────┼───────────────────────────────────┤
│                                     │ ┌───────────────────────────────┐ │
│ ROUND TABLES                        │ │ 👥 Valle's            [3]     │ │
│ ┌─────┐ ┌─────┐ ┌─────┐            │ ├───────────────────────────────┤ │
│ │  1  │ │  2  │ │  3  │            │ │ ┌──────────────────────────┐  │ │
│ │     │ │     │ │     │            │ │ │ 👤 Valle                │  │ │
│ │ 0/10│ │ 3/10│ │ 0/10│            │ │ │ [Table 2]  ← Changed    │  │ │
│ └─────┘ └─────┘ └─────┘            │ │ └──────────────────────────┘  │ │
│    ↑       ↑                        │ │ ┌──────────────────────────┐  │ │
│  Empty   Now has                    │ │ │ 👤 Becky Valle          │  │ │
│         3 members                   │ │ │ [Table 2]  ← Changed    │  │ │
│                                     │ │ └──────────────────────────┘  │ │
│ Table 1 expanded view:              │ │ ┌──────────────────────────┐  │ │
│ ┌─────────────────────────────────┐ │ │ │ 👤 Rigo Valle           │  │ │
│ │ Table 1                         │ │ │ │ [Table 2]  ← Changed    │  │ │
│ │ Round • Capacity: 10            │ │ │ └──────────────────────────┘  │ │
│ │ Badge: 0 / 10                   │ │ └───────────────────────────────┘ │
│ │                                 │ │                                   │
│ │ (No members)                    │ │                                   │
│ └─────────────────────────────────┘ │                                   │
│                                     │                                   │
│ Table 2 expanded view:              │                                   │
│ ┌─────────────────────────────────┐ │                                   │
│ │ Table 2                         │ │                                   │
│ │ Round • Capacity: 10            │ │                                   │
│ │ Badge: 3 / 10                   │ │                                   │
│ │                                 │ │                                   │
│ │ Members:                        │ │                                   │
│ │ [Valle ✗] [Becky Valle ✗]      │ │                                   │
│ │ [Rigo Valle ✗]                  │ │                                   │
│ └─────────────────────────────────┘ │                                   │
└─────────────────────────────────────┴───────────────────────────────────┘
```

---

## Scenario 4: Insufficient Capacity Error

```
Setup: Table 3 has 8 guests (8/10), only 2 seats available
Action: User drags Valle's household (3 people) to Table 3

┌─────────────────────────────────────────────────────────────────────────┐
│ ❌ Insufficient capacity. Table 3 has 2 seats available but household   │
│    requires 3 seats                                   [Error Toast]     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ FLOOR PLAN                          │ GUEST DIRECTORY                   │
├─────────────────────────────────────┼───────────────────────────────────┤
│                                     │ ┌───────────────────────────────┐ │
│ ┌─────┐ ┌─────┐ ┌─────┐            │ │ 👥 Valle's            [3]     │ │
│ │  1  │ │  2  │ │  3  │            │ ├───────────────────────────────┤ │
│ │     │ │     │ │█████│            │ │ ┌──────────────────────────┐  │ │
│ │ 0/10│ │ 3/10│ │ 8/10│            │ │ │ 👤 Valle                │  │ │
│ └─────┘ └─────┘ └─────┘            │ │ │ [Table 2]  ← No change  │  │ │
│            ↑       ↑                │ │ └──────────────────────────┘  │ │
│       Valle's   Table 3             │ │ (... other members ...)      │ │
│       still     nearly full,        │ └───────────────────────────────┘ │
│       here      unchanged           │                                   │
│                                     │ Valle household remains at        │
│                                     │ Table 2 (no change)               │
└─────────────────────────────────────┴───────────────────────────────────┘

Result: No assignment happens, Valle household stays at Table 2
```

---

## Drag-and-Drop Visual States

### During Drag

```
┌───────────────────────────────────┐
│ Guest Directory                   │
├───────────────────────────────────┤
│ ┌───────────────────────────────┐ │
│ │ 👥 Valle's            [3]     │ │
│ ├───────────────────────────────┤ │
│ │ ┌──────────────────────────┐  │ │
│ │ │ 👤 Valle                │  │ │ ← User clicks here
│ │ │ cursor: grabbing        │  │ │    and drags
│ │ └──────────────────────────┘  │ │
│ │                               │ │
│ │  [Dragging indicator]         │ │ ← Semi-transparent
│ │   👤 Valle + 2 more           │ │    ghost image follows
│ │                               │ │    mouse cursor
└─┴───────────────────────────────┴─┘

Floor Plan:
┌─────┐ ┌─────┐ ┌─────┐
│  1  │ │  2  │ │  3  │
│     │ │     │ │     │
│ 3/10│ │ 0/10│ │ 8/10│
└─────┘ └─────┘ └─────┘
          ↑
     Hover highlight
  (when mouse over table)
```

### Drop Target Indication

```
Table with hover state when dragging over it:

Normal table:
┌─────────────────┐
│  Table 2        │
│                 │
│     0/10        │
└─────────────────┘

Table during drag-over:
┌─────────────────┐
│  Table 2        │  ← Border changes to
│                 │    primary color
│     0/10        │  ← Slight background
└─────────────────┘    color change
```

---

## Color Coding Reference

```
Guest Card States:

Unseated Guest:
┌──────────────────────────┐
│ 👤 John Smith           │  ← White/light background
│                          │    Gray border
└──────────────────────────┘

Seated Guest:
┌──────────────────────────┐
│ 👤 Valle                │  ← Green tinted background
│ [Table 2]                │    Green border (subtle)
└──────────────────────────┘

Plus One:
┌──────────────────────────┐
│ 👥 +Guest Name           │  ← Blue tinted background
│ Plus one of Valle        │    Blue border
└──────────────────────────┘

RSVP Status Badges:
[Attending]    ← Green background
[Declined]     ← Red background  
[Maybe]        ← Yellow background

Table Capacity Badges:
[3 / 10]       ← Gray (normal)
[10 / 10]      ← Red (full)
[9 / 10]       ← Yellow (nearly full)
```

---

## Responsive Layout

### Desktop (> 1024px)

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────┬─────────────────────┐                  │
│ │ Floor Plan (60%)    │ Guest Directory(40%)│                  │
│ │                     │                     │                  │
│ │ Tables grid         │ Searchable list     │                  │
│ └─────────────────────┴─────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

### Tablet/Mobile (< 1024px)

```
┌─────────────────────┐
│ Floor Plan (100%)   │
│                     │
│ Tables grid         │
│                     │
├─────────────────────┤
│ Guest Directory     │
│ (100%, below)       │
│                     │
│ Searchable list     │
└─────────────────────┘
```

---

## Animation Notes

**Successful Assignment:**
- Toast slides in from top-right corner
- Fades in over 200ms
- Auto-dismisses after 3 seconds
- Fades out over 200ms

**Table Update:**
- Badge count animates (number changes)
- New member badges fade in
- Smooth transition (300ms)

**Dialog:**
- Fades in with backdrop (200ms)
- Scales up slightly (scale 0.95 → 1.0)
- Exits with fade out (150ms)

**Drag Visual:**
- Cursor changes to `grabbing` while dragging
- Semi-transparent ghost image follows cursor
- Drop targets highlight on hover

---

## Keyboard Shortcuts (if implemented)

- `Tab` - Navigate between guest cards
- `Enter/Space` - Select guest (when focused)
- `Escape` - Cancel drag / Close dialog
- `Ctrl+F` - Focus search box

---

This visual reference shows the expected UI states for each test scenario.
Use this as a guide when performing manual testing to verify the UI behaves correctly.
