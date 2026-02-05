# Vercel Deployment Guide for jeffandsasha.com

## Quick Start - Run the Automated Script

I've created an automated deployment script for you. Just run:

```bash
./scripts/deploy-to-vercel.sh
```

This script will:
1. Check if Vercel CLI is installed
2. Authenticate you with Vercel (opens browser)
3. Deploy your wedding platform
4. Configure environment variables
5. Add your custom domain (jeffandsasha.com)
6. Show you the DNS records to configure

## Manual Deployment (If Script Doesn't Work)

### Step 1: Authenticate with Vercel

```bash
vercel login
```

This will open your browser to authenticate.

### Step 2: Deploy the Project

```bash
vercel --prod
```

Answer the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No**
- What's your project's name? **wedding-platform**
- In which directory is your code located? **./**
- Want to modify settings? **No**

### Step 3: Add Environment Variables

```bash
# Add environment variables one by one
vercel env add DATABASE_URL
# Paste: postgresql://neondb_owner:npg_C4XrWdVZGF9v@ep-jolly-sea-ad7e77n2-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

vercel env add NEXTAUTH_SECRET
# Paste: wedding-platform-secret-key-change-in-production-12345

vercel env add NEXTAUTH_URL
# Paste: https://jeffandsasha.com

vercel env add RESEND_API_KEY
# Paste: re_jeRbAhNE_KdGiYPsKrnvPtwhRwcTRsxFy

vercel env add EMAIL_FROM
# Paste: onboarding@resend.dev

vercel env add EMAIL_PROVIDER
# Paste: resend

vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
# Paste: AIzaSyDeheppcr-SwDtFoKw-f5uNEC78thuI0GQ

# Select: Production, Preview, Development for each
```

### Step 4: Add Custom Domain

```bash
vercel domains add jeffandsasha.com
vercel domains add www.jeffandsasha.com
```

### Step 5: Configure DNS at IONOS

**CRITICAL: Deactivate Domain Guard First!**

1. Go to https://my.ionos.com
2. Navigate to **Domains & SSL**
3. Click on `jeffandsasha.com`
4. Scroll to **Domain Guard**
5. Click **Deactivate** (this is required!)

**Then add these DNS records:**

#### Record 1: Root Domain
```
Type: A
Name: @ (or leave blank)
Value: 76.76.21.21
TTL: 3600 (or Auto)
```

#### Record 2: WWW Subdomain
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

### Step 6: Verify Domain

Wait 5-10 minutes, then run:

```bash
vercel domains verify jeffandsasha.com
```

Or check in browser: https://jeffandsasha.com

## Vercel Dashboard Configuration

Alternatively, you can configure everything in the Vercel dashboard:

1. Go to https://vercel.com/dashboard
2. Click on your `wedding-platform` project
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `jeffandsasha.com`
6. Also add: `www.jeffandsasha.com`
7. Follow DNS configuration instructions

## Environment Variables via Dashboard

1. Go to **Settings** → **Environment Variables**
2. Add each variable:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` = `https://jeffandsasha.com`
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - `EMAIL_PROVIDER` = `resend`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. Select **Production**, **Preview**, and **Development** for each
4. Save

## Verify Deployment

### Check DNS Propagation
```bash
# Check if DNS is configured correctly
nslookup jeffandsasha.com

# Or use online tool
open https://dnschecker.org/#A/jeffandsasha.com
```

### Test Site
```bash
# Test if site is responding
curl -I https://jeffandsasha.com

# Or open in browser
open https://jeffandsasha.com
```

### View Logs
```bash
vercel logs --follow
```

## Troubleshooting

### Error: Domain Already Added to Another Project

If you get an error that the domain is already in use:

```bash
# Remove domain from old project
vercel domains rm jeffandsasha.com

# Add to new project
vercel domains add jeffandsasha.com
```

### Error: DNS Verification Failed

1. Double-check DNS records at IONOS
2. Wait longer (DNS can take up to 48 hours)
3. Try flushing DNS cache:
   ```bash
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   ```

### Error: Build Failed

Check build logs:
```bash
vercel logs
```

Common fixes:
- Make sure all dependencies are in `package.json`
- Check that `npm run build` works locally
- Verify environment variables are set

### SSL Certificate Not Provisioning

- Wait 10-15 minutes after DNS configuration
- Verify DNS records are correct
- Check domain verification status:
  ```bash
  vercel domains ls
  ```

## Updating Your Site

After initial deployment, updates are simple:

```bash
# Make your changes, then:
git add .
git commit -m "Update site"
git push

# Or deploy directly:
vercel --prod
```

## Useful Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployments
vercel ls

# View logs
vercel logs

# View domains
vercel domains ls

# View environment variables
vercel env ls

# Pull environment variables locally
vercel env pull

# Remove deployment
vercel rm wedding-platform

# Get deployment URL
vercel inspect
```

## Next Steps After Deployment

1. ✅ Visit https://jeffandsasha.com
2. ✅ Test RSVP functionality
3. ✅ Test admin login at https://jeffandsasha.com/admin
4. ✅ Verify email sending works
5. ✅ Test on mobile devices
6. ✅ Share with friends to beta test
7. ✅ Update social media with new domain
8. ✅ Print QR codes (if using)

## Cost Estimate

- **Hobby Plan (Free)**: Good for testing and small weddings
  - 100GB bandwidth
  - Unlimited deployments
  - Custom domains
  - SSL certificates

- **Pro Plan ($20/month)**: Better for production
  - 1TB bandwidth
  - Advanced analytics
  - Priority support
  - Password protection

For most weddings, the **free Hobby plan is sufficient**!

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Project Issues: Check deployment logs

---

**Your wedding website will be live at https://jeffandsasha.com!** 🎉💒
