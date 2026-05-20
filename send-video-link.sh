#!/bin/bash

# Telegram Bot Credentials
BOT_TOKEN="8220781503:AAFWjcLZxYIaYdvpgQWwfjlDDwD_nws6tJY"
CHAT_ID="6526780056"

# TikTok video link
VIDEO_LINK="https://www.tiktok.com/@odiadev_ai/video/7641711657684585736"

# Send video link to Telegram
curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
  -d "chat_id=$CHAT_ID" \
  -d "text=TikTok Video Link: $VIDEO_LINK

This is the video we just posted with the pet hair removal content. I'll now add a payment link to the video description so users can click to buy the product."
