#!/bin/bash

# Deploy Wedding Platform to Vercel with Custom Domain
# This script will deploy your site and configure jeffandsasha.com

set -e

echo "🚀 Wedding Platform - Vercel Deployment Script"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Check if user is logged in
echo -e "${BLUE}Checking Vercel authentication...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}Not logged in to Vercel. Please log in:${NC}"
    vercel login
fi

echo -e "${GREEN}✓ Authenticated with Vercel${NC}"
echo ""

# Load environment variables
if [ -f .env ]; then
    echo -e "${BLUE}Loading environment variables from .env...${NC}"
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
    echo -e "${YELLOW}⚠ No .env file found. You'll need to add environment variables in Vercel dashboard.${NC}"
fi

echo ""
echo -e "${BLUE}Deploying to Vercel...${NC}"
echo ""

# Deploy to Vercel
vercel --prod --yes \
    --name wedding-platform \
    --env DATABASE_URL="$DATABASE_URL" \
    --env NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
    --env NEXTAUTH_URL="https://jeffandsasha.com" \
    --env RESEND_API_KEY="$RESEND_API_KEY" \
    --env EMAIL_FROM="$EMAIL_FROM" \
    --env EMAIL_PROVIDER="$EMAIL_PROVIDER" \
    --env NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"

echo ""
echo -e "${GREEN}✓ Deployment successful!${NC}"
echo ""

# Get deployment URL
DEPLOYMENT_URL=$(vercel ls wedding-platform --prod -y 2>/dev/null | grep -Eo 'https://[^ ]+' | head -1 || echo "")

if [ -n "$DEPLOYMENT_URL" ]; then
    echo -e "${GREEN}✓ Your site is live at: $DEPLOYMENT_URL${NC}"
else
    echo -e "${YELLOW}Getting deployment URL...${NC}"
    DEPLOYMENT_URL=$(vercel ls --prod -y | grep -Eo 'https://[^ ]+' | head -1)
    echo -e "${GREEN}✓ Your site is live at: $DEPLOYMENT_URL${NC}"
fi

echo ""
echo -e "${BLUE}Configuring custom domain: jeffandsasha.com${NC}"
echo ""

# Add custom domain
echo -e "${BLUE}Adding jeffandsasha.com...${NC}"
vercel domains add jeffandsasha.com wedding-platform --prod || echo -e "${YELLOW}Domain might already be added${NC}"

echo -e "${BLUE}Adding www.jeffandsasha.com...${NC}"
vercel domains add www.jeffandsasha.com wedding-platform --prod || echo -e "${YELLOW}Domain might already be added${NC}"

echo ""
echo -e "${GREEN}✓ Domains added to Vercel${NC}"
echo ""

# Display DNS configuration instructions
echo "================================================"
echo -e "${BLUE}📋 DNS CONFIGURATION REQUIRED${NC}"
echo "================================================"
echo ""
echo "Please configure these DNS records at IONOS/1&1:"
echo ""
echo "1. DEACTIVATE DOMAIN GUARD FIRST!"
echo "   - Go to your IONOS account"
echo "   - Find jeffandsasha.com"
echo "   - Deactivate Domain Guard"
echo ""
echo "2. Add these DNS records:"
echo ""
echo -e "${GREEN}Record 1: Root Domain${NC}"
echo "   Type: A"
echo "   Name: @"
echo "   Value: 76.76.21.21"
echo "   TTL: 3600"
echo ""
echo -e "${GREEN}Record 2: WWW Subdomain${NC}"
echo "   Type: CNAME"
echo "   Name: www"
echo "   Value: cname.vercel-dns.com"
echo "   TTL: 3600"
echo ""
echo "3. Wait 5-15 minutes for DNS propagation"
echo ""
echo "4. Verify domain:"
echo "   vercel domains verify jeffandsasha.com wedding-platform"
echo ""
echo "================================================"
echo -e "${GREEN}✓ DEPLOYMENT COMPLETE!${NC}"
echo "================================================"
echo ""
echo "Your wedding platform is deployed to Vercel!"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Configure DNS records at IONOS (see above)"
echo "2. Wait for DNS propagation (5-15 minutes)"
echo "3. Visit https://jeffandsasha.com"
echo "4. Test RSVP functionality"
echo "5. Share with your guests!"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  vercel --prod                    # Deploy updates"
echo "  vercel logs                      # View logs"
echo "  vercel domains ls                # List domains"
echo "  vercel env pull                  # Pull environment variables"
echo ""
echo "🎉 Congratulations! Your wedding site is live!"
