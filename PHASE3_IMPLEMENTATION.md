# Phase 3 Implementation: Invitations & Smart RSVP

## Overview
Phase 3 adds comprehensive invitation management and smart RSVP functionality to the wedding platform. This includes digital Save-the-Date and Invitation templates, email delivery, advanced RSVP forms with conditional questions, plus-one management, and admin tracking tools.

## Features Implemented

### 1. Database Schema Enhancements

#### New Enums
- `InvitationType`: SAVE_THE_DATE, INVITATION, REMINDER
- `InvitationStatus`: DRAFT, SCHEDULED, SENT, OPENED, REPLIED, BOUNCED, FAILED

#### New Models

**Invitation**
- Tracks all invitation sends (Save-the-Date, Invitations, Reminders)
- Monitors delivery status via email and SMS
- Records open tracking, click tracking, and reply status
- Stores personalized invite links
- Supports scheduling for future sends

**InvitationTemplate**
- Stores customizable templates for each invitation type
- Supports email (HTML and text) and SMS content
- Enables multiple templates per type with default selection

#### Enhanced Models

**Wedding**
- Added RSVP configuration options:
  - `maxCapacity`: Venue capacity limit
  - `askMealChoice`: Enable/disable meal selection
  - `mealOptions`: JSON array of meal choices
  - `askSongRequest`: Enable/disable song requests
  - `askBusTransport`: Enable/disable bus transportation
  - `busRoutes`: JSON array of bus routes
  - `customQuestions`: JSON array for custom RSVP questions

**Guest**
- Added invitation tracking fields:
  - `saveTheDateSent`, `saveTheDateOpened`
  - Enhanced `inviteSent`, `inviteViewed`
- Added RSVP preference fields:
  - `busRequired`, `busRoute`
  - Enhanced meal and dietary tracking

### 2. Email Service Integration

#### Email Library (`lib/email.ts`)
- Resend API integration for reliable email delivery
- Beautiful, responsive email templates with theme synchronization
- Save-the-Date template with elegant design
- Wedding Invitation template with gradient headers
- SMS message templates (infrastructure ready for Twilio)
- Automatic tracking pixel insertion for open tracking

**Template Features:**
- Dynamic color scheme matching wedding theme
- Personalized content (guest names, wedding details)
- Mobile-responsive design
- Branded with couple's names and wedding date
- Includes RSVP and website links

### 3. Invitation Sending API

#### Send Invitations (`/api/admin/invitations/send`)
- Bulk send to multiple guests
- Support for both Save-the-Date and Invitations
- Email delivery via Resend
- SMS delivery infrastructure (ready for Twilio integration)
- Automatic invitation record creation
- Guest activity logging
- Error handling and retry logic
- Returns detailed success/failure reports

#### Tracking API (`/api/admin/invitations/track`)
- Invisible tracking pixel for email opens
- Updates invitation open count and timestamp
- Updates guest viewed status
- Privacy-friendly implementation

#### Export API (`/api/admin/invitations/export`)
- CSV export of all guest invitation data
- Includes:
  - Guest contact information
  - Household assignments
  - RSVP status and dates
  - Invitation send/open status
  - Meal choices and dietary restrictions
  - Song requests and bus requirements
  - Plus-one information

### 4. Smart RSVP Form

#### RSVP Form Component (`components/rsvp/rsvp-form.tsx`)
**Conditional Questions:**
- Meal choice selection (configurable options)
- Dietary restrictions input
- Song request field
- Bus transportation requirement
- Bus route selection (when applicable)

**Plus-One Management:**
- Policy-based allowance checking
- Name capture (required)
- Email collection (optional)
- Separate meal/dietary preferences for plus-one
- Capacity validation before acceptance

**Smart Features:**
- Dynamic form showing/hiding based on attendance status
- Real-time validation
- Success confirmation with auto-redirect
- Mobile-responsive design
- Theme-synchronized styling

#### RSVP API (`/api/rsvp/[code]`)
- Secure guest authentication via invite code
- Capacity checking before accepting
- Plus-one policy enforcement
- Guest record updates
- RSVP response tracking
- Automatic invitation status updates to "REPLIED"
- Activity logging

### 5. Admin Invitation Tracker

#### Invitations Dashboard (`/app/(admin)/admin/invitations/page.tsx`)

