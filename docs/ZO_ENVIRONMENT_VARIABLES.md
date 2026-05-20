# Zo Environment Variables - Copy & Paste Ready

Copy these environment variables and paste them into your Zo workspace environment configuration.

```
OPENAI_API_KEY=your_openai_api_key_here
GROQ_API_KEY=your_groq_api_key_here
FLOW_AI_API_KEY=your_flow_ai_api_key_here
WAPI_PRIVATE_KEY=your_wapi_private_key_here
WAPI_PUBLIC_KEY=your_wapi_public_key_here
TIKTOK_API_KEY=your_tiktok_api_key_here
INSTAGRAM_API_KEY=your_instagram_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
PINTEREST_API_KEY=your_pinterest_api_key_here
PINTEREST_BOARD_ID=your_pinterest_board_id_here
SHOPIFY_STORE_NAME=shopwithin
SHOPIFY_DOMAIN=mxu168-9g.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_shopify_access_token_here
SHOPIFY_API_SECRET=your_shopify_api_secret_here
DATABASE_URL=your_database_url_here
REDIS_URL=your_redis_url_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here
ZO_WORKSPACE_ID=your_zo_workspace_id_here
ZO_API_KEY=your_zo_api_key_here
SHOPIFY_LIVE_WRITE_ENABLED=false
ENABLE_ANALYTICS_TRACKING=true
ENABLE_POSTING_AUTOMATION=false
NODE_ENV=development
LOG_LEVEL=info
```

## Instructions

1. Replace all `your_*_here` placeholders with your actual credentials
2. Copy the entire block above
3. Paste into Zo workspace environment configuration
4. Save and restart the workspace

## Required Variables for Basic Operation

- `OPENAI_API_KEY` - Required for AI content generation
- `GROQ_API_KEY` - Required for fast inference
- `SHOPIFY_ACCESS_TOKEN` - Required for Shopify integration
- `DATABASE_URL` - Required for database connection
- `REDIS_URL` - Required for job queue

## Optional Variables

- `FLOW_AI_API_KEY` - For video generation
- Social media API keys - For posting automation
- `TELEGRAM_*` - For alerts and notifications
