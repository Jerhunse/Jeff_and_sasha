#!/bin/bash

# CloudFront Health Check Script
# Tests various endpoints to ensure everything is working

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID}"
CLOUDFRONT_DOMAIN="${CLOUDFRONT_DOMAIN}"

# Try to load from saved config
if [ -z "$CLOUDFRONT_DOMAIN" ] && [ -f ".cloudfront-domain" ]; then
    CLOUDFRONT_DOMAIN=$(cat .cloudfront-domain)
fi

if [ -z "$CLOUDFRONT_DOMAIN" ]; then
    echo -e "${RED}❌ CLOUDFRONT_DOMAIN not set${NC}"
    echo "Set it with: export CLOUDFRONT_DOMAIN=your-domain.cloudfront.net"
    exit 1
fi

BASE_URL="https://${CLOUDFRONT_DOMAIN}"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CloudFront Health Check              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo "Testing: $BASE_URL"
echo ""

# Function to test endpoint
test_endpoint() {
    local path=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $description... "
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${path}" || echo "000")
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK (HTTP $status)${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED (HTTP $status, expected $expected_status)${NC}"
        return 1
    fi
}

# Function to check cache headers
check_cache() {
    local path=$1
    local description=$2
    
    echo -n "Checking cache for $description... "
    
    headers=$(curl -s -I "${BASE_URL}${path}")
    cache_control=$(echo "$headers" | grep -i "cache-control:" || echo "")
    x_cache=$(echo "$headers" | grep -i "x-cache:" || echo "")
    
    if [ -n "$cache_control" ]; then
        echo -e "${GREEN}✅ $cache_control${NC}"
    else
        echo -e "${YELLOW}⚠️  No cache headers found${NC}"
    fi
    
    if [ -n "$x_cache" ]; then
        echo "   $x_cache"
    fi
}

# Track results
PASSED=0
FAILED=0

# Test main routes
echo -e "${YELLOW}🌐 Testing Main Routes${NC}"
if test_endpoint "/" "Homepage"; then PASSED=$((PASSED+1)); else FAILED=$((FAILED+1)); fi
if test_endpoint "/jeffandsasha" "Wedding Page"; then PASSED=$((PASSED+1)); else FAILED=$((FAILED+1)); fi

# Test API routes
echo ""
echo -e "${YELLOW}🔌 Testing API Routes${NC}"
if test_endpoint "/api/health" "Health Check"; then PASSED=$((PASSED+1)); else FAILED=$((FAILED+1)); fi
if test_endpoint "/api/auth/providers" "Auth Providers"; then PASSED=$((PASSED+1)); else FAILED=$((FAILED+1)); fi

# Test static assets
echo ""
echo -e "${YELLOW}📦 Testing Static Assets${NC}"

# Note: These paths may not exist yet if static files haven't been uploaded
echo -n "Testing static files... "
status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/public/background-floral.png" || echo "000")
if [ "$status" = "200" ] || [ "$status" = "304" ]; then
    echo -e "${GREEN}✅ OK (HTTP $status)${NC}"
    PASSED=$((PASSED+1))
elif [ "$status" = "403" ] || [ "$status" = "404" ]; then
    echo -e "${YELLOW}⚠️  Not found (HTTP $status) - upload static files with deploy script${NC}"
else
    echo -e "${RED}❌ FAILED (HTTP $status)${NC}"
    FAILED=$((FAILED+1))
fi

# Check cache headers
echo ""
echo -e "${YELLOW}💾 Checking Cache Configuration${NC}"
check_cache "/" "Homepage"
check_cache "/public/background-floral.png" "Static Image"

# Test SSL/TLS
echo ""
echo -e "${YELLOW}🔒 Testing SSL/TLS${NC}"
echo -n "Checking SSL certificate... "

ssl_info=$(echo | openssl s_client -servername "$CLOUDFRONT_DOMAIN" -connect "${CLOUDFRONT_DOMAIN}:443" 2>/dev/null | openssl x509 -noout -subject -dates 2>/dev/null || echo "")

if [ -n "$ssl_info" ]; then
    echo -e "${GREEN}✅ Valid${NC}"
    echo "$ssl_info" | sed 's/^/   /'
else
    echo -e "${YELLOW}⚠️  Could not verify${NC}"
fi

# Test response times
echo ""
echo -e "${YELLOW}⚡ Testing Response Times${NC}"

for path in "/" "/jeffandsasha"; do
    echo -n "Testing $path... "
    time=$(curl -s -o /dev/null -w "%{time_total}" "${BASE_URL}${path}" || echo "0")
    time_ms=$(echo "$time * 1000" | bc | cut -d'.' -f1)
    
    if [ "$time_ms" -lt 1000 ]; then
        echo -e "${GREEN}✅ ${time_ms}ms${NC}"
    elif [ "$time_ms" -lt 3000 ]; then
        echo -e "${YELLOW}⚠️  ${time_ms}ms (slow)${NC}"
    else
        echo -e "${RED}❌ ${time_ms}ms (very slow)${NC}"
    fi
done

# CloudFront metrics
if [ -n "$DISTRIBUTION_ID" ]; then
    echo ""
    echo -e "${YELLOW}📊 CloudFront Metrics (Last Hour)${NC}"
    
    # Cache hit rate
    echo -n "Cache hit rate... "
    cache_hit=$(aws cloudwatch get-metric-statistics \
        --namespace AWS/CloudFront \
        --metric-name CacheHitRate \
        --dimensions Name=DistributionId,Value="$DISTRIBUTION_ID" \
        --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
        --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
        --period 3600 \
        --statistics Average \
        --query 'Datapoints[0].Average' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$cache_hit" ] && [ "$cache_hit" != "None" ]; then
        hit_percent=$(printf "%.1f" "$cache_hit")
        if (( $(echo "$hit_percent > 80" | bc -l) )); then
            echo -e "${GREEN}✅ ${hit_percent}%${NC}"
        elif (( $(echo "$hit_percent > 50" | bc -l) )); then
            echo -e "${YELLOW}⚠️  ${hit_percent}% (could be better)${NC}"
        else
            echo -e "${RED}❌ ${hit_percent}% (needs optimization)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  No data available${NC}"
    fi
fi

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Test Summary                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total Tests: $((PASSED+FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✨ All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the output above for details.${NC}"
    exit 1
fi
