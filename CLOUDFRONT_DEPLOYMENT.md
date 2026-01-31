# CloudFront Deployment Guide

Complete guide for deploying the Wedding Platform using Amazon CloudFront as a CDN.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Option 1: CloudFront + App Runner (Recommended)](#option-1-cloudfront--app-runner-recommended)
4. [Option 2: CloudFront + ALB + ECS](#option-2-cloudfront--alb--ecs)
5. [Option 3: CloudFront + S3 (Static Export Only)](#option-3-cloudfront--s3-static-export-only)
6. [Configuration](#configuration)
7. [Custom Domain Setup](#custom-domain-setup)
8. [Monitoring & Optimization](#monitoring--optimization)

---

## 🏗️ Architecture Overview

### Option 1: CloudFront + App Runner (Recommended)
```
User → CloudFront (CDN) → App Runner (Next.js SSR) → RDS (Database)
                ↓
              S3 (Static Assets)
```

**Pros:**
- Fastest setup
- Automatic HTTPS
- Built-in load balancing
- Fully managed
- Global edge caching

**Cons:**
- Less control over infrastructure
- Limited VPC integration

### Option 2: CloudFront + ALB + ECS
```
User → CloudFront → ALB → ECS Fargate → RDS
                     ↓
                   S3 (Static Assets)
```

**Pros:**
- Full control over infrastructure
- VPC integration
- Advanced routing
- Better for complex architectures

**Cons:**
- More complex setup
- Higher cost
- More management overhead

---

## 📦 Prerequisites

Before starting, ensure you have:

- AWS CLI configured (`aws configure`)
- Docker installed (for container-based deployments)
- Domain name (optional, but recommended)
- SSL certificate in AWS Certificate Manager (if using custom domain)
- Next.js app built and tested locally

### Required AWS Services

- **CloudFront**: CDN and edge caching
- **S3**: Static asset storage
- **App Runner or ECS**: Application hosting
- **RDS or Supabase**: Database
- **Route 53**: DNS management (if using custom domain)
- **ACM**: SSL/TLS certificates

---

## 🚀 Option 1: CloudFront + App Runner (Recommended)

This is the fastest and most cost-effective option for full Next.js functionality.

### Step 1: Deploy to App Runner

First, deploy your application to App Runner following the [Docker ECR Deployment Guide](./DOCKER_ECR_DEPLOYMENT.md).

Quick deploy script:
```bash
./scripts/push-to-ecr.sh
```

### Step 2: Create S3 Bucket for Static Assets

```bash
# Create bucket
aws s3 mb s3://wedding-platform-static --region us-east-1

# Enable versioning (recommended)
aws s3api put-bucket-versioning \
  --bucket wedding-platform-static \
  --versioning-configuration Status=Enabled

# Block public access (CloudFront will access via OAI)
aws s3api put-public-access-block \
  --bucket wedding-platform-static \
  --public-access-block-configuration \
    BlockPublicAcls=true,\
    IgnorePublicAcls=true,\
    BlockPublicPolicy=false,\
    RestrictPublicBuckets=false
```

### Step 3: Upload Static Assets to S3

```bash
# Build the application
npm run build

# Upload static files
aws s3 sync .next/static s3://wedding-platform-static/_next/static --cache-control "public, max-age=31536000, immutable"
aws s3 sync public s3://wedding-platform-static/public --cache-control "public, max-age=86400"
```

### Step 4: Create CloudFront Origin Access Identity (OAI)

```bash
aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config \
    CallerReference="wedding-platform-$(date +%s)",Comment="OAI for wedding platform static assets"
```

Save the OAI ID from the output.

### Step 5: Update S3 Bucket Policy

Create `s3-bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontOAI",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity YOUR_OAI_ID"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::wedding-platform-static/*"
    }
  ]
}
```

Apply the policy:
```bash
aws s3api put-bucket-policy \
  --bucket wedding-platform-static \
  --policy file://s3-bucket-policy.json
```

### Step 6: Create CloudFront Distribution

Create `cloudfront-config.json`:

```json
{
  "CallerReference": "wedding-platform-2026",
  "Comment": "Wedding Platform CDN Distribution",
  "Enabled": true,
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 2,
    "Items": [
      {
        "Id": "app-runner-origin",
        "DomainName": "YOUR_APP_RUNNER_URL.us-east-1.awsapprunner.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "https-only",
          "OriginSslProtocols": {
            "Quantity": 1,
            "Items": ["TLSv1.2"]
          },
          "OriginReadTimeout": 60,
          "OriginKeepaliveTimeout": 5
        },
        "OriginPath": "",
        "CustomHeaders": {
          "Quantity": 0
        }
      },
      {
        "Id": "s3-static-origin",
        "DomainName": "wedding-platform-static.s3.us-east-1.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": "origin-access-identity/cloudfront/YOUR_OAI_ID"
        },
        "OriginPath": ""
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "app-runner-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 7,
      "Items": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "ForwardedValues": {
      "QueryString": true,
      "Cookies": {
        "Forward": "all"
      },
      "Headers": {
        "Quantity": 4,
        "Items": ["Authorization", "Host", "CloudFront-Forwarded-Proto", "Accept"]
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 0,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "CacheBehaviors": {
    "Quantity": 2,
    "Items": [
      {
        "PathPattern": "_next/static/*",
        "TargetOriginId": "s3-static-origin",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
          "Quantity": 2,
          "Items": ["GET", "HEAD"]
        },
        "ForwardedValues": {
          "QueryString": false,
          "Cookies": {
            "Forward": "none"
          }
        },
        "MinTTL": 31536000,
        "DefaultTTL": 31536000,
        "MaxTTL": 31536000,
        "Compress": true
      },
      {
        "PathPattern": "public/*",
        "TargetOriginId": "s3-static-origin",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
          "Quantity": 2,
          "Items": ["GET", "HEAD"]
        },
        "ForwardedValues": {
          "QueryString": false,
          "Cookies": {
            "Forward": "none"
          }
        },
        "MinTTL": 86400,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": true
      }
    ]
  },
  "PriceClass": "PriceClass_100",
  "ViewerCertificate": {
    "CloudFrontDefaultCertificate": true,
    "MinimumProtocolVersion": "TLSv1.2_2021"
  }
}
```

Create the distribution:
```bash
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

### Step 7: Automated Deployment Script

Create `scripts/deploy-cloudfront.sh`:

```bash
#!/bin/bash
set -e

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
S3_BUCKET="wedding-platform-static"
DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID}"

echo "🚀 Deploying to CloudFront..."

# Build the application
echo "📦 Building Next.js application..."
npm run build

# Upload static assets to S3
echo "☁️  Uploading static assets to S3..."
aws s3 sync .next/static "s3://${S3_BUCKET}/_next/static" \
  --region "${AWS_REGION}" \
  --cache-control "public, max-age=31536000, immutable" \
  --delete

aws s3 sync public "s3://${S3_BUCKET}/public" \
  --region "${AWS_REGION}" \
  --cache-control "public, max-age=86400" \
  --delete

# Deploy container to App Runner
echo "🐳 Deploying container to App Runner..."
./scripts/push-to-ecr.sh

# Trigger App Runner deployment
if [ -n "${APP_RUNNER_SERVICE_ARN}" ]; then
  echo "🔄 Triggering App Runner deployment..."
  aws apprunner start-deployment \
    --service-arn "${APP_RUNNER_SERVICE_ARN}" \
    --region "${AWS_REGION}"
fi

# Invalidate CloudFront cache
if [ -n "${DISTRIBUTION_ID}" ]; then
  echo "🔄 Invalidating CloudFront cache..."
  aws cloudfront create-invalidation \
    --distribution-id "${DISTRIBUTION_ID}" \
    --paths "/*"
fi

echo "✅ Deployment complete!"
```

Make it executable:
```bash
chmod +x scripts/deploy-cloudfront.sh
```

### Step 8: Update Environment Variables

Update your App Runner environment variables:

```env
# Add CloudFront domain
NEXTAUTH_URL=https://YOUR_CLOUDFRONT_DOMAIN.cloudfront.net

# Or your custom domain
NEXTAUTH_URL=https://yourdomain.com

# Update asset URLs if needed
NEXT_PUBLIC_CDN_URL=https://YOUR_CLOUDFRONT_DOMAIN.cloudfront.net
```

---

## 🔧 Option 2: CloudFront + ALB + ECS

For more control and complex infrastructure requirements.

### Step 1: Set Up VPC and Networking

```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# Create subnets (public and private)
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.1.0/24 --availability-zone us-east-1a
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.2.0/24 --availability-zone us-east-1b

# Create Internet Gateway
aws ec2 create-internet-gateway
aws ec2 attach-internet-gateway --vpc-id vpc-xxx --internet-gateway-id igw-xxx
```

### Step 2: Create Application Load Balancer

```bash
aws elbv2 create-load-balancer \
  --name wedding-platform-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4
```

### Step 3: Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name wedding-platform-cluster
```

### Step 4: Create ECS Task Definition

Create `ecs-task-definition.json`:

```json
{
  "family": "wedding-platform-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "wedding-platform",
      "image": "YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/wedding-platform:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:xxx:secret:database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/wedding-platform",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register the task:
```bash
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
```

### Step 5: Create ECS Service

```bash
aws ecs create-service \
  --cluster wedding-platform-cluster \
  --service-name wedding-platform-service \
  --task-definition wedding-platform-task \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:xxx:targetgroup/wedding-platform,containerName=wedding-platform,containerPort=3000"
```

### Step 6: Create CloudFront Distribution for ALB

Create distribution pointing to ALB as origin:

```bash
aws cloudfront create-distribution \
  --origin-domain-name your-alb-xxx.us-east-1.elb.amazonaws.com \
  --default-root-object index.html
```

---

## 📄 Option 3: CloudFront + S3 (Static Export Only)

**⚠️ Note:** This option only works if you export Next.js as a static site. You'll lose:
- API routes
- Server-side rendering
- Dynamic routes
- Authentication

### Step 1: Configure Next.js for Static Export

Update `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
```

### Step 2: Build Static Site

```bash
npm run build
```

This creates an `out` directory with static files.

### Step 3: Upload to S3

```bash
# Create bucket
aws s3 mb s3://wedding-platform-static-site

# Enable static website hosting
aws s3 website s3://wedding-platform-static-site \
  --index-document index.html \
  --error-document 404.html

# Upload files
aws s3 sync out s3://wedding-platform-static-site \
  --cache-control "public, max-age=3600" \
  --delete
```

### Step 4: Create CloudFront Distribution

```bash
aws cloudfront create-distribution \
  --origin-domain-name wedding-platform-static-site.s3-website-us-east-1.amazonaws.com \
  --default-root-object index.html
```

---

## ⚙️ Configuration

### Cache Behavior Configuration

Optimize caching for different content types:

```javascript
// Cache behaviors by path pattern
const cacheBehaviors = [
  {
    pathPattern: '_next/static/*',
    cacheTTL: 31536000, // 1 year - immutable content
    compress: true,
  },
  {
    pathPattern: 'public/images/*',
    cacheTTL: 2592000, // 30 days
    compress: true,
  },
  {
    pathPattern: 'api/*',
    cacheTTL: 0, // No cache - dynamic API routes
    forwardCookies: true,
    forwardHeaders: ['Authorization'],
  },
];
```

### Custom Error Responses

Handle 404s and 500s gracefully:

```bash
aws cloudfront create-distribution \
  --custom-error-responses \
    ErrorCode=404,ResponsePagePath=/404.html,ResponseCode=404 \
    ErrorCode=500,ResponsePagePath=/500.html,ResponseCode=500
```

### Request Headers

Forward necessary headers to origin:

```json
{
  "ForwardedHeaders": [
    "Authorization",
    "Host",
    "CloudFront-Forwarded-Proto",
    "Accept",
    "Accept-Language",
    "User-Agent"
  ]
}
```

---

## 🌐 Custom Domain Setup

### Step 1: Request SSL Certificate

**Important:** Must be in `us-east-1` region for CloudFront!

```bash
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names "*.yourdomain.com" \
  --validation-method DNS \
  --region us-east-1
```

### Step 2: Validate Certificate

Follow DNS validation instructions from ACM console.

### Step 3: Update CloudFront Distribution

```bash
aws cloudfront update-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --if-match YOUR_ETAG \
  --distribution-config file://updated-config.json
```

In `updated-config.json`, add:

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

### Step 4: Update Route 53

```bash
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "yourdomain.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "YOUR_CLOUDFRONT_DOMAIN.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

---

## 📊 Monitoring & Optimization

### Enable CloudFront Logging

```bash
aws cloudfront update-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --logging-config \
    Enabled=true,\
    IncludeCookies=false,\
    Bucket=wedding-platform-logs.s3.amazonaws.com,\
    Prefix=cloudfront/
```

### Set Up CloudWatch Alarms

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name cloudfront-4xx-errors \
  --alarm-description "Alert on high 4xx error rate" \
  --metric-name 4xxErrorRate \
  --namespace AWS/CloudFront \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### Cache Hit Ratio Monitoring

Monitor cache effectiveness:

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name CacheHitRate \
  --dimensions Name=DistributionId,Value=YOUR_DISTRIBUTION_ID \
  --start-time 2026-01-31T00:00:00Z \
  --end-time 2026-01-31T23:59:59Z \
  --period 3600 \
  --statistics Average
```

### Invalidation Strategy

Create efficient invalidation patterns:

```bash
# Invalidate specific paths
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/_next/static/*" "/api/*"

# Invalidate everything (costs more)
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

**💡 Pro Tip:** Use versioned URLs instead of invalidations to save costs!

---

## 🔒 Security Best Practices

### 1. Enable WAF (Web Application Firewall)

```bash
# Create WAF Web ACL
aws wafv2 create-web-acl \
  --name wedding-platform-waf \
  --scope CLOUDFRONT \
  --default-action Allow={} \
  --rules file://waf-rules.json \
  --region us-east-1
```

### 2. Restrict Origin Access

Use Origin Access Identity (OAI) for S3 or custom headers for App Runner:

```json
{
  "CustomHeaders": {
    "Quantity": 1,
    "Items": [
      {
        "HeaderName": "X-Custom-Secret",
        "HeaderValue": "your-secret-value"
      }
    ]
  }
}
```

Then verify this header in your App Runner app.

### 3. Enable HTTPS Only

```json
{
  "ViewerProtocolPolicy": "redirect-to-https"
}
```

### 4. Geo Restrictions (Optional)

```bash
aws cloudfront update-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --restrictions '{
    "GeoRestriction": {
      "RestrictionType": "whitelist",
      "Quantity": 1,
      "Items": ["US"]
    }
  }'
```

---

## 💰 Cost Optimization

### CloudFront Pricing

- **Data Transfer Out:** $0.085/GB for first 10 TB/month (US, Europe, Canada)
- **Requests:** $0.0075 per 10,000 HTTPS requests
- **Invalidations:** First 1,000 paths/month free, then $0.005 per path

### Optimization Tips

1. **Use Price Class 100** (US, Canada, Europe) if your users are primarily in these regions
2. **Version static assets** instead of invalidating cache
3. **Compress content** (enable automatic compression)
4. **Use optimal TTL values**
5. **Monitor cache hit ratio** (aim for >80%)

### Cost Monitoring

```bash
# Get estimated monthly cost
aws ce get-cost-and-usage \
  --time-period Start=2026-01-01,End=2026-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --filter file://cloudfront-filter.json
```

---

## 🚀 Deployment Checklist

Before going live:

- [ ] CloudFront distribution created
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate validated and attached
- [ ] Origin (App Runner/ALB) deployed and healthy
- [ ] S3 bucket for static assets configured
- [ ] Cache behaviors optimized
- [ ] Security headers configured
- [ ] WAF rules applied (if needed)
- [ ] CloudWatch alarms set up
- [ ] Logging enabled
- [ ] Cost alerts configured
- [ ] DNS records updated
- [ ] Test all routes and functionality
- [ ] Test from different geographic locations
- [ ] Monitor cache hit ratio

---

## 🆘 Troubleshooting

### CloudFront Returns 502 Bad Gateway

**Possible causes:**
- Origin (App Runner/ALB) is down or unhealthy
- Security group blocking CloudFront IPs
- Origin timeout (increase timeout in CloudFront settings)

**Solution:**
```bash
# Check origin health
curl -I https://YOUR_APP_RUNNER_URL.awsapprunner.com

# Increase origin timeout
aws cloudfront update-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --origin-read-timeout 60
```

### Cache Not Working

**Check:**
- Cache behavior path patterns
- TTL settings
- Forward headers/cookies configuration

**Solution:**
```bash
# Check cache statistics
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name CacheHitRate \
  --dimensions Name=DistributionId,Value=YOUR_DIST_ID \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

### Custom Domain Not Working

**Check:**
- Certificate in us-east-1 region
- Certificate validated
- DNS records correct (A record with alias to CloudFront)
- Domain added to CloudFront aliases

### High Costs

**Optimize:**
- Review data transfer patterns
- Increase cache TTL where appropriate
- Use versioned URLs instead of invalidations
- Consider Price Class 100 instead of All

---

## 📚 Additional Resources

- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [Next.js Deployment Best Practices](https://nextjs.org/docs/deployment)
- [CloudFront Performance Tips](https://aws.amazon.com/cloudfront/getting-started/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

---

## 🎯 Quick Reference

### Useful Commands

```bash
# List distributions
aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,DomainName,Status]' --output table

# Get distribution details
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID

# Create invalidation
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

# Check invalidation status
aws cloudfront get-invalidation --distribution-id YOUR_DISTRIBUTION_ID --id INVALIDATION_ID

# Update distribution
aws cloudfront update-distribution --id YOUR_DISTRIBUTION_ID --if-match ETAG --distribution-config file://config.json

# Delete distribution (must disable first)
aws cloudfront update-distribution --id YOUR_DISTRIBUTION_ID --if-match ETAG --distribution-config file://disabled-config.json
aws cloudfront delete-distribution --id YOUR_DISTRIBUTION_ID --if-match ETAG
```

### Environment Variables

Add to your `.env`:

```env
# CloudFront
CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC
CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net

# Custom domain (if applicable)
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_CDN_URL=https://yourdomain.com

# Static assets
AWS_S3_STATIC_BUCKET=wedding-platform-static
```

---

**Created:** 2026-01-31  
**Version:** 1.0.0  
**Author:** Wedding Platform Team

For questions or issues, refer to the [main README](./README.md) or AWS documentation.
