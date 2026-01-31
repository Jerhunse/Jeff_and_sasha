#!/bin/bash
set -e

# Wedding Platform CloudFront Setup Script
# This script sets up CloudFront distribution for the wedding platform

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
S3_BUCKET_NAME="${S3_BUCKET_NAME:-wedding-platform-static}"
APP_RUNNER_URL="${APP_RUNNER_URL}"
CUSTOM_DOMAIN="${CUSTOM_DOMAIN}"
PRICE_CLASS="${PRICE_CLASS:-PriceClass_100}"

echo -e "${GREEN}🚀 Setting up CloudFront for Wedding Platform${NC}"
echo "========================================"

# Check prerequisites
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not configured. Run 'aws configure' first.${NC}"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS Account: ${ACCOUNT_ID}${NC}"

# Step 1: Create S3 bucket for static assets
echo ""
echo -e "${YELLOW}📦 Step 1: Creating S3 bucket for static assets...${NC}"

if aws s3 ls "s3://${S3_BUCKET_NAME}" 2>&1 | grep -q 'NoSuchBucket'; then
    aws s3 mb "s3://${S3_BUCKET_NAME}" --region "${AWS_REGION}"
    echo -e "${GREEN}✅ Created S3 bucket: ${S3_BUCKET_NAME}${NC}"
else
    echo -e "${YELLOW}⚠️  S3 bucket already exists: ${S3_BUCKET_NAME}${NC}"
fi

# Enable versioning
aws s3api put-bucket-versioning \
    --bucket "${S3_BUCKET_NAME}" \
    --versioning-configuration Status=Enabled \
    --region "${AWS_REGION}"

echo -e "${GREEN}✅ Enabled versioning on S3 bucket${NC}"

# Block public access (CloudFront will access via OAI)
aws s3api put-public-access-block \
    --bucket "${S3_BUCKET_NAME}" \
    --public-access-block-configuration \
        BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false \
    --region "${AWS_REGION}"

echo -e "${GREEN}✅ Configured bucket access policy${NC}"

# Step 2: Create CloudFront Origin Access Identity
echo ""
echo -e "${YELLOW}🔐 Step 2: Creating CloudFront Origin Access Identity...${NC}"

OAI_RESPONSE=$(aws cloudfront create-cloud-front-origin-access-identity \
    --cloud-front-origin-access-identity-config \
        CallerReference="wedding-platform-$(date +%s)",Comment="OAI for wedding platform static assets" \
    --output json 2>/dev/null || echo "")

if [ -n "$OAI_RESPONSE" ]; then
    OAI_ID=$(echo "$OAI_RESPONSE" | jq -r '.CloudFrontOriginAccessIdentity.Id')
    OAI_S3_CANONICAL_USER_ID=$(echo "$OAI_RESPONSE" | jq -r '.CloudFrontOriginAccessIdentity.S3CanonicalUserId')
    echo -e "${GREEN}✅ Created OAI: ${OAI_ID}${NC}"
    
    # Save OAI ID for later use
    echo "$OAI_ID" > .cloudfront-oai-id
else
    echo -e "${YELLOW}⚠️  Using existing OAI (or creation failed)${NC}"
    
    # Try to get existing OAI
    EXISTING_OAI=$(aws cloudfront list-cloud-front-origin-access-identities --query 'CloudFrontOriginAccessIdentityList.Items[?Comment==`OAI for wedding platform static assets`].Id' --output text)
    
    if [ -n "$EXISTING_OAI" ]; then
        OAI_ID="$EXISTING_OAI"
        echo -e "${GREEN}✅ Found existing OAI: ${OAI_ID}${NC}"
        echo "$OAI_ID" > .cloudfront-oai-id
        
        # Get S3 canonical user ID
        OAI_S3_CANONICAL_USER_ID=$(aws cloudfront get-cloud-front-origin-access-identity --id "$OAI_ID" --query 'CloudFrontOriginAccessIdentity.S3CanonicalUserId' --output text)
    fi
fi

# Step 3: Update S3 bucket policy
echo ""
echo -e "${YELLOW}📝 Step 3: Updating S3 bucket policy...${NC}"

