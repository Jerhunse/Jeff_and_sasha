# CloudFront Quick Start Guide

Get your Wedding Platform site live on CloudFront in just a few steps!

## 🚀 Quick Deploy (5 Minutes)

### Prerequisites Check

```bash
# Verify AWS CLI is installed and configured
aws --version
aws sts get-caller-identity

# Verify Node.js and npm
node --version
npm --version

# Verify Docker (if using App Runner)
docker --version
```

### One-Command Setup

```bash
# Set your App Runner URL (get it from App Runner console)
export APP_RUNNER_URL="your-app-abc123.us-east-1.awsapprunner.com"

# Run setup script
./scripts/setup-cloudfront.sh
```

This script will:
1. ✅ Create S3 bucket for static assets
2. ✅ Set up CloudFront Origin Access Identity (OAI)
3. ✅ Configure S3 bucket policies
4. ✅ Create CloudFront distribution
5. ✅ Save configuration for future deployments

**⏱️ Wait Time:** 15-20 minutes for CloudFront to deploy globally.

---

## 📦 Deploy Updates

After making code changes, deploy with one command:

```bash
./scripts/deploy-cloudfront.sh
```

This script will:
1. ✅ Build your Next.js app
2. ✅ Upload static assets to S3
3. ✅ Deploy container to App Runner
4. ✅ Invalidate CloudFront cache
5. ✅ Perform health check

---

## 🔧 Configuration

### Environment Variables

Create or update `.env.production`:

```bash
# CloudFront Configuration
CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC
CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net
S3_BUCKET=wedding-platform-static

# App Runner Configuration
APP_RUNNER_SERVICE_ARN=arn:aws:apprunner:us-east-1:123456789012:service/wedding-platform/abc123
APP_RUNNER_URL=abc123.us-east-1.awsapprunner.com

# Application URLs
NEXTAUTH_URL=https://d1234567890.cloudfront.net
NEXT_PUBLIC_CDN_URL=https://d1234567890.cloudfront.net

# AWS
AWS_REGION=us-east-1
```

### Find Your Configuration Values

```bash
# Get CloudFront Distribution ID
aws cloudfront list-distributions \
  --query 'DistributionList.Items[*].[Id,Comment]' \
  --output table

# Get App Runner Service details
aws apprunner list-services \
  --query 'ServiceSummaryList[*].[ServiceName,ServiceArn,ServiceUrl]' \
  --output table

# Get S3 buckets
aws s3 ls
```

---

## 🌐 Custom Domain Setup

### Step 1: Request SSL Certificate

**⚠️ Important:** Certificate must be in `us-east-1` region for CloudFront!

```bash
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names "*.yourdomain.com" \
  --validation-method DNS \
  --region us-east-1
```

### Step 2: Validate Certificate

1. Go to AWS Certificate Manager console
2. Find your certificate
3. Click "Create records in Route 53" (if using Route 53)
4. Wait for validation (usually 5-10 minutes)

### Step 3: Update CloudFront Distribution

Get your distribution config:
```bash
DISTRIBUTION_ID=$(cat .cloudfront-distribution-id)
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID > dist-config.json
```

Edit `dist-config.json` and add your certificate and domain:

```json
{
  "ViewerCertificate": {
    "ACMCertificateArn": "arn:aws:acm:us-east-1:xxx:certificate/xxx",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  },
  "Aliases": {
    "Quantity": 1,
    "Items": ["yourdomain.com"]
  }
}
```

Update the distribution:
```bash
ETAG=$(cat dist-config.json | jq -r '.ETag')
aws cloudfront update-distribution \
  --id $DISTRIBUTION_ID \
  --if-match $ETAG \
  --distribution-config file://dist-config.json
```

### Step 4: Update DNS

Create A record in Route 53:

```bash
# Get your hosted zone ID
aws route53 list-hosted-zones

# Get CloudFront domain
CLOUDFRONT_DOMAIN=$(cat .cloudfront-domain)

# Create DNS record
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

### Step 5: Update Environment Variables

```bash
# Update your .env
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_CDN_URL=https://yourdomain.com
```

Redeploy:
```bash
./scripts/deploy-cloudfront.sh
```

---

## 🔍 Monitoring & Troubleshooting

### Check Distribution Status

```bash
DISTRIBUTION_ID=$(cat .cloudfront-distribution-id)

# Get distribution status
aws cloudfront get-distribution \
  --id $DISTRIBUTION_ID \
  --query 'Distribution.Status' \
  --output text

# Get full distribution details
aws cloudfront get-distribution --id $DISTRIBUTION_ID
```

### View Logs

```bash
# CloudFront logs (if enabled)
aws s3 ls s3://wedding-platform-logs/cloudfront/

# App Runner logs
aws logs tail /aws/apprunner/wedding-platform/service --follow
```

### Test Your Site

```bash
# Get your CloudFront URL
CLOUDFRONT_DOMAIN=$(cat .cloudfront-domain)

# Test basic connectivity
curl -I https://$CLOUDFRONT_DOMAIN

