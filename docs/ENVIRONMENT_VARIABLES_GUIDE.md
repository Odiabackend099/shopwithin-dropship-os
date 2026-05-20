# Environment Variables — Complete Guide for Agent

## Overview

This document provides a complete guide to all environment variables used across the Dropship OS ecosystem. The agent will use this guide to understand connections, formats, requests, and usage of each variable.

## Database: Supabase

**Note**: We use Supabase for the database, not Railway. Supabase provides a managed PostgreSQL database with built-in authentication, real-time subscriptions, and edge functions.

### Supabase Environment Variables

```bash
# Supabase Connection
SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Supabase Database (Direct PostgreSQL connection for Prisma)
DATABASE_URL=postgresql://postgres:<password>@db.<project-id>.supabase.co:5432/postgres

# Supabase Edge Functions (optional, for serverless functions)
SUPABASE_EDGE_FUNCTION_URL=https://<project-id>.supabase.co/functions/v1/
```

**Format**: 
- `SUPABASE_URL`: Full URL to Supabase project
- `SUPABASE_ANON_KEY`: Public API key (safe for client-side use)
- `SUPABASE_SERVICE_ROLE_KEY`: Admin API key (server-side only, never expose)
- `DATABASE_URL`: PostgreSQL connection string for Prisma ORM

**Usage**:
- `SUPABASE_URL` and `SUPABASE_ANON_KEY`: Used by client-side applications (admin dashboard)
- `SUPABASE_SERVICE_ROLE_KEY`: Used by server-side API for admin operations
- `DATABASE_URL`: Used by Prisma for database migrations and queries

**Connection Example**:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)
```

## Shopify

### Shopify Admin API

```bash
SHOPIFY_API_KEY=<api-key>
SHOPIFY_API_SECRET=<api-secret>
SHOPIFY_ACCESS_TOKEN=<access-token>
SHOPIFY_STORE_URL=https://<store-name>.myshopify.com
SHOPIFY_WEBHOOK_SECRET=<webhook-secret>
```

**Format**:
- `SHOPIFY_API_KEY`: API key from Shopify Partners dashboard
- `SHOPIFY_API_SECRET`: API secret from Shopify Partners dashboard
- `SHOPIFY_ACCESS_TOKEN`: Access token for the specific store
- `SHOPIFY_STORE_URL`: Full URL to Shopify store
- `SHOPIFY_WEBHOOK_SECRET`: Secret for verifying webhook HMAC signatures

**Usage**:
- API key/secret: OAuth flow to generate access tokens
- Access token: Make authenticated API calls to Shopify Admin API
- Store URL: Base URL for all Shopify API requests
- Webhook secret: Verify incoming webhook signatures

**Connection Example**:
```typescript
const shopify = new Shopify({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecret: process.env.SHOPIFY_API_SECRET!,
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN!,
  storeUrl: process.env.SHOPIFY_STORE_URL!
})
```

**Webhook Verification**:
```typescript
import crypto from 'crypto'

function verifyWebhook(body: Buffer, signature: string): boolean {
  const hmac = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET!)
    .update(body)
    .digest('base64')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hmac))
}
```

## Flutterwave

### Flutterwave Payment Gateway

```bash
FLUTTERWAVE_SECRET_KEY=<secret-key>
FLUTTERWAVE_PUBLIC_KEY=<public-key>
FLUTTERWAVE_ENCRYPTION_KEY=<encryption-key>
FLUTTERWAVE_WEBHOOK_SECRET=<webhook-secret>
```

**Format**:
- `FLUTTERWAVE_SECRET_KEY`: Secret key for server-side operations
- `FLUTTERWAVE_PUBLIC_KEY`: Public key for client-side operations
- `FLUTTERWAVE_ENCRYPTION_KEY`: Encryption key for secure transactions
- `FLUTTERWAVE_WEBHOOK_SECRET`: Secret for verifying webhook signatures

**Usage**:
- Secret key: Make authenticated API calls to Flutterwave
- Public key: Initialize Flutterwave checkout on client-side
- Encryption key: Encrypt transaction data
- Webhook secret: Verify payment callback signatures

**Connection Example**:
```typescript
import Flutterwave from 'flutterwave-node-v3'

