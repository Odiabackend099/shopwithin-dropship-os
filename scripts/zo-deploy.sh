#!/bin/bash

# Zo Workspace Deployment Script
# This script automates the deployment of the local codebase to the Zo workspace
# It handles dependency installation, environment setup, and validation

set -e

REPO_URL="https://github.com/Odiabackend099/shopwithin-dropship-os.git"
WORKSPACE_DIR="$HOME/workspace/shopwithin-dropship-os"

echo "🚀 Starting Zo workspace deployment..."
echo "Repository: $REPO_URL"
echo "Workspace: $WORKSPACE_DIR"
echo ""

# Step 1: Clone or update repository
echo "📥 Step 1: Cloning repository..."
if [ -d "$WORKSPACE_DIR" ]; then
    echo "Workspace exists, pulling latest changes..."
    cd "$WORKSPACE_DIR"
    git pull origin main
else
    echo "Cloning repository to workspace..."
    git clone "$REPO_URL" "$WORKSPACE_DIR"
    cd "$WORKSPACE_DIR"
fi

echo "✅ Repository ready at $WORKSPACE_DIR"
echo ""

# Step 2: Install system dependencies
echo "🔧 Step 2: Installing system dependencies..."
if command -v node &> /dev/null; then
    echo "Node.js version: $(node --version)"
else
    echo "❌ Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if command -v pnpm &> /dev/null; then
    echo "pnpm version: $(pnpm --version)"
else
    echo "Installing pnpm..."
    npm install -g pnpm
fi

echo "✅ System dependencies installed"
echo ""

# Step 3: Install project dependencies
echo "📦 Step 3: Installing project dependencies..."
pnpm install
echo "✅ Project dependencies installed"
echo ""

# Step 4: Setup environment variables
echo "🔐 Step 4: Setting up environment variables..."
if [ ! -f .env ]; then
    echo "Running environment setup script..."
    bash scripts/zo-env-setup.sh
else
    echo ".env file already exists"
fi

# Check if required environment variables are set (but don't fail if they're placeholders)
echo "Checking environment variables..."
if grep -q "your_" .env; then
    echo "⚠️  WARNING: Some environment variables are still placeholders"
    echo "Please update .env with actual credentials before running the system"
fi
echo "✅ Environment setup complete"
echo ""

# Step 5: Build the project
echo "🔨 Step 5: Building the project..."
pnpm build
echo "✅ Project built successfully"
echo ""

# Step 6: Run database migrations (if applicable)
echo "🗄️  Step 6: Running database migrations..."
if pnpm db:migrate; then
    echo "✅ Database migrations completed"
else
    echo "⚠️  Database migrations skipped (may not be configured)"
fi
echo ""

# Step 7: Run validation tests
echo "✅ Step 7: Running validation tests..."
if [ -f "scripts/zo-validate.sh" ]; then
    bash scripts/zo-validate.sh
else
    echo "⚠️  Validation script not found, skipping"
fi
echo ""

# Step 8: Start the development server
echo "🎯 Step 8: Starting development server..."
echo "The system is now ready to run in the Zo workspace"
echo ""
echo "To start the API server:"
echo "  cd $WORKSPACE_DIR"
echo "  pnpm dev"
echo ""
echo "To run the operator skills:"
echo "  pnpm operator:daily --dry-run"
echo "  pnpm operator:viral-finder --dry-run"
echo "  pnpm operator:ugc-worker --dry-run"
echo "  pnpm operator:analytics --dry-run"
echo ""
echo "✅ Deployment complete!"
echo "📍 Workspace location: $WORKSPACE_DIR"
