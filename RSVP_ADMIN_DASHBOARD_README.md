# RSVP Admin Dashboard - Complete Setup Guide

## 🎉 Welcome!

You now have a fully functional RSVP Admin Dashboard! This guide will help you get started in minutes.

## 📋 What You Got

A complete admin interface to manage your wedding RSVPs with:

- ✅ **Real-time dashboard** - See who's attending, declined, or pending
- 📊 **Live statistics** - Response rates and guest counts
- 🔍 **Search & filter** - Find guests instantly
- 📧 **Email guests** - Send personalized messages
- 📥 **Export data** - Download CSV for planning
- 🔄 **Auto-refresh** - Always see the latest responses
- 🎨 **Beautiful UI** - Matches your wedding theme

## 🚀 Quick Start (3 Minutes)

### Step 1: Create Your Admin Account (1 min)

Open your terminal and run:

```bash
npm run create-admin
```

Enter your email when prompted. This makes you the admin/owner.

### Step 2: Start the Server (if not already running)

```bash
npm run dev
```

The server will start at `http://localhost:3001`

### Step 3: Sign In and Access Dashboard (1 min)

1. Go to: http://localhost:3001/auth/signin
2. Enter your email (the one from Step 1)
3. Check your email for the magic link
4. Click the link to sign in
5. Go to: http://localhost:3001/admin/rsvp-dashboard

**You're done!** 🎊

## 📍 Important URLs

| Purpose | URL |
|---------|-----|
| **RSVP Dashboard** | http://localhost:3001/admin/rsvp-dashboard |
| **Sign In** | http://localhost:3001/auth/signin |
| **Wedding Site** | http://localhost:3001/jeff-and-sasha |
| **Database Admin** | Run `npx prisma studio` |

## 🎯 What Can You Do?

### 1. View All RSVPs at a Glance

See instant statistics:
- Total guests invited
- How many are attending (with percentage)
- How many declined (with percentage)  
- How many haven't responded yet
- Overall response rate

### 2. Search for Any Guest

Type a name, email, or phone number in the search box to instantly find guests.

### 3. Filter by Status

Use the dropdown to show only:
- All guests
- Pending responses
- Attending guests
- Declined guests

### 4. View Guest Details

Click the eye icon (👁️) to see everything about a guest:
- Contact info (email, phone)
- Their complete RSVP response
- Meal choices and dietary restrictions
- Plus-one information
- Any messages they sent
- Their personal RSVP link

### 5. Send Emails

Click the email icon (✉️) to send a message to any guest:
- Pre-filled with their info
- Beautiful HTML template
- Uses your wedding colors
- Includes link to wedding site

### 6. Export Your Guest List

Click "Export CSV" to download a spreadsheet with all guest data. Perfect for:
- Sharing with your wedding planner
- Creating seating charts
- Final headcounts for venue
- Backup copies

### 7. Keep It Updated

The dashboard refreshes automatically every 30 seconds, so you always see the latest RSVPs without doing anything!

## 🔧 Common Tasks

### Add Another Admin User

```bash
npm run create-admin
```

### View Your Database

```bash
npx prisma studio
```

This opens a visual database browser at http://localhost:5555

### Import Guests from CSV

If you have a CSV file with your guest list:

```bash
npm run tsx scripts/import-guest-list.ts
```

### Check Your Wedding Data

```bash
npm run tsx scripts/check-couples.ts
```

### Send a Test Email

```bash
npm run tsx scripts/test-contact-email.ts
```

## 🎨 Dashboard Features Explained

### Statistics Cards (Top of Page)

| Card | What It Shows |
|------|---------------|
| **Total Guests** | Everyone on your guest list |
| **Attending** | Guests who said "Yes" (green) |
| **Declined** | Guests who said "No" (red) |
| **Pending** | Guests who haven't responded (orange) |
| **Response Rate** | % of guests who responded |

### Guest Table

| Column | Description |
|--------|-------------|
| **Name** | First and last name |
| **Email** | Contact email (if provided) |
| **Phone** | Contact phone (if provided) |
| **Status** | Color-coded RSVP status badge |
| **Plus One** | Shows if they're bringing someone |
| **Response Date** | When they submitted their RSVP |
| **Actions** | Buttons to view details or email |

### Status Badges

- 🟢 **Green (Attending)** - Guest confirmed "Yes"
- 🔴 **Red (Declined)** - Guest said "No"
- 🟠 **Orange (Pending)** - No response yet
- ⚪ **Gray (Maybe)** - Guest is undecided

## 🔒 Security

### Who Can Access?