const flutterwave = new Flutterwave({
  publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY!,
  secretKey: process.env.FLUTTERWAVE_SECRET_KEY!,
  encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY!
})
```

## OpenAI

### OpenAI API (for UGC Engine)

```bash
OPENAI_API_KEY=<api-key>
OPENAI_ORG_ID=<organization-id>
OPENAI_IMAGE_MODEL=gpt-image-1
OPENAI_VIDEO_MODEL=sora
```

**Format**:
- `OPENAI_API_KEY`: API key from OpenAI platform
- `OPENAI_ORG_ID`: Organization ID (optional, for multi-org accounts)
- `OPENAI_IMAGE_MODEL`: Model for image generation (default: gpt-image-1)
- `OPENAI_VIDEO_MODEL`: Model for video generation (default: sora)

**Usage**:
- API key: Authenticate with OpenAI API
- Org ID: Route requests to specific organization
- Image model: Specify which model to use for image generation
- Video model: Specify which model to use for video generation

**Connection Example**:
```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  organization: process.env.OPENAI_ORG_ID
})
```

**Image Generation**:
```typescript
const image = await openai.images.generate({
  model: process.env.OPENAI_IMAGE_MODEL!,
  prompt: "A UGC-style photo of...",
  n: 1,
  size: "1024x1024"
})
```

## UGC Engine

### UGC Engine Configuration

```bash
UGC_DRIVER=fallback
UGC_OUTPUT_DIR=generated
UGC_EXPORT_DIR=exports
UGC_CHARACTER_DIR=characters
UGC_DAILY_GENERATION_CAP=50
UGC_RETRY_MAX_ATTEMPTS=5
UGC_RETRY_DELAY_MS=1000
```

**Format**:
- `UGC_DRIVER`: Generation driver (fallback, browser, api, mock)
- `UGC_OUTPUT_DIR`: Directory for generated assets
- `UGC_EXPORT_DIR`: Directory for exported assets
- `UGC_CHARACTER_DIR`: Directory for character identity packs
- `UGC_DAILY_GENERATION_CAP`: Maximum generations per day
- `UGC_RETRY_MAX_ATTEMPTS`: Maximum retry attempts for failed generations
- `UGC_RETRY_DELAY_MS`: Delay between retries in milliseconds

**Usage**:
- Driver: Select which generation backend to use
- Output directories: File system paths for asset storage
- Daily cap: Limit generation volume for cost control
- Retry settings: Configure retry behavior

**Driver Options**:
- `fallback`: Use FFmpeg placeholder generation (free, no API required)
- `browser`: Use browser automation (requires manual login, not automated)
- `api`: Use OpenAI API (requires OPENAI_API_KEY)
- `mock`: Use fixture files for testing

## Telegram

### Telegram Bot

```bash
TELEGRAM_BOT_TOKEN=<bot-token>
TELEGRAM_WEBHOOK_SECRET=<webhook-secret>
TELEGRAM_WEBHOOK_URL=https://api.zo.computer/v1/telegram/webhook
```

**Format**:
- `TELEGRAM_BOT_TOKEN`: Bot token from BotFather
- `TELEGRAM_WEBHOOK_SECRET`: Secret for webhook verification
- `TELEGRAM_WEBHOOK_URL`: URL to receive webhook updates

**Usage**:
- Bot token: Authenticate with Telegram Bot API
- Webhook secret: Verify incoming webhook requests
- Webhook URL: Endpoint to receive bot updates

**Connection Example**:
```typescript
import TelegramBot from 'node-telegram-bot-api'

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, {
  polling: false
})
bot.setWebHook(process.env.TELEGRAM_WEBHOOK_URL!)
```

## N8N

### N8N Workflow Automation

```bash
N8N_API_URL=https://n8n.shopwithin.com
N8N_API_KEY=<api-key>
N8N_WEBHOOK_URL=https://n8n.shopwithin.com/webhook
```

**Format**:
- `N8N_API_URL`: Base URL for N8N API
- `N8N_API_KEY`: API key for N8N authentication
- `N8N_WEBHOOK_URL`: Base URL for N8N webhooks

**Usage**:
- API URL: Base URL for all N8N API requests
- API key: Authenticate with N8N API
- Webhook URL: Base URL for triggering workflows via webhook

**Connection Example**:
```typescript
const response = await fetch(`${process.env.N8N_API_URL}/api/v1/workflows`, {
  headers: {
    'Authorization': `Bearer ${process.env.N8N_API_KEY!}`
  }
})
```

## Klaviyo

### Klaviyo Email Marketing

```bash
KLAVIYO_API_KEY=<api-key>
KLAVIYO_PUBLIC_KEY=<public-key>
KLAVIYO_LIST_ID=<list-id>
```

**Format**:
- `KLAVIYO_API_KEY`: Private API key for server-side operations
- `KLAVIYO_PUBLIC_KEY`: Public key for client-side operations
- `KLAVIYO_LIST_ID`: List ID for email campaigns

**Usage**:
- API key: Make authenticated API calls to Klaviyo
- Public key: Initialize Klaviyo on client-side
- List ID: Target list for email campaigns

**Connection Example**:
```typescript
import Klaviyo from 'klaviyo-api'

