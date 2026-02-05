# Custom Domain Setup Guide: jeffandsasha.com

This guide will help you configure your custom domain `jeffandsasha.com` for your wedding platform.

## 📋 Overview

You have several deployment options for your custom domain:

1. **Vercel** (Recommended for fastest setup) - 10 minutes
2. **Netlify** (Also quick) - 10 minutes  
3. **AWS CloudFront + App Runner** (Best for scale) - 30-45 minutes

## 🚀 Option 1: Vercel (Recommended - Fastest Setup)

Vercel is built by the creators of Next.js and offers the simplest domain setup.

### Step 1: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy your project
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - What's your project's name? wedding-platform
# - In which directory is your code located? ./
# - Want to override the settings? No
```

### Step 2: Add Custom Domain in Vercel

1. Go to your project dashboard: https://vercel.com/dashboard
2. Click on your `wedding-platform` project
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `jeffandsasha.com`
6. Also add: `www.jeffandsasha.com`

### Step 3: Configure DNS at Your Domain Provider (IONOS/1&1)

**IMPORTANT: You must deactivate Domain Guard first!**

1. Log into your IONOS/1&1 account
2. Go to your domain `jeffandsasha.com`
3. **Deactivate Domain Guard** (as mentioned in your message)
4. Go to DNS Settings
5. Add these DNS records:

#### For Root Domain (jeffandsasha.com):
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

#### For WWW Subdomain:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### Step 4: Verify Domain

1. Back in Vercel dashboard → Domains
2. Click **Verify** next to your domain
3. Wait 5-10 minutes for DNS propagation
4. Vercel will automatically provision SSL certificate

### Step 5: Update Environment Variables

```bash
# In Vercel dashboard → Settings → Environment Variables
NEXTAUTH_URL=https://jeffandsasha.com
DATABASE_URL=<your-existing-database-url>
NEXTAUTH_SECRET=<your-existing-secret>
RESEND_API_KEY=<your-existing-resend-key>
EMAIL_FROM=<your-email>
EMAIL_PROVIDER=resend
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-maps-key>
```

### Step 6: Redeploy

```bash
vercel --prod
```

**Done! Your site will be live at https://jeffandsasha.com in 5-10 minutes!**

---

## 🌐 Option 2: Netlify (Also Quick)

### Step 1: Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize and deploy
netlify init

# Follow the prompts:
# - Create & configure a new site? Yes
# - Team? (select your team)
# - Site name? jeffandsasha-wedding
# - Build command? npm run build
# - Directory to deploy? .next
# - Link this directory to the site? Yes
```

### Step 2: Add Custom Domain

```bash
# Add domain via CLI
netlify domains:add jeffandsasha.com

# Or via web:
# 1. Go to https://app.netlify.com
# 2. Select your site
# 3. Domain settings → Add custom domain
# 4. Enter: jeffandsasha.com
```

### Step 3: Configure DNS (IONOS/1&1)

**IMPORTANT: Deactivate Domain Guard first!**

#### Option A: Use Netlify DNS (Recommended)
1. In Netlify, go to Domain settings
2. Click "Set up Netlify DNS"
3. Replace your nameservers at IONOS with Netlify's nameservers:
```
dns1.p01.nsone.net
dns2.p01.nsone.net
dns3.p01.nsone.net
dns4.p01.nsone.net
```

#### Option B: Keep IONOS DNS
Add these records at IONOS:
```
Type: A
Name: @
Value: 75.2.60.5
TTL: 3600

Type: CNAME
Name: www
Value: <your-site-name>.netlify.app
TTL: 3600
```

### Step 4: Enable HTTPS

1. In Netlify → Domain settings
2. Click "Verify DNS configuration"
3. Click "Provision certificate" (automatic)
4. Wait 5-10 minutes for SSL

### Step 5: Update Environment Variables

In Netlify dashboard → Site settings → Environment variables:
```
NEXTAUTH_URL=https://jeffandsasha.com
DATABASE_URL=<your-database-url>
NEXTAUTH_SECRET=<your-secret>
RESEND_API_KEY=<your-resend-key>
EMAIL_FROM=<your-email>
EMAIL_PROVIDER=resend
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-maps-key>
```

### Step 6: Deploy

```bash
netlify deploy --prod
```

**Done! Visit https://jeffandsasha.com**

---

## ☁️ Option 3: AWS CloudFront + App Runner (Best Performance)

This option provides the best global performance but takes longer to set up.

### Prerequisites

```bash
# Install AWS CLI if not already installed
brew install awscli

# Configure AWS
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1
# Default output format: json
```

### Step 1: Deploy to AWS App Runner

```bash
# Build and push to ECR
./scripts/push-to-ecr.sh

# This will:
# 1. Build your Docker container
# 2. Push to AWS ECR
# 3. Create App Runner service
# 4. Give you an App Runner URL (e.g., xxx.us-east-1.awsapprunner.com)
```

### Step 2: Create CloudFront Distribution

```bash
# Set your App Runner URL
export APP_RUNNER_URL="your-url.awsapprunner.com"

# Setup CloudFront
./scripts/setup-cloudfront.sh

# This creates:
# - CloudFront distribution
# - SSL certificate (via ACM)
# - Origin pointing to App Runner
```

### Step 3: Request SSL Certificate

```bash
# Request certificate for your domain
aws acm request-certificate \
  --domain-name jeffandsasha.com \
  --subject-alternative-names www.jeffandsasha.com \
  --validation-method DNS \
  --region us-east-1

# Note the CertificateArn from output
```