Only users with these roles can access the dashboard:
- **OWNER** - Full access (that's you!)
- **COLLABORATOR** - Full access (co-planners)

Guests and vendors cannot access this page.

### Authentication

- Secure magic link sign-in (no passwords needed)
- Session-based authentication
- Automatic redirect if not signed in
- Protected API endpoints

### Data Privacy

- Guest data is never exposed in URLs
- All database queries verify permissions
- Emails sent through verified providers
- Secure HTTPS in production

## 🌐 Production Deployment

When you're ready to deploy to production:

### 1. Set Environment Variables

Make sure these are set on your hosting platform:

```env
DATABASE_URL=<your-production-database>
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate-a-secure-random-string>
RESEND_API_KEY=<your-resend-api-key>
EMAIL_FROM=noreply@yourdomain.com
EMAIL_PROVIDER=resend
```

### 2. Run Database Migrations

```bash
npx prisma migrate deploy
```

### 3. Create Production Admin

```bash
npm run create-admin
```

### 4. Test Everything

- Sign in works
- Dashboard loads
- Can view guests
- Can send email
- Can export CSV
- Auto-refresh works

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `RSVP_DASHBOARD_QUICKSTART.md` | Quick 3-step start guide |
| `RSVP_DASHBOARD_GUIDE.md` | Complete feature documentation |
| `RSVP_DASHBOARD_IMPLEMENTATION.md` | Technical implementation details |
| This file | Setup and overview |

## 🆘 Troubleshooting

### "Cannot access dashboard"

**Problem**: You get redirected to sign in
**Solution**: 
1. Make sure you created an admin user: `npm run create-admin`
2. Sign in at http://localhost:3001/auth/signin
3. Check your email for the magic link
4. Make sure your user has OWNER or COLLABORATOR role

### "No guests showing"

**Problem**: Dashboard is empty
**Solution**:
1. Check that you have guests in the database: `npx prisma studio`
2. Import your guest list if needed
3. Make sure guests have the correct `coupleId`
4. Try clicking the "Refresh" button

### "Email not sending"

**Problem**: Email button doesn't work
**Solution**:
1. Check your `.env` file has `RESEND_API_KEY`
2. Verify the API key is valid at resend.com
3. Check `EMAIL_FROM` is set correctly
4. Look at server console for error messages

### "Page not found"

**Problem**: 404 error on dashboard URL
**Solution**:
1. Make sure server is running: `npm run dev`
2. Check the URL: http://localhost:3001/admin/rsvp-dashboard
3. Clear browser cache and reload
4. Check terminal for build errors

### "Auto-refresh not working"

**Problem**: Dashboard doesn't update automatically
**Solution**:
1. Open browser developer console (F12)
2. Look for JavaScript errors
3. Check network tab for failed API calls
4. Try manual refresh button
5. Restart the server

## 💡 Pro Tips

### Tip 1: Bookmark the Dashboard
Add http://localhost:3001/admin/rsvp-dashboard to your bookmarks for quick access.

### Tip 2: Check Daily During RSVP Period
Make it part of your daily routine to check the dashboard and follow up with pending guests.

### Tip 3: Export Regularly
Click "Export CSV" weekly to maintain backups of your guest list.

### Tip 4: Send Personal Emails
Use the email feature to send personalized reminders to guests who haven't responded yet.

### Tip 5: Use Search Liberally
Instead of scrolling, use the search box to quickly find specific guests.

### Tip 6: Filter Before Exporting
Apply filters before exporting to create targeted lists (e.g., only attending guests for seating chart).

### Tip 7: Mobile Access
The dashboard works great on mobile - check RSVPs from anywhere!

## 📱 Mobile Access

The dashboard is fully responsive and works perfectly on:
- iPhones (Safari, Chrome)
- Android phones (Chrome, Firefox)
- iPads and tablets
- Any device with a modern browser

Just visit the same URL on your mobile device after signing in.

## 🎁 Bonus Features

### Copy Guest RSVP Link
In the guest details modal, there's a "Copy" button next to their personal RSVP link. Use this to:
- Send them their unique link via text
- Resend if they lost the original invitation
- Share on social media for that guest

### Filter + Search Together
You can use search and filter at the same time! For example:
- Filter: "Attending"
- Search: "Smith"
- Result: All attending guests with "Smith" in their name

### Email Templates
The emails you send use your wedding theme:
- Your wedding colors
- Couple names in header
- Beautiful formatting
- Link back to wedding site
- Professional appearance

## 🔮 Coming Soon

Features that could be added in the future:
- Bulk email sending (select multiple guests)
- Email templates library
- SMS notifications
- Advanced reports (dietary restrictions summary)
- Seating chart integration
- Gift tracking
- Thank you note tracking
- Mobile app
- Push notifications

## 📞 Need More Help?

1. **Check the docs**: See the other markdown files in this directory
2. **View the code**: All code has detailed comments
3. **Check server logs**: Look at the terminal where npm run dev is running
4. **Database admin**: Run `npx prisma studio` to inspect data
5. **GitHub Issues**: Open an issue if you find a bug

## ✅ Checklist for First Use

Before your first day of RSVPs:

- [ ] Created admin account
- [ ] Successfully signed in
- [ ] Accessed dashboard
- [ ] Imported guest list (or added test guests)
- [ ] Verified guest list shows correctly
- [ ] Tested search functionality
- [ ] Tested filter dropdown
- [ ] Opened guest details modal
- [ ] Sent test email to yourself
- [ ] Downloaded CSV export
- [ ] Verified auto-refresh works
- [ ] Tested on mobile device
- [ ] Bookmarked dashboard URL

## 🎊 You're All Set!

Your RSVP Admin Dashboard is ready to use! Start managing your wedding guest list like a pro.

**Questions?** Check the other documentation files or the code comments for more details.

**Enjoy your wedding planning!** 💒💐🎉

---

**Last Updated**: February 2026
**Status**: Production Ready
**Version**: 1.0.0
