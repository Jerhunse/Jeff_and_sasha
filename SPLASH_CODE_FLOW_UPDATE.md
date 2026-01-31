# Splash Page Code Flow Update

## Summary
Updated the landing splash page to implement a new multi-step authentication and navigation flow.

## Changes Made

### 1. Modified `components/wedding/video-splash.tsx`

#### Previous Flow:
- Displayed countdown timer
- Single "RSVP Now" button
- Clicking button opened code gate dialog
- After valid code, navigated to `/rsvp/${weddingSlug}`

#### New Flow:
1. **Initial State**: Displays countdown timer with "Enter" button
2. **Code Entry**: Clicking "Enter" opens dialog prompting for access code
3. **Code Validation**: 
   - If valid code (`sj2026`), proceeds to action choice
   - If invalid code, shows error: "You don't have access due to an incorrect code. Please try again."
4. **Action Choice**: After valid code entry, displays two buttons:
   - **"RSVP Now"**: Takes user directly to RSVP form (`/rsvp/${weddingSlug}/new`)
   - **"Already RSVP'd"**: Takes user to main wedding website (`/${weddingSlug}`)

### 2. Key Implementation Details

#### State Management
- Uses `FlowStage` type: `"initial" | "code-prompt" | "action-choice"`
- Stores validated code in `sessionStorage` for RSVP flow continuity
- Code validation is case-insensitive

#### User Experience Improvements
- Progressive disclosure: Users see one step at a time
- Clear error messaging for invalid codes
- Direct navigation after code validation (no redundant prompts)
- Seamless transition between dialogs

#### Technical Changes
- Added `useRouter` from Next.js for navigation
- Integrated Dialog, Input, Button, and Label components from UI library
- Added Lock and AlertCircle icons from lucide-react
- Removed dependency on separate `RsvpCodeGate` component

## File Structure
```
components/wedding/video-splash.tsx  (modified)
├── Initial splash screen with countdown
├── Code entry dialog
└── Action choice dialog
```

## Testing Checklist
- [ ] "Enter" button appears on splash page
- [ ] Clicking "Enter" opens code entry dialog
- [ ] Invalid code shows appropriate error message
- [ ] Valid code (`sj2026`) proceeds to action choice
- [ ] "RSVP Now" navigates to `/rsvp/${slug}/new`
- [ ] "Already RSVP'd" navigates to `/${slug}`
- [ ] Cancel button closes dialog and resets state
- [ ] Code validation is case-insensitive
- [ ] sessionStorage stores validated code

## Valid Access Code
- Code: `sj2026` (case-insensitive)

## Navigation Paths
- **RSVP Now**: `/rsvp/${weddingSlug}/new` - Direct to RSVP form
- **Already RSVP'd**: `/${weddingSlug}` - Main wedding website (home page)

## Notes
- The old `RsvpCodeGate` component still exists but is no longer used by video-splash
- Code is stored in sessionStorage for potential future use in RSVP flow
- All UI components are from the existing design system
- Error messages are user-friendly and actionable