### Step 4: Validate Certificate

1. AWS will send you DNS validation records
2. Add these to IONOS DNS settings:

```bash
# Get validation records
aws acm describe-certificate \
  --certificate-arn <your-certificate-arn> \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions[*].[ResourceRecord.Name,ResourceRecord.Value]' \
  --output table
```

3. Add CNAME records at IONOS:
```
Type: CNAME
Name: <validation-name-from-aws>
Value: <validation-value-from-aws>
TTL: 3600
```

### Step 5: Update CloudFront Distribution

```bash
# Get your CloudFront distribution ID
aws cloudfront list-distributions \
  --query 'DistributionList.Items[0].Id' \
  --output text

# Update distribution with custom domain and certificate
# (Manual via AWS Console is easier)
```

1. Go to AWS Console → CloudFront
2. Click your distribution
3. Click "Edit"
4. Under "Alternate Domain Names (CNAMEs)", add:
   - `jeffandsasha.com`
   - `www.jeffandsasha.com`
5. Under "Custom SSL Certificate", select your certificate
6. Save changes

### Step 6: Update DNS at IONOS

Add these records:

```
Type: A (Alias if available) or CNAME
Name: @
Value: <your-distribution>.cloudfront.net
TTL: 3600

Type: CNAME
Name: www
Value: <your-distribution>.cloudfront.net
TTL: 3600
```

### Step 7: Update Environment Variables

```bash
# Update in AWS App Runner
aws apprunner update-service \
  --service-arn <your-service-arn> \
  --source-configuration '...' # Add NEXTAUTH_URL=https://jeffandsasha.com
```

**Done! Your site will be live at https://jeffandsasha.com with global CDN!**

---

## 🔧 IONOS Domain Configuration Steps

### Deactivating Domain Guard

1. Log into https://my.ionos.com
2. Go to **Domains & SSL**
3. Click on `jeffandsasha.com`
4. Scroll to **Domain Guard** section
5. Click **Deactivate**
6. Confirm deactivation

### Accessing DNS Settings

After deactivating Domain Guard:

1. Go back to domain overview
2. Click on `jeffandsasha.com`
3. Click **DNS** or **Manage DNS**
4. Click **Add Record** to add new DNS entries

### Important IONOS Notes

- **DNS Propagation**: Changes can take 5 minutes to 48 hours
- **SSL Certificate**: Will be provisioned automatically by Vercel/Netlify/AWS
- **WWW vs Non-WWW**: Set up both for best user experience
- **Email**: If you want email (jeff@jeffandsasha.com), set up MX records separately

---

## 📊 Comparison: Which Option?

| Feature | Vercel | Netlify | AWS CloudFront |
|---------|--------|---------|----------------|
| **Setup Time** | 10 min | 10 min | 45 min |
| **Difficulty** | Easy | Easy | Medium |
| **Cost/Month** | $0-20 | $0-19 | $50-130 |
| **Performance** | Excellent | Good | Best |
| **SSL** | Auto | Auto | Manual setup |
| **Best For** | Quick launch | Quick launch | Production scale |

### Recommendation:

- **Getting married soon?** → Use **Vercel** (fastest)
- **Want free tier?** → Use **Netlify**
- **Need best performance?** → Use **AWS CloudFront**

---

## ✅ Post-Setup Checklist

After your domain is configured:

- [ ] Test `https://jeffandsasha.com` (loads correctly)
- [ ] Test `https://www.jeffandsasha.com` (redirects to non-www or works)
- [ ] Verify SSL certificate (green padlock in browser)
- [ ] Test RSVP functionality
- [ ] Test admin dashboard login
- [ ] Update any hardcoded URLs in your code
- [ ] Update social media links
- [ ] Update printed materials (if any)
- [ ] Test on mobile devices
- [ ] Test email sending (RSVP confirmations)
- [ ] Share with a few friends to test

---

## 🐛 Troubleshooting

### Domain Not Loading

1. **Check DNS propagation**: https://dnschecker.org
   - Enter: `jeffandsasha.com`
   - Should show your configured records

2. **Verify DNS records**:
   ```bash
   dig jeffandsasha.com
   dig www.jeffandsasha.com
   ```

3. **Clear browser cache**: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)

### SSL Certificate Not Working

1. **Vercel/Netlify**: Usually automatic, wait 10-15 minutes
2. **AWS**: Verify DNS validation records are correct
3. **Check certificate status**:
   ```bash
   # For AWS
   aws acm describe-certificate --certificate-arn <arn> --region us-east-1
   ```

### Redirect Loop

- Check `NEXTAUTH_URL` in environment variables
- Should be: `https://jeffandsasha.com` (not `http://`)

### 502/503 Errors

- Backend service might be down
- Check deployment logs
- Verify environment variables are set correctly

---

## 📞 Need Help?

### Quick Commands

```bash
# Test DNS
nslookup jeffandsasha.com

# Test SSL
curl -I https://jeffandsasha.com

# Check headers
curl -v https://jeffandsasha.com
```

### Useful Links

- **Vercel Docs**: https://vercel.com/docs/concepts/projects/domains
- **Netlify Docs**: https://docs.netlify.com/domains-https/custom-domains/
- **AWS CloudFront**: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/
- **IONOS Help**: https://www.ionos.com/help/

---

## 🎉 Success!

Once your domain is live, share it with your guests!

**Your wedding website**: https://jeffandsasha.com

Congratulations! 💒✨
