# Supabase Deployment Guide — Dropship OS

## Overview

This guide provides complete instructions for deploying Dropship OS using Supabase as the backend infrastructure. Supabase provides a managed PostgreSQL database, authentication, real-time subscriptions, and edge functions, making it an ideal backend for the Dropship OS ecosystem.

## Why Supabase Instead of Railway?

**Advantages of Supabase**:
- **Managed PostgreSQL**: No database maintenance required
- **Built-in Authentication**: User authentication out of the box
- **Real-time Subscriptions**: Live data updates without polling
- **Edge Functions**: Serverless functions close to users
- **Storage**: Built-in file storage (S3-compatible)
- **Row Level Security**: Fine-grained access control
- **API Auto-generated**: REST and GraphQL APIs from database schema
- **Free Tier**: Generous free tier for development and small production
- **Dashboard**: Visual interface for database management

**Cost Comparison**:
- **Railway**: $15-50/month (PostgreSQL + Redis + app hosting)
- **Supabase**: $0-25/month (PostgreSQL + Auth + Storage + Edge Functions)

## Architecture with Supabase

```
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Project                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ PostgreSQL   │  │  Auth        │  │  Storage     │    │
│  │ (Database)   │  │  (Users)     │  │  (Files)     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼───────┐                         │
│                    │  REST API    │                         │
│                    │  (Auto-gen)   │                         │
│                    └───────────────┘                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Dropship OS                               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  API         │  │  Admin       │  │  UGC Engine  │    │
│  │  (Fastify)    │  │  (Next.js)   │  │  (CLI)       │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Create Supabase Project

### 1.1 Sign Up for Supabase

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or email
4. Verify your email

### 1.2 Create New Project

1. Click "New Project"
2. Configure project:
   - **Name**: `dropship-os`
   - **Database Password**: Generate strong password (save securely)
   - **Region**: Choose region closest to your users (e.g., `US East`, `EU West`)
   - **Pricing Plan**: Free tier (or Pro if needed)

3. Click "Create new project"
4. Wait for project to be provisioned (2-3 minutes)

### 1.3 Get Project Credentials

1. Go to Project Settings → API
2. Copy the following credentials:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role secret**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. Save these credentials securely (password manager, environment variables)

### 1.4 Get Database Connection String

1. Go to Project Settings → Database
2. Copy the **Connection string** (URI format)
3. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres`

## Step 2: Configure Prisma for Supabase

### 2.1 Update Prisma Schema

The existing Prisma schema in `apps/api/prisma/schema.prisma` is compatible with Supabase PostgreSQL. No changes needed.

### 2.2 Update .env File

Add Supabase environment variables to `.env`:

```bash
# Supabase
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

### 2.3 Test Database Connection

```bash
cd /Users/mac/Desktop/Risewithin\ Shopify/dropship-os
pnpm --filter @dropship-os/api run db:push
```

This will push the Prisma schema to Supabase PostgreSQL.

## Step 3: Run Database Migrations

### 3.1 Generate Prisma Client

```bash
pnpm --filter @dropship-os/api run db:generate
```

### 3.2 Push Schema to Supabase

```bash
pnpm --filter @dropship-os/api run db:push
```

This creates all tables in Supabase PostgreSQL based on the Prisma schema.

### 3.3 Verify Tables in Supabase

1. Go to Supabase Dashboard → Table Editor
2. Verify all tables are created:
   - `candidates`
   - `suppliers`
   - `products`
   - `orders`
   - `jobs`
   - `events`
   - `profit_snapshots`
   - `audit_logs`

## Step 4: Enable Row Level Security (RLS)

### 4.1 Enable RLS on Tables

In Supabase SQL Editor, run:

```sql
-- Enable RLS on all tables
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

### 4.2 Create RLS Policies

Create policies to allow service role to bypass RLS (for API):

```sql
-- Allow service role to bypass RLS
CREATE POLICY "Service role can do anything" ON candidates
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do anything" ON suppliers
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do anything" ON products
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do anything" ON orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do anything" ON jobs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do anything" ON events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do anything" ON profit_snapshots
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do anything" ON audit_logs
  FOR ALL USING (auth.role() = 'service_role');
```

## Step 5: Set Up Supabase Storage

### 5.1 Create Storage Buckets

