# RSVP Code Gate Implementation

## Overview
Added a code gate requirement for the RSVP button on the wedding homepage. Users must enter the code `sj2026` before they can access the RSVP page.

## Changes Made

### 1. Site Header Component (`components/wedding/site-header.tsx`)
- Added state management for code dialog and RSVP access tracking
- Replaced direct RSVP link with a button that triggers code validation
- Added a modal dialog that prompts users to enter the code
- Stores access permission in `sessionStorage` so users don't need to re-enter the code during the same browser session
- Applied to both desktop and mobile navigation

### 2. Hero Video Component (`components/wedding/hero-with-video.tsx`)
- Added the same code gate logic to the mobile RSVP button in the hero section
- Consistent user experience across all RSVP entry points
- Uses shared `sessionStorage` key so entering the code once grants access everywhere

## How It Works

1. **Initial State**: RSVP buttons are clickable but gated
2. **Click Action**: When clicked, a modal dialog appears asking for the invitation code
3. **Code Validation**: User enters `sj2026` (case-insensitive)
4. **Success**: 
   - Access is granted and stored in `sessionStorage`
   - User is automatically redirected to `/rsvp/{weddingSlug}`
   - Future RSVP button clicks work immediately without re-prompting
5. **Failure**: Error message displays prompting user to try again

## Code Storage
- The required code is stored as a constant: `REQUIRED_RSVP_CODE = "sj2026"`
- Access permission is stored in `sessionStorage` with key: `"rsvp_access_granted"`
- Access persists across page navigation but resets when the browser session ends

## Benefits
- Prevents unauthorized RSVP access
- Simple, user-friendly experience
- No server-side changes required
- Maintains access during browsing session
- Consistent experience across all RSVP entry points