const klaviyo = new Klaviyo({
  apiKey: process.env.KLAVIYO_API_KEY!
})
```

## Printify

### Printify Print-on-Demand

```bash
PRINTIFY_API_KEY=<api-key>
PRINTIFY_SHOP_ID=<shop-id>
```

**Format**:
- `PRINTIFY_API_KEY`: API key from Printify dashboard
- `PRINTIFY_SHOP_ID`: Shop ID in Printify

**Usage**:
- API key: Authenticate with Printify API
- Shop ID: Target specific Printify shop

**Connection Example**:
```typescript
import Printify from 'printify-sdk'

const printify = new Printify({
  apiKey: process.env.PRINTIFY_API_KEY!,
  shopId: process.env.PRINTIFY_SHOP_ID!
})
```

## Loox

### Loox Reviews

```bash
LOOX_API_KEY=<api-key>
LOOX_STORE_ID=<store-id>
```

**Format**:
- `LOOX_API_KEY`: API key from Loox dashboard
- `LOOX_STORE_ID`: Store ID in Loox

**Usage**:
- API key: Authenticate with Loox API
- Store ID: Target specific store

## Vitals

### Vitals Conversion Tools

```bash
VITALS_API_KEY=<api-key>
VITALS_STORE_ID=<store-id>
```

**Format**:
- `VITALS_API_KEY`: API key from Vitals dashboard
- `VITALS_STORE_ID`: Store ID in Vitals

**Usage**:
- API key: Authenticate with Vitals API
- Store ID: Target specific store

## Application Configuration

### Node.js Application

```bash
NODE_ENV=production
PORT=4000
LOG_LEVEL=info
```

**Format**:
- `NODE_ENV`: Environment (development, staging, production)
- `PORT`: Port number for API server
- `LOG_LEVEL`: Logging level (debug, info, warn, error)

**Usage**:
- NODE_ENV: Configure application behavior per environment
- PORT: Server listening port
- LOG_LEVEL: Control logging verbosity

### Monitoring

```bash
SENTRY_DSN=<sentry-dsn>
SENTRY_ENVIRONMENT=production
```

**Format**:
- `SENTRY_DSN`: Sentry data source name
- `SENTRY_ENVIRONMENT`: Sentry environment name

**Usage**:
- DSN: Connect to Sentry for error tracking
- Environment: Tag errors with environment

## Security

### JWT Secrets

```bash
JWT_SECRET=<jwt-secret>
JWT_EXPIRES_IN=7d
```

**Format**:
- `JWT_SECRET`: Secret for JWT token signing
- `JWT_EXPIRES_IN`: Token expiration time

**Usage**:
- JWT secret: Sign and verify JWT tokens
- Expires in: Set token lifetime

### Encryption

```bash
ENCRYPTION_KEY=<encryption-key>
```

**Format**:
- `ENCRYPTION_KEY`: Key for encrypting sensitive data

**Usage**:
- Encryption key: Encrypt/decrypt sensitive data in database

## Feature Flags

### Safety Flags

```bash
AUTO_FULFILLMENT_ENABLED=false
PAID_ADS_ENABLED=false
AI_AUTO_PUBLISH_ENABLED=false
SHOPIFY_LIVE_WRITE_ENABLED=false
SUPPLIER_AUTO_PAY_ENABLED=false
CUSTOMER_AI_AUTO_REPLY_ENABLED=false
```

**Format**: Boolean (true/false)

**Usage**:
- `AUTO_FULFILLMENT_ENABLED`: Enable automatic order fulfillment
- `PAID_ADS_ENABLED`: Enable paid ad campaigns
- `AI_AUTO_PUBLISH_ENABLED`: Enable automatic AI product publishing
- `SHOPIFY_LIVE_WRITE_ENABLED`: Enable live writes to Shopify
- `SUPPLIER_AUTO_PAY_ENABLED`: Enable automatic supplier payments
- `CUSTOMER_AI_AUTO_REPLY_ENABLED`: Enable AI customer support replies

**Default**: All `false` for safety

## Budget Controls

### NGN Budget

```bash
VALIDATION_BUDGET_NGN=50000
LAUNCH_BUDGET_NGN=50000
PAID_ADS_DAILY_CAP_NGN=5000
```

**Format**: Integer (NGN amount)

**Usage**:
- `VALIDATION_BUDGET_NGN`: Total validation budget
- `LAUNCH_BUDGET_NGN`: Total launch budget
- `PAID_ADS_DAILY_CAP_NGN`: Daily cap for paid ads

## File Storage

### S3/Cloudflare R2

```bash
S3_BUCKET_NAME=<bucket-name>
S3_ACCESS_KEY=<access-key>
S3_SECRET_KEY=<secret-key>
S3_REGION=<region>
S3_ENDPOINT=<endpoint-url>
```

**Format**:
- `S3_BUCKET_NAME`: Bucket name
- `S3_ACCESS_KEY`: Access key ID
- `S3_SECRET_KEY`: Secret access key
- `S3_REGION`: AWS region or custom region
- `S3_ENDPOINT`: Custom endpoint (for Cloudflare R2)

**Usage**:
- Bucket: Target storage bucket
- Access keys: Authenticate with S3-compatible API
- Region/Endpoint: Specify storage location

**Connection Example**:
```typescript
import { S3Client } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: process.env.S3_REGION!,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!
  }
})
```

## Redis

### Redis Cache

```bash
REDIS_URL=redis://<host>:<port>
REDIS_PASSWORD=<password>
```

**Format**:
- `REDIS_URL`: Full Redis connection URL
- `REDIS_PASSWORD`: Redis password (if required)

**Usage**:
- Redis URL: Connect to Redis for caching and job queues
- Password: Authenticate with Redis

**Connection Example**:
```typescript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!, {
  password: process.env.REDIS_PASSWORD
})
```

## Complete .env Example

```bash
# ============================================
# Supabase (Database)
# ============================================
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:xxxxxxxxxxxxx@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# ============================================
# Shopify
# ============================================
SHOPIFY_API_KEY=xxxxxxxxxxxxxxxx
SHOPIFY_API_SECRET=xxxxxxxxxxxxxxxx
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxx
SHOPIFY_STORE_URL=https://shopwithin.myshopify.com
SHOPIFY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxx

