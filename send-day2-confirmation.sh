#!/bin/bash

# Telegram Bot Credentials
BOT_TOKEN="8220781503:AAFWjcLZxYIaDdvpgQWwfjlDDwD_nws6tJY"
CHAT_ID="6526780056"

# Send Day 2 confirmation message to Telegram
curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" \
  -d "chat_id=$CHAT_ID" \
  -d "text=✅ Day 2 Educational Video Posted Successfully!

Video Details:
- Title: 'Why Traditional Lint Rollers Fail'
- Hook: 'Your lint roller is lying to you!'
- Content: Educational comparison of lint rollers vs FurLift
- Length: 8 seconds
- CTA: 'Follow for more pet care hacks'
- Hashtags: #petcare #cleaningtips #lifehack #Shopwithin
- Payment Link: https://shopwithin.com/furlift
- Status: Public and Live

TikTok Content Calendar Progress:
✅ Day 1: Problem-Solution Hook (Posted)
✅ Day 2: Educational Content (Posted)
⏳ Day 3: Entertainment/Relatable (Pending)
⏳ Day 4: Problem-Solution (Pending)
⏳ Day 5: Educational (Pending)
⏳ Day 6: Social Proof/Testimonial (Pending)
⏳ Day 7: Entertainment/Trend (Pending)

Next Steps:
- Execute daily engagement plan (60-90 min community interaction)
- Post Day 3 entertainment video
- Monitor analytics for first two videos
- Continue consistent posting schedule"
