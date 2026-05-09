#!/bin/bash

# Squadi API Diagnostic Script
# Run this to test if your API token is working

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Squadi API Diagnostic Script"
echo "=========================================="
echo ""

# Load environment variables
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | xargs)
    echo -e "${GREEN}✓${NC} Loaded .env.local"
else
    echo -e "${RED}✗${NC} .env.local not found!"
    exit 1
fi

# Check token exists
if [ -z "$SQUADI_API_TOKEN" ]; then
    echo -e "${RED}✗${NC} SQUADI_API_TOKEN not set in .env.local"
    exit 1
fi

echo -e "${GREEN}✓${NC} SQUADI_API_TOKEN found (length: ${#SQUADI_API_TOKEN})"
echo ""

# Test API with different configurations
TOKEN="$SQUADI_API_TOKEN"
BASE_URL="${SQUADI_API_BASE_URL:-https://api-basketball.squadi.com}"

echo "Testing API: $BASE_URL"
echo "=========================================="
echo ""

# Test 1: Simple Authorization header
echo -e "${YELLOW}[Test 1]${NC} Authorization: <token>"
HTTP_CODE=$(curl -s -o /tmp/api_test.txt -w "%{http_code}" \
    -H "Authorization: $TOKEN" \
    -H "Content-Type: application/json" \
    "$BASE_URL/livescores/competitions/list")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ SUCCESS${NC} (HTTP $HTTP_CODE)"
    echo "Response preview:"
    head -c 500 /tmp/api_test.txt | jq . 2>/dev/null || head -c 500 /tmp/api_test.txt
    exit 0
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $HTTP_CODE)"
    head -c 200 /tmp/api_test.txt
fi
echo ""

# Test 2: Bearer token
echo -e "${YELLOW}[Test 2]${NC} Authorization: Bearer <token>"
HTTP_CODE=$(curl -s -o /tmp/api_test.txt -w "%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    "$BASE_URL/livescores/competitions/list")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ SUCCESS${NC} (HTTP $HTTP_CODE)"
    echo "Response preview:"
    head -c 500 /tmp/api_test.txt | jq . 2>/dev/null || head -c 500 /tmp/api_test.txt
    exit 0
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $HTTP_CODE)"
    head -c 200 /tmp/api_test.txt
fi
echo ""

# Test 3: X-API-Key header
echo -e "${YELLOW}[Test 3]${NC} X-API-Key: <token>"
HTTP_CODE=$(curl -s -o /tmp/api_test.txt -w "%{http_code}" \
    -H "X-API-Key: $TOKEN" \
    -H "Content-Type: application/json" \
    "$BASE_URL/livescores/competitions/list")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ SUCCESS${NC} (HTTP $HTTP_CODE)"
    echo "Response preview:"
    head -c 500 /tmp/api_test.txt | jq . 2>/dev/null || head -c 500 /tmp/api_test.txt
    exit 0
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $HTTP_CODE)"
    head -c 200 /tmp/api_test.txt
fi
echo ""

# Test 4: Different endpoint
echo -e "${YELLOW}[Test 4]${NC} Try /teams/list endpoint"
HTTP_CODE=$(curl -s -o /tmp/api_test.txt -w "%{http_code}" \
    -H "Authorization: $TOKEN" \
    -H "Content-Type: application/json" \
    "$BASE_URL/teams/list")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ SUCCESS${NC} (HTTP $HTTP_CODE)"
    echo "Response preview:"
    head -c 500 /tmp/api_test.txt | jq . 2>/dev/null || head -c 500 /tmp/api_test.txt
    exit 0
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $HTTP_CODE)"
    head -c 200 /tmp/api_test.txt
fi
echo ""

echo "=========================================="
echo -e "${RED}All tests failed!${NC}"
echo ""
echo "Possible issues:"
echo "1. Token has expired or is invalid"
echo "2. API requires IP whitelisting (Vercel IPs not whitelisted)"
echo "3. API requires different authentication method"
echo "4. API base URL is incorrect"
echo ""
echo "Next steps:"
echo "- Check Squadi API documentation"
echo "- Verify token in Squadi dashboard"
echo "- Contact Squadi support about Vercel deployment"
