#!/bin/bash
# ==============================================================
# Docker Integration Test Script
# ==============================================================
# Usage: bash scripts/test-docker.sh
# Builds all containers, waits for health, runs API tests.
# ==============================================================

set -e

PASS=0
FAIL=0
BASE_URL="http://localhost:8080"
FRONTEND_URL="http://localhost:3000"

# ─── Helpers ─────────────────────────────────────────────────────

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m'

pass() {
  echo -e "  ${GREEN}✓ PASS${NC} — $1"
  PASS=$((PASS + 1))
}

fail() {
  echo -e "  ${RED}✗ FAIL${NC} — $1"
  FAIL=$((FAIL + 1))
}

info() {
  echo -e "${YELLOW}$1${NC}"
}

# ─── Step 1: Clean & Build ───────────────────────────────────────

info "═══════════════════════════════════════════════"
info " Docker Integration Tests"
info "═══════════════════════════════════════════════"
echo ""

info "Step 1: Tearing down old containers..."
docker compose down -v 2>/dev/null || true

info "Step 2: Building and starting containers..."
docker compose up --build -d

# ─── Step 2: Wait for Health ─────────────────────────────────────

info "Step 3: Waiting for services to be healthy..."

MAX_WAIT=120
WAIT=0

# Wait for backend health
echo -n "  Waiting for backend"
while [ $WAIT -lt $MAX_WAIT ]; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/actuator/health" 2>/dev/null || echo "000")
  if [ "$STATUS" = "200" ]; then
    echo ""
    pass "Backend is healthy"
    break
  fi
  echo -n "."
  sleep 3
  WAIT=$((WAIT + 3))
done

if [ $WAIT -ge $MAX_WAIT ]; then
  echo ""
  fail "Backend did not start within ${MAX_WAIT}s"
  info "Dumping backend logs:"
  docker compose logs backend --tail 50
  echo ""
  info "Tests aborted."
  exit 1
fi

# Wait for frontend
echo -n "  Waiting for frontend"
WAIT=0
while [ $WAIT -lt 60 ]; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null || echo "000")
  if [ "$STATUS" = "200" ]; then
    echo ""
    pass "Frontend is serving"
    break
  fi
  echo -n "."
  sleep 2
  WAIT=$((WAIT + 2))
done

if [ $WAIT -ge 60 ]; then
  echo ""
  fail "Frontend did not respond within 60s"
fi

echo ""

# ─── Step 3: API Tests ──────────────────────────────────────────

info "Step 4: Running API tests..."
echo ""

# Test 1: Health endpoint
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/actuator/health")
if [ "$STATUS" = "200" ]; then
  pass "GET /actuator/health → 200"
else
  fail "GET /actuator/health → $STATUS (expected 200)"
fi

# Test 2: Swagger UI
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/swagger-ui.html")
if [ "$STATUS" = "200" ] || [ "$STATUS" = "302" ]; then
  pass "GET /swagger-ui.html → $STATUS"
else
  fail "GET /swagger-ui.html → $STATUS (expected 200 or 302)"
fi

# Test 3: Register user
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"dockertest@test.com","password":"password123","firstName":"Docker","lastName":"Test"}')
REGISTER_CODE=$(echo "$REGISTER_RESPONSE" | tail -1)
REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | sed '$d')

if [ "$REGISTER_CODE" = "201" ]; then
  pass "POST /api/auth/register → 201"
else
  fail "POST /api/auth/register → $REGISTER_CODE (expected 201)"
fi

