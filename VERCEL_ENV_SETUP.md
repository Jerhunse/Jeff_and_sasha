# Vercel Environment Variable Setup

## ✅ Action Required: Update EMAIL_FROM on Vercel

Your Resend domain (jeffandsasha.com) is now verified. You need to update the environment variable on Vercel for emails to work in production.

### Steps:

1. Go to https://vercel.com/jeffs-projects-bf57b1a5/wedding-platform/settings/environment-variables

2. Find `EMAIL_FROM` (or add it if it doesn't exist)

3. Update the value to:
   ```
   photos@jeffandsasha.com
   ```

4. Make sure it's set for:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

5. Click "Save"

6. The app will auto-deploy on the next push

### Why This Matters

- **Before**: Using `onboarding@resend.dev` (test sender) - only works for emails sent to your Resend account email
- **After**: Using `photos@jeffandsasha.com` (verified domain) - works for ANY email address

### Testing

Once the env var is set and deployed, try the photobooth email feature with any email address. You should receive:
- Wedding-themed email with photo thumbnails
- "Download All Photos" button
- Professional sender: "Lumina Booth <photos@jeffandsasha.com>"

### Current Status

✅ Local .env updated  
⚠️ Vercel environment variable (needs manual update - see step 1 above)  
✅ Resend domain verified  
✅ Code updated to use EMAIL_FROM env var