# ============================================
# Flutterwave
# ============================================
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxxxxxxxxxxxxx
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxxxxxx
FLUTTERWAVE_ENCRYPTION_KEY=xxxxxxxxxxxxxxxx
FLUTTERWAVE_WEBHOOK_SECRET=xxxxxxxxxxxxxxxx

# ============================================
# OpenAI (UGC Engine)
# ============================================
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
OPENAI_ORG_ID=org-xxxxxxxxxxxxxxxx
OPENAI_IMAGE_MODEL=gpt-image-1
OPENAI_VIDEO_MODEL=sora

# ============================================
# UGC Engine
# ============================================
UGC_DRIVER=fallback
UGC_OUTPUT_DIR=generated
UGC_EXPORT_DIR=exports
UGC_CHARACTER_DIR=characters
UGC_DAILY_GENERATION_CAP=50
UGC_RETRY_MAX_ATTEMPTS=5
UGC_RETRY_DELAY_MS=1000

# ============================================
# Telegram (ZOO Computer)
# ============================================
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_WEBHOOK_SECRET=xxxxxxxxxxxxxxxx
TELEGRAM_WEBHOOK_URL=https://api.zo.computer/v1/telegram/webhook

# ============================================
# N8N
# ============================================
N8N_API_URL=https://n8n.shopwithin.com
N8N_API_KEY=xxxxxxxxxxxxxxxx
N8N_WEBHOOK_URL=https://n8n.shopwithin.com/webhook

