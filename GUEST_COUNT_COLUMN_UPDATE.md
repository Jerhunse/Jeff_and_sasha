# Guest List Household Column Update

## Summary
Updated the "Household" column in the guest list table to display the total guest count for each household, making it easier to see at a glance how many people are in each group.

## Changes Made

### 1. Updated Data Query (`app/(admin)/admin/guests/page.tsx`)
Modified the Prisma query to include the guest count for each household:

```typescript
household: {
  include: {
    _count: {
      select: {
        guests: true,
      },
    },
  },
},
```

This fetches the total number of guests in each household along with the household information.

### 2. Updated Type Definition (`components/admin/guest-list-table.tsx`)
Updated the `GuestWithRelations` type to include the count:

```typescript
household: (Household & {
  _count: {
    guests: number
  }
}) | null
```

### 3. Updated Column Header
Changed the table header from "Household" to "Guests" to better reflect the displayed information.

### 4. Updated Display Logic
Modified the household column to show:
- **With Household**: Guest count (bold) + household name in parentheses
  - Example: `👥 2 (Valle's)`
- **Without Household**: Guest count of 1
  - Example: `👥 1`

## Visual Changes

### Before
```
Household
---------
Valle's
Adrian
-
Erhunse Family
```

### After
```
Guests
------
👥 2 (Valle's)
👥 1 (Adrian)
👥 1
👥 3 (Erhunse Family)
```

## Benefits
1. **Quick Overview**: Easily see how many guests are in each party without counting
2. **Better Planning**: Helps with seating arrangements and total guest counts
3. **Clear Context**: Household name is still visible for reference
4. **Consistent Display**: Even single guests show a count of 1

## Testing
To verify the changes:
1. Navigate to `/admin/guests`
2. The "Guests" column should show:
   - A user icon
   - A bold number (total guests in household or 1 for individuals)
   - The household name in parentheses (if applicable)

## Example Data
Based on your guest list:
- Walter → Shows "1"
- Valle's → Shows "2 (Valle's)"
- Erhunse Family → Shows "3 (Erhunse Family)"
- Karla Rosada → Shows "5 (Karla Rosada)"