In Supabase Dashboard → Storage, create buckets:

1. **UGC Assets**: `ugc-assets`
   - Public: true (for serving creatives)
   - File size limit: 50MB
   - Allowed MIME types: image/*, video/*

2. **Product Images**: `product-images`
   - Public: true
   - File size limit: 10MB
   - Allowed MIME types: image/*

3. **Documents**: `documents`
   - Public: false
   - File size limit: 10MB
   - Allowed MIME types: application/pdf, application/json

### 5.2 Configure Storage Policies

```sql
-- Allow public read on ugc-assets
CREATE POLICY "Public read access on ugc-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'ugc-assets');

-- Allow service role to upload to ugc-assets
CREATE POLICY "Service role can upload to ugc-assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'ugc-assets' AND auth.role() = 'service_role');

-- Allow public read on product-images
CREATE POLICY "Public read access on product-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow service role to upload to product-images
CREATE POLICY "Service role can upload to product-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'service_role');
```

### 5.3 Get Storage URL

The storage URL format is:
```
https://xxxxxxxxxxxxx.supabase.co/storage/v1/object/<bucket-name>/<file-path>
```

Add to `.env`:
```bash
SUPABASE_STORAGE_URL=https://xxxxxxxxxxxxx.supabase.co/storage/v1/object
```

## Step 6: Deploy API to Vercel (or Supabase Edge Functions)

### Option 1: Vercel (Recommended for API)

1. Connect GitHub repository to Vercel
2. Configure build settings:
   - **Root Directory**: `apps/api`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

3. Add environment variables in Vercel:
   - All Supabase variables
   - Shopify credentials
   - Flutterwave credentials
   - OpenAI API key
   - All other variables from `.env`

4. Deploy

### Option 2: Supabase Edge Functions

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link to Supabase project:
```bash
supabase link --project-ref xxxxxxxxxxxxxx
```

3. Create edge function:
```bash
supabase functions new dropship-api
```

4. Copy API code to `supabase/functions/dropship-api/index.ts`

5. Deploy:
```bash
supabase functions deploy dropship-api
```

## Step 7: Deploy Admin Dashboard to Vercel

1. Connect GitHub repository to Vercel
2. Configure build settings:
   - **Root Directory**: `apps/admin`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

3. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Other public variables

4. Deploy

## Step 8: Configure Real-time Subscriptions (Optional)

### 8.1 Enable Real-time on Tables

In Supabase SQL Editor:

```sql
-- Enable real-time on orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Enable real-time on products table
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- Enable real-time on jobs table
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
```

### 8.2 Subscribe to Changes in API

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// Subscribe to new orders
supabase
  .channel('orders')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
    console.log('New order:', payload.new)
    // Trigger order routing job
  })
  .subscribe()
```

## Step 9: Set Up Supabase Auth (Optional for Admin)

### 9.1 Enable Email Auth

In Supabase Dashboard → Authentication:
1. Enable email provider
2. Configure email templates
3. Set up SMTP (optional, for custom email)

### 9.2 Create Admin User

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const { data, error } = await supabase.auth.admin.createUser({
  email: 'admin@shopwithin.com',
  password: 'secure-password',
  email_confirm: true
})
```

### 9.3 Protect Admin Routes

```typescript
// In Next.js middleware
import { createServerClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { req, res }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session && req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}
```

## Step 10: Configure Webhooks

### 10.1 Shopify Webhooks

1. In Shopify Admin → Settings → Notifications → Webhooks
2. Add webhook for each event:
   - `orders/create`
   - `orders/paid`
   - `orders/updated`
   - `products/create`
   - `products/update`
   - `inventory_levels/update`

3. Webhook URL: `https://your-api-url.vercel.app/webhooks/shopify`
4. Webhook secret: Set and add to `.env` as `SHOPIFY_WEBHOOK_SECRET`

### 10.2 Flutterwave Webhooks

1. In Flutterwave Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-api-url.vercel.app/webhooks/flutterwave`
3. Set secret and add to `.env` as `FLUTTERWAVE_WEBHOOK_SECRET`

### 10.3 Supplier Webhooks

Configure supplier-specific webhooks based on their documentation.

## Step 11: Deploy N8N (Optional)

### Option 1: Supabase Edge Functions

1. Create edge function for N8N:
```bash
supabase functions new n8n-webhook
```

2. Configure as webhook receiver for N8N workflows

### Option 2: Self-Hosted N8N

1. Deploy N8N to Railway or VPS
2. Configure to call Supabase API endpoints
3. Import workflows from `/n8n/workflows/`

## Step 12: Monitor and Debug

### 12.1 Enable Logging

In Supabase Dashboard → Database → Logs:
- Enable query logs
- Enable slow query logs
- Set log retention

### 12.2 Set Up Alerts

In Supabase Dashboard → Alerts:
- Database CPU usage > 80%
- Database memory usage > 80%
- Failed auth attempts
- API errors

### 12.3 Use Supabase Studio

Supabase Studio provides:
- Table editor for direct data manipulation
- SQL editor for running queries
- Authentication UI for user management
- Storage browser for file management
- Real-time monitor for subscription debugging

## Step 13: Backup and Recovery

### 13.1 Enable Automated Backups

In Supabase Dashboard → Database → Backups:
- Enable daily backups (free tier: 7 days retention)
- Configure point-in-time recovery (Pro tier)

### 13.2 Manual Backup

```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Using pg_dump
pg_dump $DATABASE_URL > backup.sql
```

### 13.3 Restore from Backup

```bash
# Using Supabase CLI
supabase db reset -f backup.sql

# Using psql
psql $DATABASE_URL < backup.sql
```

## Cost Estimation

### Supabase Free Tier

- **Database**: 500MB
- **Auth**: 50,000 MAU
- **Storage**: 1GB
- **Edge Functions**: 500,000 invocations/month
- **Bandwidth**: 2GB

### Supabase Pro Tier (if needed)

- **Database**: $25/month for 8GB
- **Auth**: $25/month for 100,000 MAU
- **Storage**: $0.021/GB/month
- **Edge Functions**: $2/1M invocations
- **Bandwidth**: $0.09/GB

### Total Estimated Cost

- **Free Tier**: $0/month (suitable for development and small production)
- **Pro Tier**: $50-100/month (for scaling)

## Troubleshooting

### Common Issues

**Issue**: Connection refused
- **Solution**: Check Supabase project status, verify DATABASE_URL format

**Issue**: Migration failed
- **Solution**: Check Prisma schema compatibility, run `db:push` instead of `db:migrate`

**Issue**: RLS blocking queries
- **Solution**: Check RLS policies, ensure service role can bypass RLS

**Issue**: Storage upload failed
- **Solution**: Check storage policies, verify bucket exists

**Issue**: Real-time not working
- **Solution**: Enable real-time on tables, check subscription syntax

## Next Steps

1. **Complete Supabase setup**: Follow all steps above
2. **Deploy API**: Deploy to Vercel or Supabase Edge Functions
3. **Deploy Admin**: Deploy to Vercel
4. **Test all integrations**: Shopify, Flutterwave, suppliers
5. **Configure webhooks**: Set up all webhook endpoints
6. **Monitor performance**: Use Supabase dashboard
7. **Set up backups**: Enable automated backups
8. **Test disaster recovery**: Practice restore from backup

## Migration from Railway to Supabase

If you currently use Railway, here's how to migrate:

1. **Export data from Railway PostgreSQL**:
```bash
pg_dump $RAILWAY_DATABASE_URL > railway-backup.sql
```

2. **Import to Supabase**:
```bash
psql $SUPABASE_DATABASE_URL < railway-backup.sql
```

3. **Update environment variables**: Replace Railway URLs with Supabase URLs
4. **Redeploy applications**: Deploy with new environment variables
5. **Verify all functionality**: Test all features
6. **Cancel Railway subscription**: After verification period

## Summary

Using Supabase provides:
- ✅ Managed PostgreSQL (no maintenance)
- ✅ Built-in authentication
- ✅ Real-time subscriptions
- ✅ Edge functions
- ✅ File storage
- ✅ Row level security
- ✅ Auto-generated APIs
- ✅ Free tier for development
- ✅ Visual dashboard
- ✅ Lower cost than Railway

All Dropship OS components are compatible with Supabase PostgreSQL. The Prisma schema works without modification. The API and admin can be deployed to Vercel or Supabase Edge Functions.