# Test 4: Login
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"dockertest@test.com","password":"password123"}')
LOGIN_CODE=$(echo "$LOGIN_RESPONSE" | tail -1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$LOGIN_CODE" = "200" ]; then
  pass "POST /api/auth/login → 200"
else
  fail "POST /api/auth/login → $LOGIN_CODE (expected 200)"
fi

# Extract token
TOKEN=$(echo "$LOGIN_BODY" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  fail "Could not extract access_token from login response"
  info "Skipping authenticated tests."
  echo ""
else
  pass "Access token extracted"

  # Test 5: Get current user
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/auth/me" \
    -H "Authorization: Bearer $TOKEN")
  if [ "$STATUS" = "200" ]; then
    pass "GET /api/auth/me → 200"
  else
    fail "GET /api/auth/me → $STATUS (expected 200)"
  fi

  # Test 6: Create account
  ACCOUNT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/accounts" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"name":"Test Checking","type":"CHECKING","currency":"EUR"}')
  ACCOUNT_CODE=$(echo "$ACCOUNT_RESPONSE" | tail -1)
  ACCOUNT_BODY=$(echo "$ACCOUNT_RESPONSE" | sed '$d')

  if [ "$ACCOUNT_CODE" = "201" ]; then
    pass "POST /api/accounts → 201"
  else
    fail "POST /api/accounts → $ACCOUNT_CODE (expected 201)"
  fi

  ACCOUNT_ID=$(echo "$ACCOUNT_BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)

  # Test 7: Get categories
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/categories" \
    -H "Authorization: Bearer $TOKEN")
  if [ "$STATUS" = "200" ]; then
    pass "GET /api/categories → 200"
  else
    fail "GET /api/categories → $STATUS (expected 200)"
  fi

  # Test 8: Create transaction
  if [ -n "$ACCOUNT_ID" ]; then
    TX_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/transactions" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{\"amount\":42.50,\"type\":\"EXPENSE\",\"description\":\"Docker test tx\",\"transactionDate\":\"2026-03-10\",\"accountId\":$ACCOUNT_ID,\"categoryId\":1}")
    if [ "$TX_CODE" = "201" ]; then
      pass "POST /api/transactions → 201"
    else
      fail "POST /api/transactions → $TX_CODE (expected 201)"
    fi
  fi

  # Test 9: Get transactions
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/transactions?page=0&size=10" \
    -H "Authorization: Bearer $TOKEN")
  if [ "$STATUS" = "200" ]; then
    pass "GET /api/transactions → 200"
  else
    fail "GET /api/transactions → $STATUS (expected 200)"
  fi

  # Test 10: Get analytics
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/analytics/monthly-summary?months=6" \
    -H "Authorization: Bearer $TOKEN")
  if [ "$STATUS" = "200" ]; then
    pass "GET /api/analytics/monthly-summary → 200"
  else
    fail "GET /api/analytics/monthly-summary → $STATUS (expected 200)"
  fi

  # Test 11: Create budget
  BUDGET_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/budgets" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"categoryId":1,"amountLimit":300,"yearMonth":"2026-03"}')
  if [ "$BUDGET_CODE" = "201" ]; then
    pass "POST /api/budgets → 201"
  else
    fail "POST /api/budgets → $BUDGET_CODE (expected 201)"
  fi

  # Test 12: Get budget status
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/budgets/status?yearMonth=2026-03" \
    -H "Authorization: Bearer $TOKEN")
  if [ "$STATUS" = "200" ]; then
    pass "GET /api/budgets/status → 200"
  else
    fail "GET /api/budgets/status → $STATUS (expected 200)"
  fi
fi

# Test 13: Frontend serves HTML
FRONTEND_TYPE=$(curl -s -o /dev/null -w "%{content_type}" "$FRONTEND_URL")
if echo "$FRONTEND_TYPE" | grep -q "text/html"; then
  pass "Frontend serves HTML at :3000"
else
  fail "Frontend content type: $FRONTEND_TYPE (expected text/html)"
fi

# Test 14: Frontend proxies API
PROXY_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$FRONTEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"x","password":"x"}')
if [ "$PROXY_CODE" = "401" ] || [ "$PROXY_CODE" = "400" ]; then
  pass "Frontend proxies /api → backend ($PROXY_CODE)"
else
  fail "Frontend proxy /api → $PROXY_CODE (expected 400 or 401)"
fi

# Test 15: Demo user exists (seeded by DemoDataSeeder)
DEMO_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@financeapp.com","password":"demo123"}')
if [ "$DEMO_CODE" = "200" ]; then
  pass "Demo user login → 200 (seeder worked)"
else
  fail "Demo user login → $DEMO_CODE (expected 200)"
fi

# ─── Summary ─────────────────────────────────────────────────────

echo ""
info "═══════════════════════════════════════════════"
TOTAL=$((PASS + FAIL))
echo -e " Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}, $TOTAL total"
info "═══════════════════════════════════════════════"
echo ""

if [ $FAIL -gt 0 ]; then
  info "Some tests failed. Check logs with:"
  echo "  docker compose logs backend --tail 100"
  echo "  docker compose logs frontend --tail 50"
  exit 1
else
  info "All tests passed! The app is running at:"
  echo "  Frontend:  http://localhost:3000"
  echo "  Backend:   http://localhost:8080"
  echo "  Swagger:   http://localhost:8080/swagger-ui.html"
  echo "  Demo user: demo@financeapp.com / demo123"
  exit 0
fi
