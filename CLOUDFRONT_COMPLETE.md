# CloudFront Deployment Complete Guide

## 📋 Overview

Your Wedding Platform is now ready to be deployed using Amazon CloudFront as a CDN (Content Delivery Network). This provides:

- ⚡ **Global Performance**: Edge locations worldwide for fast content delivery
- 🔒 **Security**: HTTPS encryption, DDoS protection via AWS Shield
- 💰 **Cost-Effective**: Pay only for data transfer and requests
- 🎯 **Scalability**: Automatic scaling to handle any traffic level
- 📊 **Analytics**: Built-in metrics and monitoring

## 🗂️ Files Created

### Documentation
- **`CLOUDFRONT_DEPLOYMENT.md`** - Comprehensive deployment guide (all options)
- **`CLOUDFRONT_QUICKSTART.md`** - Quick start guide (get live in 5 minutes)
- **`.env.cloudfront.template`** - Environment configuration template

### Scripts
- **`scripts/setup-cloudfront.sh`** - One-time setup script
- **`scripts/deploy-cloudfront.sh`** - Deployment script (run after code changes)
- **`scripts/test-cloudfront.sh`** - Health check and testing script

All scripts are executable and ready to use!

## 🚀 Quick Start (3 Steps)

### Step 1: Prerequisites

Ensure you have:
- ✅ AWS CLI configured (`aws configure`)
- ✅ Docker installed and running
- ✅ App Runner service deployed (see `DOCKER_ECR_DEPLOYMENT.md`)
- ✅ Node.js 20+ and npm installed

### Step 2: Run Setup

```bash
# Set your App Runner URL (find in App Runner console)
export APP_RUNNER_URL="your-app-abc123.us-east-1.awsapprunner.com"

# Run the setup script
./scripts/setup-cloudfront.sh
```

This creates:
- S3 bucket for static assets
- CloudFront Origin Access Identity (OAI)
- CloudFront distribution
- Proper bucket policies

**⏱️ Wait Time:** 15-20 minutes for global deployment.

### Step 3: Deploy Your Site

```bash
# Deploy your code
./scripts/deploy-cloudfront.sh
```

This does:
- Builds your Next.js app
- Uploads static assets to S3
- Deploys container to App Runner
- Invalidates CloudFront cache
- Runs health checks

**🌐 Your site is now live!**

## 📂 Architecture

### Recommended: CloudFront + App Runner + S3

```
┌─────────┐
│  User   │
└────┬────┘
     │
     v
┌────────────────┐
│   CloudFront   │ (Global CDN)
│   Edge Cache   │
└───┬────────┬───┘
    │        │
    │        v
    │    ┌───────┐
    │    │  S3   │ (Static Assets)
    │    │ Bucket│ • /_next/static/*
    │    └───────┘ • /public/*
    │
    v
┌────────────┐
│ App Runner │ (Dynamic Routes)
│  Next.js   │ • API routes
└─────┬──────┘ • SSR pages
      │        • Authentication
      v
┌────────────┐
│    RDS     │
│ PostgreSQL │
└────────────┘
```

### How It Works

1. **User requests page** → CloudFront receives request
2. **CloudFront checks cache** → Returns cached content if available
3. **Cache miss for static assets** → Fetches from S3, caches for 1 year
4. **Cache miss for dynamic content** → Forwards to App Runner
5. **App Runner** → Processes request, queries database, returns response
6. **CloudFront** → Caches response (if appropriate), returns to user

### Benefits

- **Static assets** served from edge locations (images, CSS, JS)
- **Dynamic content** served from App Runner with optional caching
- **99.99% availability** across all services
- **Automatic scaling** handles traffic spikes

## 🔧 Configuration

### Environment Variables

After setup, update your `.env`:

```bash
# CloudFront (auto-saved by setup script)
CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC
CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net

# S3
S3_BUCKET=wedding-platform-static
AWS_REGION=us-east-1

# App Runner
APP_RUNNER_SERVICE_ARN=arn:aws:apprunner:us-east-1:123456789012:service/wedding-platform/abc
APP_RUNNER_URL=abc123.us-east-1.awsapprunner.com

# Application URLs (update with CloudFront domain)
NEXTAUTH_URL=https://d1234567890.cloudfront.net
NEXT_PUBLIC_CDN_URL=https://d1234567890.cloudfront.net
```

The setup script automatically saves your CloudFront details to:
- `.cloudfront-distribution-id`
- `.cloudfront-domain`
- `.cloudfront-oai-id`

### Cache Strategy

The configuration uses optimal caching:

| Path Pattern | Cache TTL | Notes |
|--------------|-----------|-------|
| `_next/static/*` | 1 year | Immutable Next.js bundles |
| `public/*` | 30 days | Images, fonts, static files |
| `/api/*` | No cache | Dynamic API routes |
| `/` (pages) | No cache* | Dynamic pages with SSR |