# Test specific routes
curl https://$CLOUDFRONT_DOMAIN/api/health
curl https://$CLOUDFRONT_DOMAIN/jeffandsasha

# Check cache headers
curl -I https://$CLOUDFRONT_DOMAIN/_next/static/chunks/main.js
```

### Common Issues

#### 502 Bad Gateway

**Cause:** App Runner origin is down or unhealthy

**Fix:**
```bash
# Check App Runner health
aws apprunner describe-service \
  --service-arn $APP_RUNNER_SERVICE_ARN \
  --query 'Service.HealthCheckConfiguration'

# Check App Runner logs
aws apprunner list-operations \
  --service-arn $APP_RUNNER_SERVICE_ARN
```

#### 403 Forbidden on Static Assets

**Cause:** S3 bucket policy not configured correctly

**Fix:**
```bash
# Check bucket policy
aws s3api get-bucket-policy --bucket wedding-platform-static

# Rerun setup script
./scripts/setup-cloudfront.sh
```

#### Cache Not Updating

**Fix:**
```bash
# Invalidate cache
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

# Check invalidation status
aws cloudfront list-invalidations --distribution-id $DISTRIBUTION_ID
```

---

## 📊 Performance Optimization

### Cache Hit Ratio

Monitor your cache effectiveness:

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name CacheHitRate \
  --dimensions Name=DistributionId,Value=$DISTRIBUTION_ID \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Average
```

**Target:** >80% cache hit ratio

### Data Transfer

Check your bandwidth usage:

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name BytesDownloaded \
  --dimensions Name=DistributionId,Value=$DISTRIBUTION_ID \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum
```

### Error Rate

Monitor 4xx and 5xx errors:

```bash
# 4xx errors (client errors)
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name 4xxErrorRate \
  --dimensions Name=DistributionId,Value=$DISTRIBUTION_ID \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average

# 5xx errors (server errors)
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name 5xxErrorRate \
  --dimensions Name=DistributionId,Value=$DISTRIBUTION_ID \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

---

## 💰 Cost Tracking

### Estimate Monthly Costs

```bash
# Get current month costs for CloudFront
aws ce get-cost-and-usage \
  --time-period Start=$(date -u +%Y-%m-01),End=$(date -u +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --filter file://cloudfront-cost-filter.json
```

Create `cloudfront-cost-filter.json`:

```json
{
  "Dimensions": {
    "Key": "SERVICE",
    "Values": ["Amazon CloudFront"]
  }
}
```

### Set Up Cost Alerts

```bash
# Create budget alert
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

---

## 🚀 CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy-cloudfront.yml`:

```yaml
name: Deploy to CloudFront

on:
  push:
    branches: [main]

env:
  AWS_REGION: us-east-1
  S3_BUCKET: wedding-platform-static
  CLOUDFRONT_DISTRIBUTION_ID: ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }}
  APP_RUNNER_SERVICE_ARN: ${{ secrets.APP_RUNNER_SERVICE_ARN }}

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
      
      - name: Deploy to CloudFront
        run: ./scripts/deploy-cloudfront.sh
```

### Required Secrets

Add these to your GitHub repository secrets:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `CLOUDFRONT_DISTRIBUTION_ID`
- `APP_RUNNER_SERVICE_ARN`

---

## 📋 Checklist

Before going live:

- [ ] CloudFront distribution created and deployed
- [ ] S3 bucket for static assets configured
- [ ] App Runner service running and healthy
- [ ] SSL certificate requested and validated (if custom domain)
- [ ] Custom domain configured in CloudFront (if applicable)
- [ ] DNS records updated (if custom domain)
- [ ] Environment variables updated with CloudFront URLs
- [ ] Test all routes and functionality
- [ ] Check cache hit ratio (aim for >80%)
- [ ] Monitor CloudWatch metrics
- [ ] Set up cost alerts
- [ ] Document any custom configurations

---

## 🆘 Support

### Useful Commands

```bash
# List all distributions
aws cloudfront list-distributions --output table

# Get distribution details
aws cloudfront get-distribution --id $DISTRIBUTION_ID

# Create cache invalidation
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"

# Check invalidation status
aws cloudfront get-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --id INVALIDATION_ID

# Delete distribution (must disable first)
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID > config.json
# Edit config.json, set "Enabled": false
aws cloudfront update-distribution \
  --id $DISTRIBUTION_ID \
  --if-match ETAG \
  --distribution-config file://config.json
aws cloudfront delete-distribution --id $DISTRIBUTION_ID --if-match ETAG
```

### Documentation Links

- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [App Runner Documentation](https://docs.aws.amazon.com/apprunner/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [AWS CLI CloudFront Commands](https://docs.aws.amazon.com/cli/latest/reference/cloudfront/)

---

**Created:** 2026-01-31  
**Version:** 1.0.0  
**Last Updated:** 2026-01-31

For detailed documentation, see [CLOUDFRONT_DEPLOYMENT.md](./CLOUDFRONT_DEPLOYMENT.md)
