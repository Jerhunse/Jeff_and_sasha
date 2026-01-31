# RSVP Code Gate Implementation

## Overview
Implemented a code gate that prompts users to enter "sj2026" before accessing the RSVP form from the landing page.

## Changes Made

### 1. Created RsvpCodeGate Component
**File**: `components/wedding/rsvp-code-gate.tsx`

- Modal dialog that prompts for an access code
- Accepts only "sj2026" (case-insensitive)
- Shows error message for invalid codes
- Redirects to RSVP form upon successful validation
- Clean, elegant UI with Lock icon and form validation

### 2. Updated VideoSplash Component
**File**: `components/wedding/video-splash.tsx`

- Changed RSVP button from direct link to button that opens code gate dialog
- Added state management for showing/hiding the code gate
- Imported and integrated RsvpCodeGate component

### 3. Updated Component Exports
**File**: `components/wedding/index.ts`

- Exported RsvpCodeGate for potential reuse elsewhere

## How It Works

1. User lands on the home page with countdown timer
2. User clicks "RSVP Now" button
3. Code gate dialog appears asking for access code
4. User enters "sj2026" (case doesn't matter)
5. Upon successful validation, user is redirected to `/rsvp/[wedding-slug]`
6. Invalid codes show an error message
7. User can cancel to return to the landing page

## Code Validation
- Valid code: `sj2026`
- Case-insensitive (SJ2026, Sj2026, etc. all work)
- Shows clear error messages for invalid attempts
- Required field validation

## User Experience
- Clean modal dialog with elegant design
- Lock icon for visual indication of security
- Auto-focus on input field
- Clear error messaging
- Cancel and Continue buttons
- Responsive design

## Testing
The development server is running at `http://localhost:3000`

To test:
1. Navigate to the home page
2. Click "RSVP Now"
3. Try entering wrong codes (should see error)
4. Enter "sj2026" in any case (should redirect to RSVP form)
