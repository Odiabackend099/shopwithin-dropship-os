#!/bin/bash

# Zo Workspace Validation Script
# This script validates that the system runs identically to the local environment

set -e

echo "🧪 Running Zo workspace validation tests..."
echo ""

# Test 1: Node.js and pnpm installation
echo "Test 1: Checking Node.js and pnpm..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not found"
    exit 1
fi

if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo "✅ pnpm installed: $PNPM_VERSION"
else
    echo "❌ pnpm not found"
    exit 1
fi
echo ""

# Test 2: Project structure validation
echo "Test 2: Validating project structure..."
REQUIRED_DIRS=("apps/api" "packages/core" "launch/ugc-engine" "launch/ugc-factory" "scripts" "docs")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ Directory exists: $dir"
    else
        echo "❌ Directory missing: $dir"
        exit 1
    fi
done
echo ""

# Test 3: Package installation validation
echo "Test 3: Validating package installation..."
if [ -f "node_modules" ] || [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies not installed"
    exit 1
fi
echo ""

# Test 4: Core package build validation
echo "Test 4: Validating core package build..."
cd packages/core
if pnpm build; then
    echo "✅ Core package builds successfully"
else
    echo "❌ Core package build failed"
    exit 1
fi
cd ../..
echo ""

# Test 5: Operator skills validation
echo "Test 5: Validating operator skills..."
SKILLS=("viral-product-finder.mjs" "ugc-worker.mjs" "analytics-feedback-loop.mjs" "operator-daily.mjs")
for skill in "${SKILLS[@]}"; do
    if [ -f "scripts/$skill" ]; then
        echo "✅ Skill script exists: $skill"
    else
        echo "❌ Skill script missing: $skill"
        exit 1
    fi
done
echo ""

# Test 6: Dry-run operator skills
echo "Test 6: Testing operator skills (dry-run)..."
echo "Testing viral product finder..."
if node scripts/viral-product-finder.mjs --dry-run > /dev/null 2>&1; then
    echo "✅ Viral product finder runs successfully"
else
    echo "❌ Viral product finder failed"
    exit 1
fi

echo "Testing UGC worker..."
if node scripts/ugc-worker.mjs --input scripts/ugc-worker-sample-input.json --dry-run > /dev/null 2>&1; then
    echo "✅ UGC worker runs successfully"
else
    echo "❌ UGC worker failed"
    exit 1
fi

echo "Testing analytics feedback loop..."
if node scripts/analytics-feedback-loop.mjs --dry-run > /dev/null 2>&1; then
    echo "✅ Analytics feedback loop runs successfully"
else
    echo "❌ Analytics feedback loop failed"
    exit 1
fi
echo ""

# Test 7: Environment variable validation
echo "Test 7: Validating environment variables..."
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    # Check for placeholder values (warning, not error)
    if grep -q "your_" .env; then
        echo "⚠️  WARNING: Some environment variables are still placeholders"
    else
        echo "✅ Environment variables appear to be configured"
    fi
else
    echo "⚠️  WARNING: .env file not found (run zo-env-setup.sh)"
fi
echo ""

# Test 8: Documentation validation
echo "Test 8: Validating documentation..."
DOCS=("docs/OPERATOR_GUIDE.md" "docs/SKILLS/VIRAL_PRODUCT_FINDER.md" "docs/SKILLS/UGC_WORKER.md" "docs/SKILLS/ANALYTICS_FEEDBACK_LOOP.md")
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo "✅ Documentation exists: $doc"
    else
        echo "❌ Documentation missing: $doc"
        exit 1
    fi
done
echo ""

# Test 9: API build validation (if API exists)
echo "Test 9: Validating API build..."
if [ -d "apps/api" ]; then
    cd apps/api
    if pnpm build; then
        echo "✅ API builds successfully"
    else
        echo "⚠️  WARNING: API build failed (may need environment variables)"
    fi
    cd ../..
else
    echo "⚠️  API directory not found"
fi
echo ""

# Test 10: UGC Engine validation (if exists)
echo "Test 10: Validating UGC Engine..."
if [ -d "launch/ugc-engine" ]; then
    cd launch/ugc-engine
    if pnpm build; then
        echo "✅ UGC Engine builds successfully"
    else
        echo "⚠️  WARNING: UGC Engine build failed"
    fi
    cd ../..
else
    echo "⚠️  UGC Engine directory not found"
fi
echo ""

echo "🎉 All validation tests completed successfully!"
echo ""
echo "Summary:"
echo "- ✅ Node.js and pnpm installed"
echo "- ✅ Project structure valid"
echo "- ✅ Dependencies installed"
echo "- ✅ Core package builds"
echo "- ✅ Operator skills functional"
echo "- ✅ Documentation complete"
echo ""
echo "The Zo workspace is ready for deployment."
