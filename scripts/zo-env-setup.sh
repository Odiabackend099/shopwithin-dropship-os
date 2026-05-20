#!/bin/bash

# Zo Workspace Environment Setup Script
# This script securely sets up environment variables for the Zo workspace
# NEVER commit actual secrets to the repository

set -e

echo "🔧 Setting up Zo workspace environment variables..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    touch .env
fi

# Add required environment variables with placeholder values
# The Zo agent will need to replace these with actual values
cat >> .env << EOF

# ============================================
# ZO WORKSPACE ENVIRONMENT VARIABLES
# ============================================
# These are placeholder values - replace with actual credentials
# NEVER commit actual secrets to the repository

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Groq Configuration
GROQ_API_KEY=your_groq_api_key_here

# Flow AI Configuration
FLOW_AI_API_KEY=your_flow_ai_api_key_here

# WAPI Configuration
WAPI_PRIVATE_KEY=your_wapi_private_key_here
WAPI_PUBLIC_KEY=your_wapi_public_key_here

# TikTok Configuration
TIKTOK_API_KEY=your_tiktok_api_key_here

# Instagram Configuration
INSTAGRAM_API_KEY=your_instagram_api_key_here

# YouTube Configuration
YOUTUBE_API_KEY=your_youtube_api_key_here

# Pinterest Configuration
PINTEREST_API_KEY=your_pinterest_api_key_here
PINTEREST_BOARD_ID=your_pinterest_board_id_here

# Shopify Configuration
SHOPIFY_STORE_NAME=shopwithin
SHOPIFY_DOMAIN=mxu168-9g.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_shopify_access_token_here
SHOPIFY_API_SECRET=your_shopify_api_secret_here

# Database Configuration
DATABASE_URL=your_database_url_here

# Redis Configuration
REDIS_URL=your_redis_url_here

# Telegram Configuration (for alerts)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here

# Zo Workspace Configuration
ZO_WORKSPACE_ID=your_zo_workspace_id_here
ZO_API_KEY=your_zo_api_key_here

# Feature Flags
SHOPIFY_LIVE_WRITE_ENABLED=false
ENABLE_ANALYTICS_TRACKING=true
ENABLE_POSTING_AUTOMATION=false

# Environment
NODE_ENV=development
LOG_LEVEL=info

EOF

echo "✅ Environment variables template created in .env"
echo "⚠️  IMPORTANT: Replace placeholder values with actual credentials"
echo "⚠️  NEVER commit actual secrets to the repository"
echo ""
echo "To set actual values, run:"
echo "  export OPENAI_API_KEY='your_actual_key'"
echo "  export GROQ_API_KEY='your_actual_key'"
echo "  etc."