*Pages can be cached with appropriate `Cache-Control` headers.

## 🌐 Custom Domain Setup

### 1. Request SSL Certificate

**⚠️ Important:** Must be in `us-east-1` region!

```bash
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names "*.yourdomain.com" \
  --validation-method DNS \
  --region us-east-1
```

### 2. Validate Certificate

1. Go to AWS Certificate Manager console
2. Click "Create records in Route 53" (easiest) or manually add DNS records
3. Wait 5-10 minutes for validation

### 3. Update CloudFront Distribution

```bash
# Get your distribution ID
DISTRIBUTION_ID=$(cat .cloudfront-distribution-id)

# Get current config
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID > dist-config.json

# Edit dist-config.json to add certificate ARN and domain
# Then update:
ETAG=$(jq -r '.ETag' dist-config.json)
aws cloudfront update-distribution \
  --id $DISTRIBUTION_ID \
  --if-match $ETAG \
  --distribution-config file://dist-config.json
```

### 4. Update DNS

```bash
# Get CloudFront domain
CLOUDFRONT_DOMAIN=$(cat .cloudfront-domain)

# Create/update A record in Route 53
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "yourdomain.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "'"$CLOUDFRONT_DOMAIN"'",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

### 5. Update Environment Variables

```bash
# Update .env
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_CDN_URL=https://yourdomain.com

# Redeploy
./scripts/deploy-cloudfront.sh
```

## 🔍 Testing & Monitoring

### Health Check

Run the automated health check:

```bash
./scripts/test-cloudfront.sh
```

This tests:
- Main routes (homepage, wedding page)
- API endpoints
- Static assets
- SSL certificate
- Response times
- Cache configuration
- CloudFront metrics

### Manual Testing

```bash
# Get your CloudFront URL
CLOUDFRONT_DOMAIN=$(cat .cloudfront-domain)

# Test homepage
curl -I https://$CLOUDFRONT_DOMAIN

# Test wedding page
curl -I https://$CLOUDFRONT_DOMAIN/jeffandsasha

# Test API
curl https://$CLOUDFRONT_DOMAIN/api/health

# Check cache headers
curl -I https://$CLOUDFRONT_DOMAIN/_next/static/chunks/main.js
```

### Monitoring

```bash
# Get distribution status
aws cloudfront get-distribution --id $(cat .cloudfront-distribution-id)

# Check cache hit rate (aim for >80%)
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name CacheHitRate \
  --dimensions Name=DistributionId,Value=$(cat .cloudfront-distribution-id) \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Average

# Check error rates
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name 4xxErrorRate \
  --dimensions Name=DistributionId,Value=$(cat .cloudfront-distribution-id) \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

## 🔄 Deployment Workflow

### Regular Updates

After making code changes:

```bash
# Option 1: Full deployment (recommended)
./scripts/deploy-cloudfront.sh

# Option 2: Just update static assets
npm run build
aws s3 sync .next/static s3://wedding-platform-static/_next/static --delete
aws cloudfront create-invalidation --distribution-id $(cat .cloudfront-distribution-id) --paths "/*"

# Option 3: Just update container
./scripts/push-to-ecr.sh
aws apprunner start-deployment --service-arn $APP_RUNNER_SERVICE_ARN
```

### CI/CD with GitHub Actions

Create `.github/workflows/deploy-cloudfront.yml`:

```yaml
name: Deploy to CloudFront

on:
  push:
    branches: [main]

env:
  AWS_REGION: us-east-1

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Deploy to CloudFront
        env:
          CLOUDFRONT_DISTRIBUTION_ID: ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }}
          APP_RUNNER_SERVICE_ARN: ${{ secrets.APP_RUNNER_SERVICE_ARN }}
        run: ./scripts/deploy-cloudfront.sh
```

Add these secrets to your GitHub repository:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `CLOUDFRONT_DISTRIBUTION_ID`
- `APP_RUNNER_SERVICE_ARN`

## 🐛 Troubleshooting

### 502 Bad Gateway

**Cause:** App Runner origin is down or unhealthy

**Fix:**
```bash
# Check App Runner status
aws apprunner describe-service --service-arn $APP_RUNNER_SERVICE_ARN

# Check logs
aws logs tail /aws/apprunner/wedding-platform/service --follow

# Restart deployment
aws apprunner start-deployment --service-arn $APP_RUNNER_SERVICE_ARN
```

### 403 Forbidden on Static Assets

**Cause:** S3 bucket policy not configured