if [ -n "$OAI_ID" ]; then
    cat > /tmp/s3-bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontOAI",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ${OAI_ID}"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${S3_BUCKET_NAME}/*"
    }
  ]
}
EOF

    aws s3api put-bucket-policy \
        --bucket "${S3_BUCKET_NAME}" \
        --policy file:///tmp/s3-bucket-policy.json \
        --region "${AWS_REGION}"
    
    echo -e "${GREEN}✅ Updated S3 bucket policy${NC}"
    rm /tmp/s3-bucket-policy.json
fi

# Step 4: Create CloudFront distribution
echo ""
echo -e "${YELLOW}☁️  Step 4: Creating CloudFront distribution...${NC}"

if [ -z "$APP_RUNNER_URL" ]; then
    echo -e "${YELLOW}⚠️  APP_RUNNER_URL not set. Please provide your App Runner URL.${NC}"
    echo -e "${YELLOW}You can find it in the App Runner console or by running:${NC}"
    echo -e "${YELLOW}  aws apprunner list-services${NC}"
    echo ""
    read -p "Enter your App Runner URL (e.g., abc123.us-east-1.awsapprunner.com): " APP_RUNNER_URL
fi

# Create distribution config
cat > /tmp/cloudfront-config.json <<EOF
{
  "CallerReference": "wedding-platform-$(date +%s)",
  "Comment": "Wedding Platform CDN Distribution",
  "Enabled": true,
  "Origins": {
    "Quantity": 2,
    "Items": [
      {
        "Id": "app-runner-origin",
        "DomainName": "${APP_RUNNER_URL}",
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
        "DomainName": "${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": "origin-access-identity/cloudfront/${OAI_ID}"
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
          "Items": ["GET", "HEAD"],
          "CachedMethods": {
            "Quantity": 2,
            "Items": ["GET", "HEAD"]
          }
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
          "Items": ["GET", "HEAD"],
          "CachedMethods": {
            "Quantity": 2,
            "Items": ["GET", "HEAD"]
          }
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
  "PriceClass": "${PRICE_CLASS}",
  "ViewerCertificate": {
    "CloudFrontDefaultCertificate": true,
    "MinimumProtocolVersion": "TLSv1.2_2021"
  }
}
EOF

DISTRIBUTION_RESPONSE=$(aws cloudfront create-distribution \
    --distribution-config file:///tmp/cloudfront-config.json \
    --output json)

DISTRIBUTION_ID=$(echo "$DISTRIBUTION_RESPONSE" | jq -r '.Distribution.Id')
DISTRIBUTION_DOMAIN=$(echo "$DISTRIBUTION_RESPONSE" | jq -r '.Distribution.DomainName')

echo -e "${GREEN}✅ Created CloudFront distribution: ${DISTRIBUTION_ID}${NC}"
echo -e "${GREEN}   Domain: ${DISTRIBUTION_DOMAIN}${NC}"

# Save distribution info
echo "$DISTRIBUTION_ID" > .cloudfront-distribution-id
echo "$DISTRIBUTION_DOMAIN" > .cloudfront-domain

rm /tmp/cloudfront-config.json

# Step 5: Summary and next steps
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 CloudFront Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}📋 Configuration Summary:${NC}"
echo "  • S3 Bucket: ${S3_BUCKET_NAME}"
echo "  • OAI ID: ${OAI_ID}"
echo "  • Distribution ID: ${DISTRIBUTION_ID}"
echo "  • CloudFront Domain: ${DISTRIBUTION_DOMAIN}"
echo ""
echo -e "${YELLOW}⏳ CloudFront distribution is deploying (this can take 15-20 minutes)${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "  1. Wait for distribution to deploy:"
echo "     aws cloudfront get-distribution --id ${DISTRIBUTION_ID}"
echo ""
echo "  2. Update your environment variables:"
echo "     CLOUDFRONT_DISTRIBUTION_ID=${DISTRIBUTION_ID}"
echo "     CLOUDFRONT_DOMAIN=${DISTRIBUTION_DOMAIN}"
echo "     NEXTAUTH_URL=https://${DISTRIBUTION_DOMAIN}"
echo ""
echo "  3. Upload static assets:"
echo "     ./scripts/deploy-cloudfront.sh"
echo ""
echo "  4. Test your site:"
echo "     https://${DISTRIBUTION_DOMAIN}"
echo ""

if [ -n "$CUSTOM_DOMAIN" ]; then
    echo -e "${YELLOW}  5. Set up custom domain:${NC}"
    echo "     - Request SSL certificate in ACM (us-east-1 region)"
    echo "     - Update CloudFront distribution with certificate"
    echo "     - Create Route 53 A record pointing to CloudFront"
    echo ""
fi

echo -e "${GREEN}✨ Setup script completed successfully!${NC}"
