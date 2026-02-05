# Guest Tag Management Feature

## Overview
This feature allows you to organize and manage guest tags in your wedding platform. Guests can be assigned multiple tags to help with organization, filtering, and group management.

## What's Been Implemented

### 1. Default Tags Created
Two default tags have been created:
- **Family** (Green #6b9c7f) - For family members
- **Friends** (Teal #2a9d8f) - For friends of the couple

### 2. Tag Management Features

#### Individual Guest Tagging
- View and manage tags on the guest detail page (`/admin/guests/[id]`)
- Add multiple tags to a single guest
- Remove tags from a guest with one click
- Visual tag badges with custom colors

#### Bulk Tag Management
- Select multiple guests from the guest list
- Add tags to multiple guests at once
- Progress feedback showing successful tag assignments

### 3. API Endpoints Created

#### `/api/admin/guests/[id]/tags`
- **GET**: Fetch all tags for a specific guest
- **POST**: Add a tag to a guest
  ```json
  {
    "tagId": "tag-id-here"
  }
  ```
- **DELETE**: Remove a tag from a guest (requires `?tagId=tag-id-here` query parameter)

### 4. Components Created

#### `GuestTagManager`
Location: `/components/admin/guest-tag-manager.tsx`
- Interactive tag management for individual guests
- Dialog-based tag selection
- Real-time add/remove functionality
- Visual feedback with color-coded badges

#### `BulkTagManager`
Location: `/components/admin/bulk-tag-manager.tsx`
- Bulk tag assignment for multiple guests
- Progress tracking and success/error reporting
- Handles duplicate tag assignments gracefully

### 5. Script Created

#### `create-default-tags.ts`
Location: `/scripts/create-default-tags.ts`

Run this script to create the default Family and Friends tags:
```bash
npx tsx scripts/create-default-tags.ts
```

## Usage

### Managing Tags on Individual Guests

1. Navigate to a guest's detail page: `/admin/guests/[guest-id]`
2. In the "Guest Details" card, you'll see the "Tags" section
3. Click "Add Tag" to open the tag selection dialog
4. Select a tag to assign it to the guest
5. Click the X button on any tag badge to remove it

### Bulk Tag Management

1. Go to the guest list page: `/admin/guests`
2. Select multiple guests using the checkboxes
3. Click "Add Tag" in the bulk actions bar
4. Select a tag to assign to all selected guests
5. The system will show success/failure counts

### Creating New Tags

1. Go to the tags management page: `/admin/guests/tags`
2. Click "New Tag"
3. Fill in:
   - Name (required)
   - Description (optional)
   - Color (select from presets or use custom color picker)
4. Click "Create Tag"

## Database Schema

The tag system uses three main models:

### Tag
- `id`: Unique identifier
- `coupleId`: Links to the couple
- `name`: Tag name (unique per couple)
- `color`: Hex color code
- `description`: Optional description
- `isSystem`: Whether this is a system tag

### GuestTag (Join Table)
- `id`: Unique identifier
- `guestId`: Links to the guest
- `tagId`: Links to the tag
- `addedAt`: Timestamp when tag was added
- `addedBy`: User ID who added the tag

### Guest
- Has many tags through GuestTag relationship

## Features

✅ Multiple tags per guest
✅ Visual color-coded badges
✅ Individual guest tag management
✅ Bulk tag assignment
✅ Tag creation and management
✅ Duplicate tag prevention
✅ Real-time updates
✅ Guest filtering by tags (in guest list)

## Future Enhancements

Potential improvements:
- Tag-based email campaigns
- Tag statistics and analytics
- Tag groups/categories
- Tag-based seating arrangements
- Export guest list filtered by tags
- Tag-based RSVP reminders
