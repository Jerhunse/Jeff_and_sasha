# Seating Chart Feature

## Overview

A comprehensive wedding seating chart management system that allows administrators to visually organize guests across tables with drag-and-drop functionality.

## Features

### 1. **Visual Floor Plan**
- Display of all tables with current occupancy
- 18 round tables (capacity: 10 guests each)
- 1 U-shaped rectangular head table (capacity: 31 guests)
  - 8 seats across the top
  - 10 seats on left arm (5 outer + 5 inner)
  - 10 seats on right arm (5 outer + 5 inner)
  - 3 seats in interior bottom area (facing bride/groom)
- Color-coded capacity indicators (full vs available)
- Click to select and view table details

### 2. **Interactive Table Visualization**
- **Round Tables**: Radial layout showing guest positions around the table
- **Rectangular Head Table**: U-shaped layout with left, right, and bottom seating
- Real-time visual representation of seated guests
- Remove guests with hover actions
- Empty seat indicators

### 3. **Guest List Directory**
- Organized by household
- Search functionality
- Filter by seating status (All, Seated, Unseated)
- Displays:
  - Guest name and email
  - RSVP status (Attending, Declined, Maybe)
  - Plus one information
  - Current table assignment
- Drag-and-drop guests to tables

### 4. **Statistics Dashboard**
- Total capacity across all tables
- Total number of guests
- Seated vs unseated count
- Number of attending guests (based on RSVP)

### 5. **Drag and Drop Functionality**
- Drag guests from the directory
- Drop onto tables to assign seating
- Automatic table capacity validation
- Real-time updates
- Move guests between tables

## File Structure

```
app/(admin)/admin/seating/
└── page.tsx                          # Main seating page (Server Component)

components/admin/
├── seating-chart-manager.tsx        # Main client component orchestrator
└── seating/
    ├── table-visualizer.tsx         # Visual table layout component
    └── guest-list-directory.tsx     # Guest list with drag functionality

components/ui/
└── scroll-area.tsx                  # Radix UI scroll area component

API Routes (Already Existed):
app/api/admin/seating/
├── route.ts                         # GET seating charts, POST create chart
├── [id]/tables/route.ts            # POST create table
└── [id]/tables/[tableId]/seats/
    └── route.ts                     # POST assign guest, DELETE remove guest
```

## Database Schema

The feature uses existing Prisma models:

- **SeatingChart**: Container for a seating arrangement
- **Table**: Individual tables with capacity and shape
- **Seat**: Assignment of a guest to a specific table
- **Guest**: Wedding guests with RSVP and household info

## Usage

### For Administrators

1. **Navigate to Seating Chart**
   - Click "Seating Chart" in the admin sidebar

2. **Assign Guests to Tables**
   - Method 1: Drag a guest from the directory and drop onto a table card
   - Method 2: Click a table to view details, then drag guests to the visualization

3. **View Table Details**
   - Click any table card to see the detailed radial/rectangular layout
   - See exactly where each guest will sit
   - Remove guests with the X button on hover

4. **Filter and Search**
   - Use the search box to find specific guests
   - Filter by "All", "Unseated", or "Seated" status
   - View guests organized by household

5. **Export**
   - Click "Export PDF" to download the seating chart (future enhancement)

## Technical Details

### State Management
- Client-side state synchronized with server
- Optimistic updates for better UX
- Toast notifications for success/error feedback

### API Integration
- POST `/api/admin/seating/{chartId}/tables/{tableId}/seats` - Assign guest
- DELETE `/api/admin/seating/{chartId}/tables/{tableId}/seats?seatId={id}` - Remove guest

### Features to Note
- Automatic seating chart creation on first visit
- Tables created with predefined capacities (18x10 + 1x31)
- Guest household grouping for easier organization
- RSVP status integration
- Plus one support

## Future Enhancements

Potential improvements for the seating chart feature:

1. **PDF Export**: Generate printable seating charts
2. **Table Positioning**: Drag and drop tables on a 2D floor plan
3. **Auto-Assignment**: AI-powered seating suggestions
4. **Conflict Detection**: Warn about potential seating conflicts
5. **Meal Preferences**: Display dietary restrictions on table view
6. **Multiple Events**: Support different seating arrangements for ceremony/reception
7. **Guest Preferences**: Allow guests to request table proximity
8. **Print View**: Specialized print-friendly layouts
9. **Table Templates**: Reusable table configurations
10. **Analytics**: Seating completion percentage, table utilization

## Styling

Uses the existing design system:
- Tailwind CSS for utility classes
- shadcn/ui component library
- Consistent with admin panel aesthetics
- Responsive design (mobile, tablet, desktop)
- Serif fonts for elegance (matching wedding theme)

## Dependencies Added

```json
"@radix-ui/react-scroll-area": "^latest"
```

## Browser Support

- Modern browsers with drag-and-drop API support
- Touch support for mobile devices (tap to assign)
- Responsive breakpoints for all screen sizes
