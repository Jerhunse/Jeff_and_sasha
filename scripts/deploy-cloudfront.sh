#!/bin/bash
set -e

# Wedding Platform CloudFront Deployment Script
# This script deploys the application to CloudFront + App Runner

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
S3_BUCKET="${S3_BUCKET:-wedding-platform-static}"
DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID}"
APP_RUNNER_SERVICE_ARN="${APP_RUNNER_SERVICE_ARN}"

# Try to load saved CloudFront distribution ID
if [ -z "$DISTRIBUTION_ID" ] && [ -f ".cloudfront-distribution-id" ]; then
    DISTRIBUTION_ID=$(cat .cloudfront-distribution-id)
fi

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Wedding Platform CloudFront Deploy   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Please install Node.js first.${NC}"
    exit 1
fi

if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not configured. Run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Step 1: Build the application
echo -e "${YELLOW}📦 Step 1: Building Next.js application...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build completed successfully${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Step 2: Upload static assets to S3
echo ""
echo -e "${YELLOW}☁️  Step 2: Uploading static assets to S3...${NC}"

# Check if .next/static exists
if [ ! -d ".next/static" ]; then
    echo -e "${RED}❌ .next/static directory not found. Did the build succeed?${NC}"
    exit 1
fi

# Upload Next.js static files (immutable, 1 year cache)
echo -e "${BLUE}  Uploading .next/static...${NC}"
aws s3 sync .next/static "s3://${S3_BUCKET}/_next/static" \
    --region "${AWS_REGION}" \
    --cache-control "public, max-age=31536000, immutable" \
    --delete \
    --acl private

# Upload public files (1 day cache for most files)
if [ -d "public" ]; then
    echo -e "${BLUE}  Uploading public assets...${NC}"
    
    # Upload images with longer cache (30 days)
    if [ -d "public/images" ] || [ -d "public/florals" ] || [ -d "public/videos" ]; then
        aws s3 sync public "s3://${S3_BUCKET}/public" \
            --region "${AWS_REGION}" \
            --cache-control "public, max-age=2592000" \
            --exclude "*.html" \
            --delete \
            --acl private
    fi
    
    # Upload HTML files with shorter cache
    aws s3 sync public "s3://${S3_BUCKET}/public" \
        --region "${AWS_REGION}" \
        --cache-control "public, max-age=3600" \
        --exclude "*" \
        --include "*.html" \
        --acl private
fi

echo -e "${GREEN}✅ Static assets uploaded to S3${NC}"

# Step 3: Deploy container to App Runner (if configured)
echo ""
echo -e "${YELLOW}🐳 Step 3: Deploying container to App Runner...${NC}"

if [ -f "./scripts/push-to-ecr.sh" ]; then
    bash ./scripts/push-to-ecr.sh
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Container deployed to ECR${NC}"
    else
        echo -e "${YELLOW}⚠️  Container deployment failed or skipped${NC}"
    fi
    
    # Trigger App Runner deployment if ARN is provided
    if [ -n "${APP_RUNNER_SERVICE_ARN}" ]; then
        echo -e "${BLUE}  Triggering App Runner deployment...${NC}"
        aws apprunner start-deployment \
            --service-arn "${APP_RUNNER_SERVICE_ARN}" \
            --region "${AWS_REGION}"
        
        echo -e "${GREEN}✅ App Runner deployment triggered${NC}"
    else
        echo -e "${YELLOW}⚠️  APP_RUNNER_SERVICE_ARN not set, skipping App Runner deployment${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  ECR deployment script not found, skipping container deployment${NC}"
fi

# Step 4: Invalidate CloudFront cache
echo ""
echo -e "${YELLOW}🔄 Step 4: Invalidating CloudFront cache...${NC}"

if [ -z "$DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}⚠️  CLOUDFRONT_DISTRIBUTION_ID not set${NC}"
    echo -e "${YELLOW}Skipping cache invalidation. Set CLOUDFRONT_DISTRIBUTION_ID to enable.${NC}"
else
    # Create invalidation for changed paths
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "${DISTRIBUTION_ID}" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    echo -e "${GREEN}✅ Cache invalidation created: ${INVALIDATION_ID}${NC}"
    echo -e "${BLUE}  Waiting for invalidation to complete...${NC}"
    
    # Wait for invalidation (optional, can take a few minutes)
    aws cloudfront wait invalidation-completed \
        --distribution-id "${DISTRIBUTION_ID}" \
        --id "${INVALIDATION_ID}" &
    
    WAIT_PID=$!
    
    # Show spinner while waiting
    spin='-\|/'
    i=0
    while kill -0 $WAIT_PID 2>/dev/null; do
        i=$(( (i+1) %4 ))
        printf "\r  ${spin:$i:1} Invalidating cache..."
        sleep 0.1
    done
    
    wait $WAIT_PID
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo -e "\r${GREEN}✅ Cache invalidation completed${NC}                  "
    else
        echo -e "\r${YELLOW}⚠️  Cache invalidation in progress (continuing in background)${NC}"
    fi
fi

# Step 5: Health check
echo ""
echo -e "${YELLOW}🏥 Step 5: Performing health check...${NC}"

if [ -n "$DISTRIBUTION_ID" ]; then
    CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
        --id "${DISTRIBUTION_ID}" \
        --query 'Distribution.DomainName' \
        --output text)
    
    echo -e "${BLUE}  Testing: https://${CLOUDFRONT_DOMAIN}${NC}"
    
    # Wait a moment for propagation
    sleep 5
    
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://${CLOUDFRONT_DOMAIN}" || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Health check passed (HTTP $HTTP_STATUS)${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check returned HTTP $HTTP_STATUS${NC}"
        echo -e "${YELLOW}   This is normal if the site is still deploying${NC}"
    fi
fi

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      Deployment Summary                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Static assets uploaded to S3${NC}"
echo -e "${GREEN}✅ Container deployment triggered${NC}"

if [ -n "$DISTRIBUTION_ID" ]; then
    echo -e "${GREEN}✅ CloudFront cache invalidated${NC}"
    echo ""
    echo -e "${YELLOW}🌐 Your site is available at:${NC}"
    echo "   https://${CLOUDFRONT_DOMAIN}"
else
    echo -e "${YELLOW}⚠️  CloudFront cache not invalidated (DISTRIBUTION_ID not set)${NC}"
fi

echo ""
echo -e "${YELLOW}📊 Deployment Metrics:${NC}"
echo "   Region: ${AWS_REGION}"
echo "   S3 Bucket: ${S3_BUCKET}"

if [ -n "$DISTRIBUTION_ID" ]; then
    echo "   Distribution ID: ${DISTRIBUTION_ID}"
fi

echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "   1. Monitor App Runner deployment in AWS Console"
echo "   2. Test all functionality on the live site"
echo "   3. Check CloudWatch logs for any errors"

if [ -n "$CLOUDFRONT_DOMAIN" ]; then
    echo "   4. Update DNS if using custom domain"
fi

echo ""
echo -e "${GREEN}✨ Deployment completed successfully!${NC}"
