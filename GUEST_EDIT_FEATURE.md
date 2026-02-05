# Guest Editing Feature Implementation

## Overview
Added complete guest editing functionality to the admin panel, allowing you to update guest names and other details.

## What Was Implemented

### 1. API Route (`app/api/admin/guests/[id]/route.ts`)
Created a new API endpoint with three methods:
- **GET**: Fetch individual guest details
- **PATCH**: Update guest information
- **DELETE**: Remove a guest (bonus feature)

Features:
- Authentication and authorization checks
- Activity logging for all changes
- Validation of required fields (firstName, lastName)
- Track changes in guest activity log

### 2. Guest Edit Form Component (`components/admin/guest-edit-form.tsx`)
A comprehensive form with the following sections:

#### Basic Information
- First Name *
- Last Name *
- Email Address
- Phone Number
- Relationship

#### Guest Settings
- Maximum Guests Allowed (number input)
- Allow Plus-One (toggle)
- VIP Guest (toggle)
- Child Guest (toggle)
- Primary Contact (toggle)
- Do Not Contact (toggle)

#### Internal Notes
- Private notes field (not visible to guest)

Features:
- Real-time form state management
- Toast notifications for success/error
- Loading states during submission
- Cancel button to return to guest details
- Automatic redirect after successful update

### 3. Updated Edit Page (`app/(admin)/admin/guests/[id]/edit/page.tsx`)
- Replaced placeholder with the actual edit form
- Maintains existing authentication and authorization
- Server-side data fetching
- Proper error handling (404 if guest not found)

### 4. UI Components Added
Created necessary UI components that were missing:
- **Switch** (`components/ui/switch.tsx`) - Toggle component for boolean fields
- **Toast** (`components/ui/toast.tsx`) - Toast notification primitive
- **Toaster** (`components/ui/toaster.tsx`) - Toast container/provider
- **useToast** (`components/ui/use-toast.ts`) - Toast hook for notifications

### 5. Dependencies Installed
```bash
npm install @radix-ui/react-toast @radix-ui/react-switch
```

## How to Use

1. **Navigate to Guest Details**
   - Go to Admin → Guests
   - Click on any guest to view their details

2. **Edit Guest**
   - Click the "Edit" button in the top-right corner
   - Or navigate directly to `/admin/guests/{guestId}/edit`

3. **Update Information**
   - Modify any fields (First Name and Last Name are required)
   - Toggle switches for guest settings
   - Add or update internal notes

4. **Save Changes**
   - Click "Save Changes" to update
   - You'll see a success toast notification
   - Automatically redirected back to guest details page

5. **Cancel**
   - Click "Cancel" to return without saving changes

## Features

### Data Validation
- First name and last name are required
- Email format validation (if provided)
- Minimum value of 1 for max guests allowed

### Activity Logging
- All changes are logged in the `GuestActivity` table
- Tracks who made the change and when
- Records what fields changed (from/to values)

### Authorization
- Only authenticated users with OWNER or COLLABORATOR roles can edit
- Guests can only be edited by users from the same couple

### User Experience
- Clean, organized form layout
- Clear field labels with descriptions
- Visual feedback (loading states, toasts)
- Mobile-responsive design

## API Endpoints

### GET `/api/admin/guests/[id]`
Fetch guest details with tags, household, and address information.

### PATCH `/api/admin/guests/[id]`
Update guest information. Accepts the following fields:
```typescript
{
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  isChild?: boolean
  isVIP?: boolean
  allowPlusOne?: boolean
  maxGuestsAllowed?: number
  notes?: string
  doNotContact?: boolean
  isPrimaryContact?: boolean
  relationship?: string
}
```

### DELETE `/api/admin/guests/[id]`
Permanently delete a guest (cascading deletes handled by Prisma).

## Testing the Feature

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the admin panel:
   - Visit `http://localhost:3000/admin`
   - Go to "Guests"
   - Click on "Kaid Rodi & Sophie" (or any guest)
   - Click "Edit"

3. Try updating the guest names and other fields

4. Verify the changes appear in the guest details page

## Notes

- The toast notifications use the existing `sonner` library that was already set up in the admin layout
- The form maintains all the styling consistency with the rest of the admin panel
- All changes are tracked in the activity log for audit purposes
- The edit form is fully typed with TypeScript for type safety

## Future Enhancements (Optional)
- Add household assignment/change capability
- Add address editing within the guest edit form
- Add ability to merge duplicate guests
- Add bulk edit functionality for multiple guests
- Add undo/redo for recent changes
