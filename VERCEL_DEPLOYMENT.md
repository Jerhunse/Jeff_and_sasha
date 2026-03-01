# 🚀 Vercel Deployment Guide

## Step 1: Login to Vercel

Run this command:
```bash
vercel login
```

This will open your browser to authenticate.

## Step 2: Set Environment Variables

**IMPORTANT:** Before deploying, you need to add these environment variables to your Vercel project.

### Required Environment Variables:

**1. Google Drive Folder ID:**
```
GOOGLE_DRIVE_FOLDER_ID=1jxvGRgOjRrfcszuSPWWQMbj2_AWCQ2LM
```

**2. Google Service Account Key (Base64):**

Your base64-encoded service account key has been generated at:
```
/tmp/service-account-base64.txt
```

Copy this value and use it for:
```
GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=<paste_the_base64_value>
```

To view the base64 key, run:
```bash
cat /tmp/service-account-base64.txt
```

**3. Other Required Variables:**

You'll also need to set these (use your existing values from `.env.local`):
```
DATABASE_URL=<your_database_url>
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=<your_nextauth_secret>
```

## Step 3: Two Options to Deploy

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Click "Environment Variables"
4. Add all the variables listed above
5. Click "Deploy"

**Vercel will automatically:**
- Install dependencies
- Build your Next.js app
- Deploy to production
- Give you a URL

### Option B: Deploy via CLI

Once logged in, run:
```bash
cd /Users/jefferyerhunse/GitRepos/wedding-platform
vercel
```

Follow the prompts:
- Link to existing project or create new? → Create new
- Project name? → wedding-platform (or your choice)
- Directory? → Press Enter (current directory)
- Want to override settings? → N (no)

Then add environment variables:
```bash
# Add Google Drive variables
vercel env add GOOGLE_DRIVE_FOLDER_ID production
# Paste: 1jxvGRgOjRrfcszuSPWWQMbj2_AWCQ2LM

vercel env add GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 production
# Paste the base64 key from /tmp/service-account-base64.txt
```

Finally, deploy to production:
```bash
vercel --prod
```

## Step 4: Update NEXTAUTH_URL

After first deployment, you'll get a URL like:
```
https://wedding-platform-xxxx.vercel.app
```

Go to your Vercel project settings → Environment Variables → Update `NEXTAUTH_URL` to match your production URL.

Then redeploy:
```bash
vercel --prod
```

## Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Go to `/gallery`
3. Test uploading a photo
4. Verify it appears in your Google Drive folder

## Step 6: Custom Domain (Optional)

In Vercel dashboard:
1. Go to your project → Settings → Domains
2. Add your custom domain
3. Follow DNS instructions
4. Update `NEXTAUTH_URL` to your custom domain

## Troubleshooting

**If gallery shows "Gallery not configured":**
- Verify `GOOGLE_DRIVE_FOLDER_ID` is set correctly
- Verify `GOOGLE_SERVICE_ACCOUNT_KEY_BASE64` is set correctly
- Check Vercel deployment logs for errors

**If you see "Permission denied" errors:**
- Make sure your Google Drive folder is shared with:
  `wedding-gallery-uploader@wedding-gallery-488717.iam.gserviceaccount.com`
- Ensure the service account has Editor permissions

**To view deployment logs:**
```bash
vercel logs
```

## Quick Deploy Checklist

- [ ] Run `vercel login`
- [ ] Push latest code to Git (if using GitHub import)
- [ ] Add environment variables to Vercel
- [ ] Deploy with `vercel --prod` or via dashboard
- [ ] Test `/gallery` page
- [ ] Test photo upload
- [ ] Verify files appear in Google Drive
- [ ] Generate QR code at `/admin/qr-code`
- [ ] Test QR code on mobile device

## Environment Variables Summary

Copy these into Vercel (Settings → Environment Variables):

```
GOOGLE_DRIVE_FOLDER_ID=1jxvGRgOjRrfcszuSPWWQMbj2_AWCQ2LM
GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=<from /tmp/service-account-base64.txt>
DATABASE_URL=<your_existing_value>
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=<your_existing_value>
```

---

**You're ready to deploy!** 🚀
