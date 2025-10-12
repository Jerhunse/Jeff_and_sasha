# Phase 3 Setup Checklist

Use this checklist to ensure Phase 3 is properly configured and working.

## ✅ Pre-Setup

- [ ] Backup your database
- [ ] Review existing guest data
- [ ] Note current wedding configuration

## 📦 Installation

- [ ] Install dependencies: `npm install`
- [ ] Verify Resend package installed: Check `package.json`
- [ ] Copy `.env.example` to `.env` if needed

## 🗄️ Database Migration

- [ ] Run migration: `npx prisma migrate dev --name phase3_invitations`
- [ ] Verify migration success (no errors)
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Check new tables exist:
  - [ ] `Invitation`
  - [ ] `InvitationTemplate`
- [ ] Check new fields on `Wedding` model
- [ ] Check new fields on `Guest` model

## 🔑 Resend Email Setup

### Account Setup
- [ ] Sign up at [resend.com](https://resend.com)
- [ ] Verify your email address
- [ ] Choose a plan (Free tier: 100 emails/day)

### Domain Verification
- [ ] Add your domain in Resend dashboard
- [ ] Add DNS records (provided by Resend):
  - [ ] SPF record
  - [ ] DKIM record
  - [ ] Return-Path record (optional but recommended)
- [ ] Wait for DNS propagation (can take up to 24 hours)
- [ ] Verify domain status shows "Verified"

### API Key
- [ ] Create API key in Resend dashboard
- [ ] Copy API key
- [ ] Add to `.env` as `RESEND_API_KEY`
- [ ] Add sender email as `EMAIL_FROM` (must be from verified domain)

## ⚙️ Environment Variables

Add to your `.env` file:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
```

- [ ] `RESEND_API_KEY` is set
- [ ] `EMAIL_FROM` uses verified domain
- [ ] `NEXTAUTH_URL` matches your domain
- [ ] Restart dev server after adding variables

## 🧪 Testing

### Email Sending Test
- [ ] Start dev server: `npm run dev`
- [ ] Log in as admin
- [ ] Go to Admin → Invitations
- [ ] Select one test guest (with your email)
- [ ] Click "Send Save the Date"
- [ ] Check email delivery:
  - [ ] Email received in inbox
  - [ ] Email displays correctly (not in spam)
  - [ ] Images load properly
  - [ ] Links work correctly
  - [ ] Colors match wedding theme

### RSVP Form Test
- [ ] Open invitation email
- [ ] Click RSVP link
- [ ] Verify form loads with guest name
- [ ] Test "Joyfully Accepts" flow:
  - [ ] Meal choice appears (if enabled)
  - [ ] Song request appears (if enabled)
  - [ ] Bus selection appears (if enabled)
  - [ ] Plus-one section appears (if allowed)
- [ ] Submit RSVP
- [ ] Verify success message
- [ ] Check admin dashboard shows updated status

### Tracking Test
- [ ] Send test invitation
- [ ] Open email in different email client
- [ ] Verify "Opened" status updates in admin
- [ ] Submit RSVP
- [ ] Verify "Replied" status updates in admin

### Export Test
- [ ] Go to Admin → Invitations
- [ ] Click "Export CSV"
- [ ] Download file
- [ ] Open in spreadsheet software
- [ ] Verify all data is present and correct

## 🎨 Configuration

### Wedding Settings
Configure RSVP options in wedding settings or database:

- [ ] Set `askMealChoice` (true/false)
- [ ] Set `mealOptions` JSON:
  ```json
  ["Chicken", "Beef", "Fish", "Vegetarian"]
  ```
- [ ] Set `askSongRequest` (true/false)
- [ ] Set `askBusTransport` (true/false)
- [ ] Set `busRoutes` JSON (if bus enabled):
  ```json
  ["Hotel Route A", "Hotel Route B", "Downtown Route"]
  ```
- [ ] Set `maxCapacity` (optional venue limit)

### Guest Configuration
- [ ] Ensure guests have email addresses
- [ ] Set `allowPlusOne` for eligible guests
- [ ] Verify invite codes are generated
- [ ] Check household assignments if used

## 🚀 Production Deployment

### Pre-Deployment
- [ ] All tests passing locally
- [ ] Environment variables configured on host
- [ ] Database migrated on production
- [ ] Resend domain verified and production-ready

### Post-Deployment
- [ ] Test email sending on production
- [ ] Test RSVP submission on production
- [ ] Verify tracking works
- [ ] Check export functionality
- [ ] Monitor for any errors

## 📊 Admin Training

Make sure wedding administrators know how to:
- [ ] Navigate to Invitations page
- [ ] Use search and filters
- [ ] Select multiple guests
- [ ] Send Save-the-Dates
- [ ] Send Invitations
- [ ] Monitor open/reply status
- [ ] Export data to CSV
- [ ] Read status badges:
  - Clock = Pending
  - Paper plane = Sent
  - Eye = Opened
  - Checkmark = Replied

## 🎯 Launch Checklist

### Save-the-Date Launch
- [ ] All guest emails verified
- [ ] Wedding details finalized
- [ ] Website content complete
- [ ] Test email sent and reviewed
- [ ] Send to small test group first
- [ ] Monitor for bounces/errors
- [ ] Send to remaining guests

### Invitation Launch
- [ ] RSVP deadline set
- [ ] Meal choices configured (if applicable)
- [ ] Bus routes configured (if applicable)
- [ ] Plus-one policies set
- [ ] Capacity limit set (if applicable)
- [ ] Test RSVP form thoroughly
- [ ] Send test invitation
- [ ] Review and approve design
- [ ] Send to all guests

## 🔍 Monitoring

### Daily (During RSVP Period)
- [ ] Check invitation open rates
- [ ] Monitor RSVP submissions
- [ ] Review any error messages
- [ ] Respond to guest questions
- [ ] Update guest information as needed

### Weekly
- [ ] Export CSV for analysis
- [ ] Follow up with non-responders (manually)
- [ ] Check capacity vs. acceptances
- [ ] Update seating assignments
- [ ] Review dietary restrictions

## ❗ Troubleshooting

### Emails Not Sending
- [ ] Check Resend API key is valid
- [ ] Verify domain is verified in Resend
- [ ] Check Resend dashboard for errors
- [ ] Review API quota/limits
- [ ] Check spam folder

### Tracking Not Working
- [ ] Verify pixel URL is accessible
- [ ] Check email client doesn't block images
- [ ] Confirm database is updating
- [ ] Clear browser cache and test again

### RSVP Errors
- [ ] Check invite code is valid
- [ ] Verify capacity limits
- [ ] Confirm plus-one policy settings
- [ ] Check browser console for errors
- [ ] Review API route logs

### Database Issues
- [ ] Verify migration ran successfully
- [ ] Check Prisma client is generated
- [ ] Confirm database connection
- [ ] Review table structures

## 📞 Support Resources

- **Resend Documentation**: https://resend.com/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Phase 3 Implementation Guide**: See `PHASE3_IMPLEMENTATION.md`

## ✨ Success Criteria

Phase 3 is successfully set up when:
- [ ] Test invitation sends successfully
- [ ] Email arrives and displays correctly
- [ ] Tracking pixel records opens
- [ ] RSVP form submits successfully
- [ ] Admin dashboard shows correct statuses
- [ ] CSV export downloads with data
- [ ] All conditional questions work
- [ ] Plus-one flow functions properly
- [ ] Capacity limits are enforced
- [ ] No console errors or warnings

---

**Congratulations!** 🎉 Once all items are checked, Phase 3 is complete and you're ready to start sending invitations!

