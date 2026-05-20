# Shopify Setup Guide

1. Create a new Shopify store separate from RiseWithin.
2. Set store currency to `USD`.
3. Configure Markets for US, UK, Canada, Europe, and Australia. Use market presentation and localized URLs where available, but keep USD checkout as the reliable default unless Shopify Payments or Adyen becomes available.
4. Install the Flutterwave payment app in test mode.
5. Install Zendrop first, then Spocket and CJ only after the first product pipeline is validated.
6. Install Klaviyo, AfterSell, Judge.me, and Shopify Inbox.
7. Duplicate the live theme before importing `infra/shopify-theme`.
8. Upload the theme files through Shopify CLI or theme editor.
9. Create product metafields:
   - `custom.ugc_video_url`: single-line URL.
   - `custom.faq_json`: JSON list with `question` and `answer`.
10. Register webhooks:
   - `orders/paid` -> `/webhooks/shopify/orders-paid`
   - `orders/cancelled` -> `/webhooks/shopify/orders-cancelled`
   - `refunds/create` -> `/webhooks/shopify/refunds-create`
11. Confirm webhook HMAC test delivery succeeds.
12. Keep `SHOPIFY_LIVE_WRITE_ENABLED=false` until staging product draft creation passes.

## shopwithin Activation Record

- Store name: `shopwithin`
- Domain: `mxu168-9g.myshopify.com`
- Currency: `USD`
- Payment provider: `Flutterwave - Africa Payments`
- Payment provider state: active in test mode
- PayPal: skipped
- Stripe: disabled
- Product: `FurLift Reusable Pet Hair Detailer`
- Product handle: `furlift-reusable-pet-hair-detailer`
- SKU: `VLOY30HZN`
- Price: `$24.95 USD`
- Zendrop candidate: product `1974580`, variant `New Blue`, supplier SKU `VLOY30HZN`
- Shopify shipping profile: `Zendrop`, with FurLift assigned.
- Current live theme: `Horizon`
- Uploaded draft theme: `dropship-os-theme`

Do not publish the draft theme until mobile product-page QA passes and the operator approves the live theme switch.

## shopwithin Checkout Evidence

- Storefront product status: sellable after assigning FurLift to the `Zendrop` shipping profile.
- US market: active.
- US checkout shipping: `[Free Shipping]`.
- Payment method shown at checkout: `Flutterwave`.
- Flutterwave hosted checkout opens in test mode for `USD 24.95`.
- Flutterwave test checkout completed.
- Confirmation: `YZHGPFMK3`.
- Shopify order: `#1001`, ID `7122424365337`.
- Dropship OS persisted the paid order and held fulfillment routing.
- Zendrop imported order `#1001` and mapped it to SKU `VLOY30HZN`, variant `New Blue`.
- Zendrop payment stayed `Unpaid`; no supplier payment or fulfillment was triggered.
- Shopify notifications are present for order confirmation, shipping confirmation, shipping update, out for delivery, and delivered events.
- Sender email still uses a Gmail address. Shopify warns public sender domains can show customers `store+100605853977@shopifyemail.com`; use a branded sender domain before real traffic.

## Theme QA
- Mobile product first viewport shows product, price, trust note, and CTA.
- Sticky CTA appears only after scroll.
- UGC video loads with `preload=metadata`.
- JSON-LD validates as Product schema.
- No app script is installed globally unless it directly supports conversion, tracking, or support.