# ============================================
# Klaviyo
# ============================================
KLAVIYO_API_KEY=pk_xxxxxxxxxxxxxx
KLAVIYO_PUBLIC_KEY=pk_xxxxxxxxxxxxxx
KLAVIYO_LIST_ID=xxxxxxxxxxxxxxxx

# ============================================
# Printify
# ============================================
PRINTIFY_API_KEY=xxxxxxxxxxxxxxxx
PRINTIFY_SHOP_ID=xxxxxxxxxxxxxxxx

# ============================================
# Loox
# ============================================
LOOX_API_KEY=xxxxxxxxxxxxxxxx
LOOX_STORE_ID=xxxxxxxxxxxxxxxx

# ============================================
# Vitals
# ============================================
VITALS_API_KEY=xxxxxxxxxxxxxxxx
VITALS_STORE_ID=xxxxxxxxxxxxxxxx

# ============================================
# Application
# ============================================
NODE_ENV=production
PORT=4000
LOG_LEVEL=info

# ============================================
# Monitoring
# ============================================
SENTRY_DSN=https://xxxxxxxxxxxxx@sentry.io/xxxxxxx
SENTRY_ENVIRONMENT=production

# ============================================
# Security
# ============================================
JWT_SECRET=xxxxxxxxxxxxxxxx
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=xxxxxxxxxxxxxxxx

# ============================================
# Feature Flags
# ============================================
AUTO_FULFILLMENT_ENABLED=false
PAID_ADS_ENABLED=false
AI_AUTO_PUBLISH_ENABLED=false
SHOPIFY_LIVE_WRITE_ENABLED=false
SUPPLIER_AUTO_PAY_ENABLED=false
CUSTOMER_AI_AUTO_REPLY_ENABLED=false

# ============================================
# Budget Controls
# ============================================
VALIDATION_BUDGET_NGN=50000
LAUNCH_BUDGET_NGN=50000
PAID_ADS_DAILY_CAP_NGN=5000

# ============================================
# File Storage (S3/Cloudflare R2)
# ============================================
S3_BUCKET_NAME=dropship-os-assets
S3_ACCESS_KEY=xxxxxxxxxxxxxxxx
S3_SECRET_KEY=xxxxxxxxxxxxxxxx
S3_REGION=auto
S3_ENDPOINT=https://xxxxxxxxxxxxx.r2.cloudflarestorage.com

