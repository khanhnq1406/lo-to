#!/bin/bash

# Railway Deployment Verification Script
# Checks if the project is ready for Railway deployment

set -e

echo "================================================"
echo "Railway Deployment Verification"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1 exists"
    return 0
  else
    echo -e "${RED}✗${NC} $1 is missing"
    return 1
  fi
}

check_command() {
  if command -v "$1" &> /dev/null; then
    echo -e "${GREEN}✓${NC} $1 is installed"
    return 0
  else
    echo -e "${RED}✗${NC} $1 is not installed"
    return 1
  fi
}

# Track errors
ERRORS=0

echo "1. Checking Required Files"
echo "----------------------------"
check_file "railway.json" || ((ERRORS++))
check_file "Procfile" || ((ERRORS++))
check_file ".env.example" || ((ERRORS++))
check_file "package.json" || ((ERRORS++))
check_file "pnpm-lock.yaml" || ((ERRORS++))
check_file "server/server.ts" || ((ERRORS++))
check_file "server/index.js" || ((ERRORS++))
check_file "app/api/health/route.ts" || ((ERRORS++))
check_file "lib/socket-config.ts" || ((ERRORS++))
echo ""

echo "2. Checking Dependencies"
echo "-------------------------"
check_command "node" || ((ERRORS++))
check_command "pnpm" || ((ERRORS++))
check_command "git" || ((ERRORS++))
echo ""

echo "3. Checking Node.js Version"
echo "----------------------------"
NODE_VERSION=$(node -v)
echo "Current Node.js version: $NODE_VERSION"
REQUIRED_VERSION="v18.0.0"
if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
  echo -e "${GREEN}✓${NC} Node.js version is sufficient (>= 18.0.0)"
else
  echo -e "${RED}✗${NC} Node.js version is too old (requires >= 18.0.0)"
  ((ERRORS++))
fi
echo ""

echo "4. Checking package.json Scripts"
echo "----------------------------------"
if grep -q '"build"' package.json; then
  echo -e "${GREEN}✓${NC} build script exists"
else
  echo -e "${RED}✗${NC} build script is missing"
  ((ERRORS++))
fi

if grep -q '"start"' package.json; then
  echo -e "${GREEN}✓${NC} start script exists"
else
  echo -e "${RED}✗${NC} start script is missing"
  ((ERRORS++))
fi
echo ""

echo "5. Checking TypeScript Configuration"
echo "--------------------------------------"
if pnpm type-check; then
  echo -e "${GREEN}✓${NC} No TypeScript errors"
else
  echo -e "${YELLOW}⚠${NC} TypeScript errors found (fix before deploying)"
  ((ERRORS++))
fi
echo ""

echo "6. Checking Git Status"
echo "-----------------------"
if [ -d .git ]; then
  echo -e "${GREEN}✓${NC} Git repository initialized"

  if git remote -v | grep -q "origin"; then
    echo -e "${GREEN}✓${NC} Git remote 'origin' configured"
  else
    echo -e "${YELLOW}⚠${NC} No git remote configured (needed for Railway GitHub integration)"
  fi

  # Check for uncommitted changes
  if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠${NC} Uncommitted changes detected"
    echo "   Run: git add . && git commit -m 'message' && git push"
  else
    echo -e "${GREEN}✓${NC} No uncommitted changes"
  fi
else
  echo -e "${RED}✗${NC} Not a git repository"
  ((ERRORS++))
fi
echo ""

echo "7. Checking Environment Variables"
echo "-----------------------------------"
if [ -f ".env.example" ]; then
  echo -e "${GREEN}✓${NC} .env.example exists"
  echo "Required variables:"
  grep -v "^#" .env.example | grep -v "^$" | while IFS='=' read -r key value; do
    echo "   - $key"
  done
else
  echo -e "${RED}✗${NC} .env.example is missing"
  ((ERRORS++))
fi
echo ""

echo "8. Testing Health Check Endpoint"
echo "----------------------------------"
# Build Next.js first if not built
if [ ! -d ".next" ]; then
  echo "Building Next.js application..."
  pnpm build > /dev/null 2>&1
fi

# Start server in background
PORT=3002 HOSTNAME=0.0.0.0 NODE_ENV=production node server/index.js > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to start
echo "Starting server (PID: $SERVER_PID)..."
sleep 5

# Test health endpoint
if curl -f -s http://localhost:3002/api/health > /dev/null; then
  echo -e "${GREEN}✓${NC} Health check endpoint is working"
  HEALTH_RESPONSE=$(curl -s http://localhost:3002/api/health)
  echo "   Response: $HEALTH_RESPONSE"
else
  echo -e "${RED}✗${NC} Health check endpoint failed"
  ((ERRORS++))
fi

# Kill server
kill $SERVER_PID 2>/dev/null || true
echo ""

echo "================================================"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed!${NC}"
  echo ""
  echo "Your project is ready for Railway deployment."
  echo ""
  echo "Next steps:"
  echo "1. Commit and push your changes to GitHub"
  echo "2. Go to railway.app and create a new project"
  echo "3. Connect your GitHub repository"
  echo "4. Set environment variables (see .env.example)"
  echo "5. Deploy!"
  echo ""
  echo "See DEPLOYMENT.md for detailed instructions."
else
  echo -e "${RED}✗ $ERRORS issue(s) found${NC}"
  echo ""
  echo "Please fix the issues above before deploying."
fi
echo "================================================"

exit $ERRORS
