# Phase 3 Quick Reference Card

## 🚀 Quick Start (5 Minutes)

### 1. Install & Migrate
```bash
npm install
npx prisma migrate dev --name phase3_invitations
npx prisma generate
```

### 2. Add Environment Variables
Add to `.env`:
```env
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

### 3. Start Server
```bash
npm run dev
```

### 4. Test
- Go to http://localhost:3000/admin/invitations
- Send test invitation to yourself
- Check email and test RSVP

## 📧 Sending Invitations

### Save-the-Date
1. **Admin → Invitations**
2. Select guests (checkbox)
3. Click **"Send Save the Date"**
4. Confirm & Send
5. Monitor status updates

### Wedding Invitations
1. **Admin → Invitations**
2. Filter: "Invite - Pending"
3. Select guests
4. Click **"Send Invitation"**
5. Confirm & Send
6. Track replies

## 📊 Status Badges

| Badge | Icon | Meaning |
|-------|------|---------|
| **Pending** | 🕐 Clock | Not sent yet |
| **Sent** | 📧 Send | Email delivered |
| **Opened** | 👁️ Eye | Guest viewed email |
| **Replied** | ✅ Check | RSVP submitted |

## 🔍 Filters

### Save-the-Date
- **STD - Pending**: Not sent
- **STD - Sent**: Sent but not opened
- **STD - Opened**: Guest viewed

### Invitations
- **Invite - Pending**: Not sent
- **Invite - Sent**: Sent but not opened
- **Invite - Opened**: Viewed but no RSVP
- **RSVP - Replied**: Submitted RSVP
- **RSVP - Pending**: Awaiting response

## 🎯 RSVP Questions

Configure in wedding settings:

```javascript
// Meal Choices
askMealChoice: true
mealOptions: ["Chicken", "Beef", "Fish", "Vegetarian"]

// Song Requests
askSongRequest: true

// Bus Transportation
askBusTransport: true
busRoutes: ["Hotel A", "Hotel B", "Downtown"]

// Capacity Limit
maxCapacity: 150
```

## 🔗 Important URLs

| Purpose | URL Pattern |
|---------|-------------|
| Admin Dashboard | `/admin/invitations` |
| RSVP (Guest) | `/rsvp/{inviteCode}` |
| Export CSV | `/api/admin/invitations/export` |
| Tracking Pixel | `/api/admin/invitations/track` |

## 📱 API Endpoints

### Send Invitations
```javascript
POST /api/admin/invitations/send
Body: {
  guestIds: ["id1", "id2"],
  type: "SAVE_THE_DATE" | "INVITATION",
  sendViaEmail: true,
  sendViaSMS: false
}
```

### Submit RSVP
```javascript
POST /api/rsvp/[code]
Body: {
  status: "ATTENDING",
  email: "guest@example.com",
  mealChoice: "Chicken",
  dietaryRestrictions: "Vegetarian",
  songRequest: "Sweet Caroline",
  busRequired: true,
  busRoute: "Hotel A",
  hasPlusOne: true,
  plusOneName: "Jane Doe",
  plusOneEmail: "jane@example.com"
}
```

## 🎨 Email Templates

### Colors
- Primary color from wedding theme
- Secondary color for gradients
- Automatically synchronized

### Content
- Couple's names
- Wedding date & venue
- Personalized greeting
- RSVP link (invitations only)
- Website link

### Tracking
- Invisible 1x1 pixel for opens
- Link tracking for clicks
- Privacy-friendly

## 🛠️ Common Tasks

### Add Guest with Plus-One
```sql
UPDATE Guest 
SET allowPlusOne = true 
WHERE id = 'guest_id';
```

### Set Venue Capacity
```sql
UPDATE Wedding 
SET maxCapacity = 150 
WHERE id = 'wedding_id';
```

### Configure Meal Options
```sql
UPDATE Wedding 
SET 
  askMealChoice = true,
  mealOptions = '["Chicken", "Beef", "Fish", "Vegetarian"]'
WHERE id = 'wedding_id';
```

### Enable Bus Transportation
```sql
UPDATE Wedding 
SET 
  askBusTransport = true,
  busRoutes = '["Hotel Route A", "Hotel Route B"]'
WHERE id = 'wedding_id';
```

## 📈 Statistics Available

### Dashboard Shows:
- Total guests
- Save-the-Date: Sent, Opened, Pending
- Invitations: Sent, Opened, Replied
- RSVP: Attending, Declined, Pending
- Progress bars with percentages

### Export Includes:
- Guest names & contact info
- Household assignments
- All invitation statuses & dates
- RSVP responses
- Meal choices
- Dietary restrictions
- Song requests
- Bus requirements
- Plus-one details

## 🚨 Troubleshooting Quick Fixes

### Emails Not Sending
```bash
# Check API key
echo $RESEND_API_KEY

# Verify domain at https://resend.com/domains
```

### Guest Can't RSVP
- Verify invite code is correct
- Check capacity limits
- Confirm guest email matches

### Tracking Not Working
- Enable images in email client
- Check database for open timestamps
- Clear browser cache

### Database Issues
```bash
# Reset and remigrate
npx prisma migrate reset
npx prisma migrate dev
npx prisma generate
```

## 📞 Support

| Issue | Solution |
|-------|----------|
| **Email Bounced** | Verify guest email address |
| **Spam Folder** | Add sender to contacts |
| **Can't Find Invite** | Resend from admin panel |
| **RSVP Not Saving** | Check browser console |
| **Capacity Reached** | Update maxCapacity setting |

## 🎓 Key Concepts

### Invite Code
- Unique per guest
- Used in RSVP URL
- Example: `/rsvp/clx1234567890`

### Invitation Types
1. **SAVE_THE_DATE**: Early announcement
2. **INVITATION**: Formal invite with RSVP
3. **REMINDER**: Follow-up (future)

### Status Progression
1. **DRAFT** → Not sent yet
2. **SENT** → Email delivered
3. **OPENED** → Guest viewed
4. **REPLIED** → RSVP submitted

### Plus-One Policy
- Set per guest (`allowPlusOne`)
- Validates before acceptance
- Collects name (required)
- Tracks meal/dietary (optional)

## 💡 Pro Tips

1. **Test First**: Always send to yourself before guests
2. **Stagger Sends**: Don't send 200 at once
3. **Monitor Daily**: Check stats during RSVP period
4. **Follow Up**: Export CSV weekly to track non-responders
5. **Backup Data**: Export CSV regularly as backup
6. **Update Prompts**: Keep guest info current
7. **Theme Match**: Update colors in settings first
8. **Mobile Test**: Check emails on mobile devices
9. **Set Deadlines**: Configure RSVP deadline clearly
10. **Plan Capacity**: Set realistic venue limits

## 🎉 Success Metrics

Good invitation campaigns show:
- **70-80%** open rate
- **60-70%** RSVP rate (within deadline)
- **<5%** bounced emails
- **Most replies** within 1 week

---

**Need More Help?**
- Detailed Guide: `PHASE3_IMPLEMENTATION.md`
- Setup Steps: `PHASE3_SETUP_CHECKLIST.md`
- Full Summary: `PHASE3_SUMMARY.md`

**Ready to Launch?**
✅ All tests pass → ✅ Guests have emails → ✅ Theme looks good → **SEND!** 🚀

