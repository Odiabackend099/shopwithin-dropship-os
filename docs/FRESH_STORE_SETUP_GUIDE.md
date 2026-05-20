# Fresh Shopify Store Setup Guide

This guide walks you through setting up the fresh Shopify trial account with the improved brand and Dropship OS integration.

## Phase 1: New Shopify Account Baseline

### Step 1: Log in to Fresh Shopify Account
1. Log in to your new Shopify trial account
2. Confirm trial status and duration (3-month $1 trial)
3. Record the store's `myshopify.com` domain
4. Note: Keep the store unpublished/password-protected until QA passes

### Step 2: Set Store Currency
1. Go to `Settings > Store details`
2. Set store currency to `USD`
3. Save changes

### Step 3: Configure Markets
1. Go to `Settings > Markets`
2. Enable markets for:
   - United States (primary)
   - United Kingdom
   - Canada
   - Europe (select major countries)
   - Australia
3. Use market presentation where available
4. Keep USD checkout as default for now
5. Save changes

### Step 4: Configure Shipping
1. Go to `Settings > Shipping and delivery`
2. Create shipping profile named "General"
3. Set up shipping zones:
   - US: 7-10 business days
   - International: 10-14 business days
4. Save changes

### Step 5: Store Details
1. Go to `Settings > Store details`
2. Set store name to "Shopwithin" (or your improved brand name)
3. Add store address (required for payments)
4. Set email for notifications
5. Save changes

## Phase 2: Brand Upgrade (Already Completed)

Brand foundation document created at `docs/FRESH_STORE_BRAND_FOUNDATION.md`
Theme files updated with:
- Improved hero messaging
- Trust badges section
- Enhanced navigation structure
- Footer with trust signals
- CSS updates for new layout

## Phase 3: Shopify App and API Setup

### Step 1: Create Custom App
1. Go to Shopify Partners Dashboard
2. Navigate to `Apps > Create app`
3. Select "Custom app"
4. Name it: "Dropship OS Integration"
5. Select the new store
6. Click "Create app"

### Step 2: Configure App Scopes
Configure the following Admin API scopes:
- `read_products` - Read products
- `write_products` - Create/update products
- `read_orders` - Read orders
- `write_orders` - Update orders
- `read_fulfillments` - Read fulfillments
- `write_fulfillments` - Create fulfillments
- `read_inventory` - Read inventory
- `write_inventory` - Update inventory
- `read_locations` - Read locations
- `read_shipping` - Read shipping

### Step 3: Generate Admin API Access Token
1. In the app configuration, go to "Admin API access"
2. Click "Install app"
3. Copy the Admin API access token
4. Save it securely - you'll need it for the `.env` file

### Step 4: Update Local Environment Variables
Update your `.env` file with the new store credentials:

```bash
# Shopify
SHOPIFY_SHOP_DOMAIN=your-new-store.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_your_new_token_here
SHOPIFY_API_VERSION=2026-04
SHOPIFY_WEBHOOK_SECRET=replace_with_shopify_app_secret
SHOPIFY_STORE_BASE_CURRENCY=USD
SHOPIFY_MARKETS_ENABLED=true
```

### Step 5: Keep Safety Flags Disabled
Ensure these remain `false` until staging passes:
```bash
SHOPIFY_LIVE_WRITE_ENABLED=false
AUTO_FULFILLMENT_ENABLED=false
SUPPLIER_AUTO_PAY_ENABLED=false
PAID_ADS_ENABLED=false
```

## Phase 4: Theme Setup

### Step 1: Upload Theme
1. Go to `Online Store > Themes`
2. In "Theme library", click "Add theme" > "Upload"
3. Upload `dist/theme/dropship-os-theme.zip`
4. The theme will appear as an unpublished draft

### Step 2: Preview Theme
1. Click "Preview" on the draft theme
2. Review on mobile and desktop
3. Check:
   - Navigation structure
   - Hero messaging
   - Trust badges display
   - Footer layout
   - Mobile responsiveness

### Step 3: Customize Theme (Optional)
1. In the theme editor, customize:
   - Store logo
   - Brand colors
   - Homepage sections
   - Product page layout
2. Save changes

### Step 4: Publish Theme
**DO NOT PUBLISH until:**
- Mobile QA passes
- Product page checkout flow works
- You approve the live theme switch

## Phase 5: Product and Supplier Staging

### Step 1: Create Product Metafields
1. Go to `Settings > Custom data > Products`
2. Create metafield:
   - Namespace: `custom`
   - Key: `ugc_video_url`
   - Type: Single line text
   - Description: UGC video URL for product page

3. Create another metafield:
   - Namespace: `custom`
   - Key: `faq_json`
   - Type: JSON
   - Description: FAQ questions and answers

### Step 2: Create Shipping Profile
1. Go to `Settings > Shipping and delivery`
2. Create shipping profile named "Zendrop" (or your supplier name)
3. Configure shipping rates for the profile
4. Save changes

### Step 3: Create Product Draft
1. Go to `Products > Add product`
2. Add your first product (start with one validated product)
3. Fill in:
   - Product title
   - Description
   - Price (in USD)
   - SKU
   - Inventory tracking
   - Shipping profile (assign to Zendrop profile)
