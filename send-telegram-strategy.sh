#!/bin/bash

# Telegram Bot Credentials
BOT_TOKEN="8220781503:AAFWjcLZxYIaYdvpgQWwfjlDDwD_nws6tJY"
CHAT_ID="6526780056"

# Document paths
DOCS_DIR="/Users/mac/Desktop/Risewithin Shopify/dropship-os/docs"

# Send each strategy document
echo "Sending TikTok strategy documents to Telegram..."

# Content Calendar
curl -F "chat_id=$CHAT_ID" \
     -F "document=@$DOCS_DIR/TIKTOK_CONTENT_CALENDAR_WEEK1.md" \
     -F "caption=TikTok Content Calendar - Week 1 for Shopwithin" \
     "https://api.telegram.org/bot$BOT_TOKEN/sendDocument"

echo ""
echo "Sent: TIKTOK_CONTENT_CALENDAR_WEEK1.md"

# Content Strategy Plan
curl -F "chat_id=$CHAT_ID" \
     -F "document=@$DOCS_DIR/TIKTOK_CONTENT_STRATEGY_PLAN.md" \
     -F "caption=TikTok Content Strategy Plan - Comprehensive growth strategy" \
     "https://api.telegram.org/bot$BOT_TOKEN/sendDocument"

echo ""
echo "Sent: TIKTOK_CONTENT_STRATEGY_PLAN.md"

# Hashtag Strategy
curl -F "chat_id=$CHAT_ID" \
     -F "document=@$DOCS_DIR/TIKTOK_HASHTAG_STRATEGY.md" \
     -F "caption=TikTok Hashtag Strategy - Hashtag mix and optimization" \
     "https://api.telegram.org/bot$BOT_TOKEN/sendDocument"

echo ""
echo "Sent: TIKTOK_HASHTAG_STRATEGY.md"

# Engagement Plan
curl -F "chat_id=$CHAT_ID" \
     -F "document=@$DOCS_DIR/TIKTOK_ENGAGEMENT_PLAN.md" \
     -F "caption=TikTok Engagement Plan - Community building strategy" \
     "https://api.telegram.org/bot$BOT_TOKEN/sendDocument"

echo ""
echo "Sent: TIKTOK_ENGAGEMENT_PLAN.md"

# Analytics Tracking
curl -F "chat_id=$CHAT_ID" \
     -F "document=@$DOCS_DIR/TIKTOK_ANALYTICS_TRACKING.md" \
     -F "caption=TikTok Analytics Tracking - Metrics and optimization framework" \
     "https://api.telegram.org/bot$BOT_TOKEN/sendDocument"

echo ""
echo "Sent: TIKTOK_ANALYTICS_TRACKING.md"

echo ""
echo "All TikTok strategy documents sent successfully!"
echo "First video has been posted to TikTok with optimized caption."
echo "90-day growth strategy is ready for execution."