**Fix:**
```bash
# Rerun setup script
./scripts/setup-cloudfront.sh

# Or manually update bucket policy
aws s3api get-bucket-policy --bucket wedding-platform-static
```

### Cache Not Updating

**Fix:**
```bash
# Invalidate all cached content
aws cloudfront create-invalidation \
  --distribution-id $(cat .cloudfront-distribution-id) \
  --paths "/*"

# Check invalidation status
aws cloudfront list-invalidations \
  --distribution-id $(cat .cloudfront-distribution-id)
```

### Slow Performance

**Check:**
- Cache hit ratio (should be >80%)
- Origin response time
- Geographic distribution of users

**Fix:**
```bash
# Check cache metrics
./scripts/test-cloudfront.sh

# Consider enabling more edge locations
# Update PRICE_CLASS in setup script:
export PRICE_CLASS=PriceClass_200  # or PriceClass_All
```

## 💰 Cost Optimization

### Expected Costs

For a typical wedding website (100-500 guests):

| Service | Monthly Cost | Notes |
|---------|--------------|-------|
| CloudFront | $5-15 | Data transfer + requests |
| App Runner | $30-60 | 1 vCPU, 2GB RAM |
| S3 | $1-3 | Storage + requests |
| RDS | $15-50 | db.t3.micro or similar |
| **Total** | **$51-128** | Varies with traffic |

### Optimization Tips

1. **Use versioned URLs** instead of cache invalidations (first 1,000 paths/month free)
2. **Enable compression** (already enabled in config)
3. **Use Price Class 100** if users are primarily in US/Canada/Europe
4. **Optimize images** before uploading
5. **Monitor cache hit ratio** (aim for >80%)

### Cost Monitoring

```bash
# Get current month costs
aws ce get-cost-and-usage \
  --time-period Start=$(date -u +%Y-%m-01),End=$(date -u +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=SERVICE

# Set up budget alerts
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://budget.json
```

## 📚 Additional Resources

### Documentation
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [App Runner Documentation](https://docs.aws.amazon.com/apprunner/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [AWS CLI CloudFront Commands](https://docs.aws.amazon.com/cli/latest/reference/cloudfront/)

### Internal Guides
- `CLOUDFRONT_DEPLOYMENT.md` - Comprehensive guide with all options
- `CLOUDFRONT_QUICKSTART.md` - Quick reference guide
- `DOCKER_ECR_DEPLOYMENT.md` - Container deployment guide
- `AWS_SETUP.md` - AWS services configuration

### Useful Commands

```bash
# List all distributions
aws cloudfront list-distributions

# Get distribution details
aws cloudfront get-distribution --id $(cat .cloudfront-distribution-id)

# View logs
aws logs tail /aws/apprunner/wedding-platform/service --follow

# Check S3 bucket contents
aws s3 ls s3://wedding-platform-static --recursive --human-readable

# Delete distribution (must disable first)
aws cloudfront get-distribution-config --id $(cat .cloudfront-distribution-id) > config.json
# Edit config.json, set "Enabled": false
aws cloudfront update-distribution --id $(cat .cloudfront-distribution-id) --distribution-config file://config.json
aws cloudfront delete-distribution --id $(cat .cloudfront-distribution-id)
```

## ✅ Deployment Checklist

Before going live:

- [ ] AWS CLI configured and tested
- [ ] App Runner service deployed and healthy
- [ ] Run `./scripts/setup-cloudfront.sh`
- [ ] Wait for CloudFront distribution to deploy (15-20 min)
- [ ] Run `./scripts/deploy-cloudfront.sh`
- [ ] Run `./scripts/test-cloudfront.sh`
- [ ] Verify all routes work
- [ ] Check cache hit ratio (>80%)
- [ ] Test from different geographic locations
- [ ] (Optional) Set up custom domain with SSL
- [ ] (Optional) Configure DNS
- [ ] Update environment variables
- [ ] Set up monitoring alerts
- [ ] Configure cost alerts
- [ ] Document custom configurations

## 🎉 Success!

Your Wedding Platform is now deployed on CloudFront with global edge caching!

### Next Steps

1. **Share your URL** with guests: `https://YOUR_CLOUDFRONT_DOMAIN.cloudfront.net/jeffandsasha`
2. **Monitor performance** using `./scripts/test-cloudfront.sh`
3. **Deploy updates** anytime with `./scripts/deploy-cloudfront.sh`
4. **Set up custom domain** for a professional look (optional)

### Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review CloudWatch logs
3. Run the health check script
4. Refer to the comprehensive guides in `CLOUDFRONT_DEPLOYMENT.md`

---

**Created:** 2026-01-31  
**Version:** 1.0.0  
**Last Updated:** 2026-01-31  

For questions or issues, refer to the documentation or AWS support.

**Happy Wedding Planning! 💒**
