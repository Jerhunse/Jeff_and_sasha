# RSVP Dashboard - Admin Guide

## Overview

The RSVP Dashboard is a comprehensive admin interface that allows you to view, manage, and communicate with all your wedding guests in real-time. This dashboard is only accessible to users with OWNER or COLLABORATOR roles.

## Accessing the Dashboard

### URL Access
The RSVP Dashboard is accessible at:
```
http://localhost:3001/admin/rsvp-dashboard
```
or
```
https://your-domain.com/admin/rsvp-dashboard
```

### Authentication Required
- You must be signed in with an admin account (OWNER or COLLABORATOR role)
- Sign in at `/auth/signin` using your email (magic link authentication)

## Setting Up Admin Access

### Create an Admin User

Run the setup script:
```bash
npm run tsx scripts/create-admin.ts
```

This will:
1. Find your wedding in the database
2. Create or update a user with OWNER role
3. Link the user to your wedding
4. Provide sign-in instructions

## Dashboard Features

### 1. Real-Time Statistics

The dashboard displays 5 key metrics at the top:

- **Total Guests**: Total number of guests invited
- **Attending**: Number of guests who responded "Yes"
- **Declined**: Number of guests who responded "No"
- **Pending**: Number of guests who haven't responded yet
- **Response Rate**: Percentage of guests who have responded

These statistics update automatically every 30 seconds.

### 2. Guest List Table

The main table displays all guests with the following columns:

- **Name**: Guest's first and last name
- **Email**: Contact email address
- **Phone**: Contact phone number
- **Status**: Current RSVP status with color-coded badge
  - Green (Attending): Guest confirmed attendance
  - Red (Declined): Guest declined invitation
  - Orange (Pending): No response yet
  - Gray (Maybe): Guest is undecided
- **Plus One**: Shows if plus-one is allowed and if used
- **Response Date**: Date when the guest responded
- **Actions**: Quick action buttons

### 3. Search and Filter

#### Search
- Search by guest name, email, or phone number
- Real-time filtering as you type
- Case-insensitive search

#### Filter by Status
- All Statuses (default)
- Pending
- Attending
- Declined
- Maybe

### 4. Guest Details View

Click the eye icon (👁️) to view detailed information:

**Contact Information:**
- Email address
- Phone number
- Plus-one allowance
- Maximum guests allowed

**RSVP Response:**
- Status (Attending/Declined/Maybe)
- Response date and time
- Plus-one name (if applicable)
- Additional details from RSVP form
  - Meal choices
  - Dietary restrictions
  - Song requests
  - Special accommodations
- Personal message from guest

**Internal Notes:**
- Any notes added for this guest

**Personal RSVP Link:**
- Unique link for this guest to access their RSVP
- Copy button to easily share the link

### 5. Email Functionality

#### Send Individual Emails

1. Click the email icon (✉️) next to any guest
2. The email dialog will open with:
   - Pre-filled recipient email
   - Customizable subject line
   - Message body with text area
3. Compose your message
4. Click "Send Email"

#### Email Features
- Beautiful HTML email templates with your wedding theme
- Personalized with couple names
- Branded with wedding colors
- Includes link back to wedding website
- Plain text fallback for email clients

#### Email Limitations
- Only available for guests with email addresses
- Button is disabled for guests without email

### 6. Export to CSV

Click "Export CSV" to download a spreadsheet containing:
- First Name
- Last Name
- Email
- Phone
- RSVP Status
- Plus One Allowed
- Response Date
- Message

Perfect for:
- Importing to other tools
- Creating mailing lists
- Backup and archiving
- Sharing with wedding planners

### 7. Auto-Refresh

The dashboard automatically refreshes guest data every 30 seconds to ensure you always see the latest RSVP responses without manual page reloading.

**Manual Refresh:**
Click the "Refresh" button to immediately fetch the latest data.

## UI Features

### Theme Consistency
The dashboard maintains the same elegant UI theme as your wedding website:
- Serif fonts for headings
- Consistent color scheme
- Clean, modern design
- Responsive layout for all devices

### Visual Indicators

**Status Badges:**
- ✓ Green: Attending
- ✗ Red: Declined
- ⏱ Orange: Pending
- ? Gray: Maybe

**Icons:**
- 👥 Users/Guests
- ✅ Confirmed attendance
- ❌ Declined
- ⏰ Pending responses
- ✉️ Email actions
- 👁️ View details
- 🔄 Refresh
- 📥 Export

## Security

### Access Control
- Only OWNER and COLLABORATOR roles can access
- Protected by NextAuth.js authentication
- Session-based security
- Automatic redirect to sign-in if not authenticated

### Data Privacy
- All guest data is protected
- Email sending uses verified providers (Resend/SES)
- No guest data is exposed in URLs
- Secure database queries with user verification

## Technical Details

### Real-Time Updates
- Polling interval: 30 seconds
- Automatic background refresh
- Loading indicators during refresh
- Error handling with fallback

### Email Provider
The system supports multiple email providers:
1. **Resend** (primary): Fast, reliable email API
2. **AWS SES** (fallback): Enterprise email service
3. Automatic failover between providers

### Performance
- Optimized database queries
- Client-side filtering for instant results
- Lazy loading of guest details
- Efficient state management

## Troubleshooting

### Cannot Access Dashboard
1. Verify you're signed in
2. Check your user role (must be OWNER or COLLABORATOR)
3. Ensure your account is linked to a wedding (coupleId)

### Email Not Sending
1. Check that EMAIL_FROM is set in .env
2. Verify RESEND_API_KEY is valid
3. Check email service status
4. Review server logs for errors

### Data Not Refreshing
1. Click manual "Refresh" button
2. Check browser console for errors
3. Verify API routes are accessible
4. Check network connectivity

### Guest Not Showing
1. Verify guest exists in database
2. Check that guest belongs to your wedding (coupleId)
3. Use search to find specific guests
4. Clear filters

## Best Practices

### Managing RSVPs
1. **Check daily** during RSVP period
2. **Follow up** with pending guests as deadline approaches
3. **Export regularly** for backup
4. **Send reminders** to non-responders
5. **Update notes** for special requirements

### Email Communication
1. **Use templates** for common messages
2. **Personalize** when possible
3. **Keep it brief** and friendly
4. **Include action items** if needed
5. **Follow up** if no response

### Data Management
1. **Export weekly** during active RSVP period
2. **Review statistics** regularly
3. **Track trends** in responses
4. **Document special requests** in notes
5. **Share with vendors** as needed

## API Endpoints

The dashboard uses these API routes:

### GET /api/admin/guests
Fetch all guests for a wedding
- Requires authentication
- Returns guests with RSVP responses
- Query param: `coupleId`

### POST /api/admin/send-email
Send email to a guest
- Requires authentication
- Body: `{ to, subject, body, guestName, coupleId }`
- Returns success/error status

## Future Enhancements

Potential features for future versions:
- Bulk email sending
- Email templates library
- SMS notifications
- Advanced filtering (by tags, households)
- Seating chart integration
- Dietary restrictions summary
- Gift tracking
- Thank you note tracking
- Mobile app version
- PDF export
- Advanced analytics

## Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Check the server logs
4. Open a GitHub issue
5. Contact the development team

---

**Last Updated**: February 2025
**Version**: 1.0.0