4. Set status to "Draft"
5. Add product images
6. Add metafield values (UGC video URL, FAQ JSON)
7. Save product

### Step 4: Connect to Supplier
1. Install supplier app (Zendrop, Spocket, or CJ)
2. Connect the product to supplier
3. Map variants correctly
4. Verify pricing and availability
5. **DO NOT** enable auto-fulfillment yet

## Phase 6: Payment and Checkout Setup

### Step 1: Configure Payment Provider
1. Go to `Settings > Payments`
2. Install Flutterwave (or your preferred provider)
3. Configure in test mode first
4. Add test public key, secret key, and secret hash to `.env`:
```bash
FLUTTERWAVE_PUBLIC_KEY=your_test_public_key
FLUTTERWAVE_SECRET_KEY=your_test_secret_key
FLUTTERWAVE_SECRET_HASH=your_test_secret_hash
FLUTTERWAVE_TEST_MODE=true
```
5. Save changes

### Step 2: Test Checkout Flow
1. Make your product visible (change status from Draft to Active)
2. Go to storefront
3. Add product to cart
4. Proceed to checkout
5. Verify:
   - Shipping options display correctly
   - Payment provider appears
   - Test mode banner is visible
6. **DO NOT** complete real payment - use test mode only

## Phase 7: Webhooks and API Validation

### Step 1: Start Local API
```bash
pnpm dev
```

### Step 2: Expose API Publicly
1. Use ngrok or similar tunneling service
2. Get public URL (e.g., `https://your-tunnel.ngrok-free.dev`)
3. Update `.env`:
```bash
API_PUBLIC_URL=https://your-tunnel.ngrok-free.dev
```

### Step 3: Register Shopify Webhooks
1. Go to the custom app you created
2. Navigate to "Webhooks"
3. Create webhooks:
   - Topic: `orders/paid` → URL: `${API_PUBLIC_URL}/webhooks/shopify/orders-paid`
   - Topic: `orders/cancelled` → URL: `${API_PUBLIC_URL}/webhooks/shopify/orders-cancelled`
   - Topic: `refunds/create` → URL: `${API_PUBLIC_URL}/webhooks/shopify/refunds-create`
4. Set format to JSON
5. Set API version to `2026-04`
6. Save webhook secret to `.env`:
```bash
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_here
```

### Step 4: Run Validation Commands
```bash
pnpm run launch:check
pnpm run staging:product-smoke
pnpm run staging:order-smoke
pnpm run ci
```

## Phase 8: End-to-End Staging Order

### Step 1: Create Test Product
1. Ensure you have at least one active product
2. Verify it's assigned to the correct shipping profile
3. Check price is set correctly

### Step 2: Run Test Checkout
1. Go to storefront
2. Add product to cart
3. Proceed to checkout
4. Use test payment details
5. Complete test checkout

### Step 3: Verify Webhook
1. Check API logs for webhook receipt
2. Confirm order is persisted in database
3. Verify routing job status is `held` (not fulfilled)
4. Confirm no supplier order was created

### Step 4: Verify Shopify Order
1. Go to Shopify admin
2. Check Orders section
3. Verify test order appears
4. Confirm order status is "Paid"
5. Verify fulfillment is not completed

## Safety Checklist

Before going live, confirm:
- [ ] `SHOPIFY_LIVE_WRITE_ENABLED=false` during staging
- [ ] `AUTO_FULFILLMENT_ENABLED=false`
- [ ] `SUPPLIER_AUTO_PAY_ENABLED=false`
- [ ] `PAID_ADS_ENABLED=false`
- [ ] `FLUTTERWAVE_TEST_MODE=true` during testing
- [ ] No real card details used during testing
- [ ] Theme QA passes on mobile and desktop
- [ ] Webhook validation succeeds
- [ ] Test order flow works end-to-end
- [ ] Fulfillment remains safely held

## Troubleshooting

### Theme Upload Fails
- Ensure the ZIP file is not corrupted
- Check file size (Shopify limit: 50MB)
- Try re-packaging the theme

### Webhook Not Reaching API
- Check API is running locally
- Verify ngrok tunnel is active
- Confirm webhook URL is correct
- Check webhook secret matches

### Product Not Available on Storefront
- Check product status is "Active" (not Draft)
- Verify product is assigned to a shipping profile
- Check inventory tracking settings
- Verify product has at least one variant

### Payment Provider Not Showing
- Verify app is installed
- Check payment settings
- Confirm test mode is enabled
- Verify API keys are correct

## Next Steps After Staging

Once staging passes:
1. Update `docs/SHOPIFY_SETUP.md` with new store details
2. Update `docs/SHOPIFY_STAGING_RUNBOOK.md` with staging status
3. Update `docs/ZO_ENVIRONMENT_VARIABLES.md` if Zo needs the new values
4. Set `SHOPIFY_LIVE_WRITE_ENABLED=true` for production
5. Publish the theme
6. Enable real payments (disable test mode)
7. Monitor first real orders carefully
