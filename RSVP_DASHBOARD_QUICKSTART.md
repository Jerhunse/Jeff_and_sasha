# Quick Start: RSVP Dashboard

## What is this?

The RSVP Dashboard is your command center for managing all wedding guest RSVPs. It gives you:

- ✅ Real-time view of who's attending, declined, or pending
- 📊 Statistics and response rates
- 📧 Send emails directly to guests
- 🔍 Search and filter guests easily
- 📥 Export guest list to CSV
- 👁️ View detailed guest information
- 🔄 Auto-refreshing data

## Getting Started in 3 Steps

### 1. Create Your Admin Account

Run this command in your terminal:

```bash
npm run create-admin
```

Enter your email address when prompted. This will set you up as the OWNER of the wedding.

### 2. Sign In

1. Go to: `http://localhost:3001/auth/signin`
2. Enter your email address
3. Click the magic link sent to your email
4. You'll be automatically signed in

### 3. Access the Dashboard

Visit: `http://localhost:3001/admin/rsvp-dashboard`

That's it! You're now viewing your RSVP dashboard.

## What You Can Do

### View Statistics
At the top of the page, you'll see:
- Total number of invited guests
- How many are attending
- How many declined
- How many haven't responded yet
- Overall response rate

### Search for Guests
Use the search box to quickly find guests by name, email, or phone number.

### Filter by Status
Click the filter dropdown to show only:
- All guests
- Pending responses
- Attending guests
- Declined guests
- Maybe responses

### View Guest Details
Click the eye icon (👁️) next to any guest to see:
- Contact information
- Their RSVP response with all details
- Any messages they included
- Their unique RSVP link

### Send Emails
Click the email icon (✉️) to:
- Send a personalized email to any guest
- Remind them to RSVP
- Send updates about the wedding
- Answer their questions

The email will be beautifully formatted with your wedding theme and colors!

### Export Data
Click "Export CSV" to download a spreadsheet with all guest information. Use this to:
- Share with your wedding planner
- Import into other tools
- Create backup copies
- Generate mailing lists

## Tips

- **Auto-Refresh**: The dashboard updates every 30 seconds automatically. No need to refresh!
- **Manual Refresh**: Click the "Refresh" button to immediately get the latest data.
- **Mobile Friendly**: Access the dashboard from your phone or tablet anytime.
- **Secure**: Only you (and collaborators you add) can access this dashboard.

## Need Help?

- Full documentation: See `RSVP_DASHBOARD_GUIDE.md`
- Can't sign in? Make sure you ran `npm run create-admin` first
- No guests showing? Check that you've imported your guest list
- Emails not sending? Verify your `.env` file has `RESEND_API_KEY` set

## Quick Commands

```bash
# Create admin user
npm run create-admin

# Start the development server
npm run dev

# Import guest list (if you have a CSV)
npm run tsx scripts/import-guest-list.ts

# View database
npx prisma studio
```

## Access URLs

- **RSVP Dashboard**: http://localhost:3001/admin/rsvp-dashboard
- **Sign In**: http://localhost:3001/auth/signin
- **Wedding Site**: http://localhost:3001/[your-slug]

---

Enjoy managing your wedding RSVPs! 🎉