# ============================================
# Redis
# ============================================
REDIS_URL=redis://xxxxxxxxxxxxx:6379
REDIS_PASSWORD=xxxxxxxxxxxxxxxx
```

## Environment Variable Validation

### Validation Rules

1. **Required Variables**: Must be present and non-empty
2. **Format Validation**: Must match expected format (URL, key format, etc.)
3. **Connection Validation**: Must be able to establish connection
4. **Permission Validation**: Must have required permissions

### Validation Script

```typescript
import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),

  // Shopify
  SHOPIFY_API_KEY: z.string().min(1),
  SHOPIFY_API_SECRET: z.string().min(1),
  SHOPIFY_ACCESS_TOKEN: z.string().min(1),
  SHOPIFY_STORE_URL: z.string().url(),
  SHOPIFY_WEBHOOK_SECRET: z.string().min(1),

  // Flutterwave
  FLUTTERWAVE_SECRET_KEY: z.string().min(1),
  FLUTTERWAVE_PUBLIC_KEY: z.string().min(1),
  FLUTTERWAVE_ENCRYPTION_KEY: z.string().min(1),
  FLUTTERWAVE_WEBHOOK_SECRET: z.string().min(1),

  // OpenAI
  OPENAI_API_KEY: z.string().startsWith('sk-'),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string().regex(/^\d+:[A-Za-z0-9_-]+$/),

  // Application
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']),
})

function validateEnv() {
  try {
    const env = envSchema.parse(process.env)
    console.log('✅ Environment variables validated')
    return env
  } catch (error) {
    console.error('❌ Environment variable validation failed:', error)
    process.exit(1)
  }
}

validateEnv()
```

## Agent Usage Guide

### Loading Environment Variables

The agent should load environment variables at startup:

```typescript
import dotenv from 'dotenv'

// Load from .env file
dotenv.config()

// Access variables
const supabaseUrl = process.env.SUPABASE_URL
const shopifyToken = process.env.SHOPIFY_ACCESS_TOKEN
```

### Validating Connections

The agent should validate all connections on startup:

```typescript
async function validateConnections() {
  // Validate Supabase
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
  const { error } = await supabase.from('_test_connection').select('*').limit(1)
  if (error) throw new Error(`Supabase connection failed: ${error.message}`)

  // Validate Shopify
  const shopifyResponse = await fetch(`${process.env.SHOPIFY_STORE_URL!}/admin/api/shop.json`, {
    headers: {
      'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!
    }
  })
  if (!shopifyResponse.ok) throw new Error('Shopify connection failed')

  console.log('✅ All connections validated')
}
```

### Using Variables in Requests

The agent should use environment variables in API requests:

```typescript
async function createShopifyProduct(product: Product) {
  const response = await fetch(
    `${process.env.SHOPIFY_STORE_URL!}/admin/api/products.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ product })
    }
  )
  return response.json()
}
```

### Error Handling

The agent should handle missing or invalid environment variables:

```typescript
function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Required environment variable ${key} is missing`)
  }
  return value
}

// Usage
const shopifyToken = getRequiredEnv('SHOPIFY_ACCESS_TOKEN')
```

## Security Best Practices

1. **Never commit .env files**: Add .env to .gitignore
2. **Use different keys per environment**: Development, staging, production
3. **Rotate keys regularly**: Update keys periodically
4. **Use principle of least privilege**: Only grant required permissions
5. **Monitor key usage**: Track API key usage and anomalies
6. **Revoke compromised keys**: Immediately revoke if compromised
7. **Use secrets management**: Store secrets in vault (HashiCorp Vault, AWS Secrets Manager) for production

## Troubleshooting

### Common Issues

**Issue**: Connection refused
- **Solution**: Check URL format, network connectivity, firewall rules

**Issue**: Authentication failed
- **Solution**: Verify API key is correct, not expired, has required permissions

**Issue**: Webhook verification failed
- **Solution**: Check webhook secret matches, verify HMAC signature calculation

**Issue**: Rate limit exceeded
- **Solution**: Implement exponential backoff, reduce request frequency

**Issue**: Invalid environment variable format
- **Solution**: Check variable format matches expected pattern (URL, key format, etc.)

## Next Steps for Agent

1. **Load environment variables** from .env file or secrets manager
2. **Validate all variables** using validation schema
3. **Test all connections** on startup
4. **Use variables in all API requests**
5. **Handle errors gracefully** with clear error messages
6. **Log variable usage** for debugging
7. **Monitor key usage** for security