**Statistics Display:**
- Total guests count
- Save-the-Date sent/opened counts
- Invitation sent/opened counts
- RSVP replied/pending counts
- Visual progress bars for each category

**Progress Tracking:**
- Save-the-Date progress (sent, opened, pending)
- Invitation progress (sent, replied, pending)
- Real-time statistics
- Percentage completion indicators

#### Invitation Tracker Component (`components/admin/invitation-tracker.tsx`)

**Features:**
- Searchable guest list (by name, email)
- Multi-filter support:
  - All guests
  - STD: Pending/Sent/Opened
  - Invite: Pending/Sent/Opened
  - RSVP: Replied/Pending
- Bulk selection with checkbox controls
- Status badges with icons:
  - Pending (clock icon)
  - Sent (send icon)
  - Opened (eye icon)
  - Replied (checkmark icon)
- Date stamps for all actions
- Household grouping display

**Bulk Actions:**
- Send Save-the-Date to selected guests
- Send Invitations to selected guests
- Clear selection

#### Send Invitations Dialog (`components/admin/send-invitations-dialog.tsx`)

**Features:**
- Type selection (Save-the-Date vs Invitation)
- Delivery method selection (Email/SMS)
- Guest count display
- Real-time sending progress
- Success/error reporting
- Detailed failure information
- Auto-refresh after send

### 6. Navigation & User Experience

- Added "Invitations" to admin navigation menu
- Icon-based navigation with Mail icon
- Positioned between Guests and Events for logical workflow
- Consistent styling with existing admin pages

## Technical Details

### Email Delivery
- **Provider**: Resend (resend.com)
- **Configuration**: `RESEND_API_KEY` environment variable
- **From Address**: Configurable via `EMAIL_FROM` environment variable
- **Fallback**: Graceful degradation when API key not configured

### SMS Delivery (Infrastructure Ready)
- Prepared for Twilio integration
- SMS message templates created
- API structure in place
- Currently marked as "Coming Soon" in UI

### Tracking Implementation
- Invisible 1x1 pixel for email opens
- No third-party tracking services
- Privacy-conscious design
- Automatic timestamp recording

### Security & Validation
- Invite code-based guest authentication
- Wedding ID verification on all admin actions
- Capacity enforcement before RSVP acceptance
- Plus-one policy validation
- SQL injection protection via Prisma
- XSS protection via React

## Setup Instructions

### 1. Environment Variables
Add to your `.env` file:

```env
# Resend Email API
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=noreply@yourdomain.com

# Base URL for invite links
NEXTAUTH_URL=https://yourdomain.com
```

### 2. Database Migration
Run Prisma migration to update the database schema:

```bash
npx prisma migrate dev --name phase3_invitations
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Resend Setup
1. Sign up at [resend.com](https://resend.com)
2. Verify your sending domain
3. Create an API key
4. Add to environment variables

### 5. Optional: Twilio SMS (Future)
For SMS functionality:
1. Sign up at [twilio.com](https://twilio.com)
2. Get phone number and credentials
3. Add environment variables (when implementing)

## Usage Guide

### For Administrators

#### Sending Save-the-Dates
1. Go to Admin → Invitations
2. Use filters to select guests (e.g., "STD - Pending")
3. Select guests via checkboxes
4. Click "Send Save the Date"
5. Confirm delivery method (Email)
6. Click Send
7. Monitor status in tracker table

#### Sending Invitations
1. Go to Admin → Invitations
2. Filter for guests who received STD
3. Select guests to invite
4. Click "Send Invitation"
5. Confirm and send
6. Track opens and replies in real-time

#### Monitoring Responses
- View status badges for each guest
- Filter by RSVP status (Replied/Pending)
- Export data to CSV for analysis
- Check individual guest details

#### Exporting Data
1. Click "Export CSV" button
2. Download includes all invitation and RSVP data
3. Open in Excel/Google Sheets
4. Use for mail merge, analysis, etc.

### For Guests

#### Receiving Invitations
- Personalized email with beautiful design
- Click through to wedding website
- Unique RSVP link

#### Submitting RSVP
1. Click RSVP link in email
2. Select "Joyfully Accepts" or "Regretfully Declines"
3. If attending:
   - Provide/confirm contact info
   - Select meal choice
   - Enter dietary restrictions
   - Request a song
   - Indicate bus need (if applicable)
   - Add plus-one details (if allowed)
4. Submit form
5. Receive confirmation

## API Endpoints

### Admin Endpoints

**POST /api/admin/invitations/send**
- Bulk send invitations
- Body: `{ guestIds, type, sendViaEmail, sendViaSMS }`
- Returns: Success count and error details

**GET /api/admin/invitations/track**
- Tracking pixel endpoint
- Query: `?id=invitationId&guestId=guestId`
- Returns: 1x1 transparent GIF

**GET /api/admin/invitations/export**
- Export guest data to CSV
- Returns: CSV file download

### Public Endpoints

**POST /api/rsvp/[code]**
- Submit RSVP response
- Body: Includes status, meal, dietary, plus-one, etc.
- Returns: Success confirmation

## Data Models

### Invitation Record
```typescript
{
  id: string
  weddingId: string
  guestId: string
  type: "SAVE_THE_DATE" | "INVITATION" | "REMINDER"
  status: "DRAFT" | "SCHEDULED" | "SENT" | "OPENED" | "REPLIED" | "BOUNCED" | "FAILED"
  sentViaEmail: boolean
  emailAddress: string
  emailSentAt: DateTime
  emailOpenedAt: DateTime
  sentViaSMS: boolean
  phoneNumber: string
  smsSentAt: DateTime
  inviteLink: string
  openCount: number
  lastOpenedAt: DateTime
  errorMessage: string
  scheduledFor: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}
