#!/bin/bash

# Telegram Bot Credentials
BOT_TOKEN="8220781503:AAFWjcLZxYIaYdvpgQWwfjlDDwD_nws6tJY"
CHAT_ID="6526780056"

# Send confirmation message to Telegram
curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
  -d "chat_id=$CHAT_ID" \
  -d "text=✅ Video successfully updated!

Changes made:
- Cropped video to remove vo3 watermark from bottom right corner
- Added payment link: https://shopwithin.com/furlift
- Re-uploaded with optimized caption and hashtags

The video is now live on TikTok with:
- Watermark-free content
- Payment link for users to purchase
- Optimized caption with CTA
- Strategic hashtags for discoverability

Users can now click the payment link directly from the video to buy FurLift."