```

### RSVP Submission
```typescript
{
  status: "ATTENDING" | "DECLINED" | "MAYBE"
  email: string
  phone: string
  mealChoice: string
  dietaryRestrictions: string
  songRequest: string
  busRequired: boolean
  busRoute: string
  message: string
  hasPlusOne: boolean
  plusOneName: string
  plusOneEmail: string
  plusOneMealChoice: string
  plusOneDietary: string
}
```

## Theme Synchronization

Email templates automatically use wedding theme colors:
- Primary color for headers, buttons, accents
- Secondary color for gradients
- Responsive to theme changes in admin settings
- Consistent branding across all communications

## Accessibility Features

- Semantic HTML in emails
- High contrast text
- Alt text for images
- Screen reader friendly
- Keyboard navigable forms
- ARIA labels where appropriate

## Performance Considerations

- Bulk sending processed asynchronously
- Pagination on large guest lists (50 per page)
- Efficient database queries with proper indexes
- Optimistic UI updates
- Minimal re-renders in React components

## Error Handling

- Graceful degradation when email service unavailable
- Detailed error messages for failed sends
- Individual guest error tracking
- Retry capability for failed sends
- User-friendly error displays

## Future Enhancements

1. **SMS Integration**: Complete Twilio integration for SMS invitations
2. **Scheduling**: Schedule invitations for future send dates
3. **A/B Testing**: Test different invitation templates
4. **Reminders**: Automated RSVP deadline reminders
5. **Template Editor**: Visual template customization tool
6. **Analytics**: Detailed engagement metrics and charts
7. **Translations**: Multi-language invitation support
8. **Print Export**: Generate printable invitation PDFs

## Testing Recommendations

1. **Email Testing**:
   - Test with various email clients (Gmail, Outlook, Apple Mail)
   - Check mobile rendering
   - Verify tracking pixels work
   - Test spam filter scores

2. **RSVP Testing**:
   - Test all conditional logic paths
   - Verify capacity limits
   - Check plus-one flows
   - Test form validation

3. **Admin Testing**:
   - Bulk send with various guest selections
   - Test all filters and search
   - Verify CSV export accuracy
   - Check status updates

## Support & Troubleshooting

### Email Not Sending
- Check `RESEND_API_KEY` is set correctly
- Verify domain is verified in Resend
- Check API quota limits
- Review error messages in admin UI

### Tracking Not Working
- Verify tracking pixel URL is accessible
- Check if email client blocks images
- Confirm database updates are occurring

### RSVP Submission Failing
- Check invite code is valid
- Verify capacity limits
- Confirm plus-one policy settings
- Review browser console for errors

## Migration Notes

If upgrading from previous phases:
1. Backup database before migration
2. Run Prisma migration
3. Generate new Prisma client
4. Test with sample data first
5. Verify existing guest data is intact

## Conclusion

Phase 3 provides a complete invitation and RSVP management system. The implementation is production-ready, scalable, and provides an excellent user experience for both administrators and guests.

All components are fully integrated with the existing wedding platform, maintaining consistent styling, authentication, and data management patterns.

