# Zendrop Setup

This store uses Zendrop through the supported Shopify-connected workflow.

The OS does not place live Zendrop orders through an invented backend API. Shopify paid orders sync into Zendrop after the Zendrop Shopify app is connected, products are linked in Zendrop, and fulfillment is approved from the Zendrop dashboard.

## Store Connection

1. Log in to Zendrop.
2. Connect the standalone Shopify store `mxu168-9g.myshopify.com` (`shopwithin`).
3. Confirm the store appears in Zendrop as the active store.
4. Keep Zendrop Auto-Fulfillment off for the first live orders.
5. Keep `SUPPLIER_AUTO_PAY_ENABLED=false` in `.env`.

## Shopify Billing Gate

If Shopify opens an app subscription or usage-cap approval screen and the approval button is disabled because the store has no billing method, stop the flow.

Do not add a billing method just to complete staging setup. Record the state as a fulfillment blocker through `/internal/fulfillment/status`, keep `SUPPLIER_AUTO_PAY_ENABLED=false`, and leave the product unverified until Zendrop is connected by an operator who has explicitly accepted the Shopify app billing terms.

The launch readiness check treats this as a critical fulfillment blocker because checkout health is not the same thing as supplier readiness.

## FurLift Product Link

Use the Zendrop dashboard to link:

- Shopify product: `FurLift Reusable Pet Hair Detailer`
- Shopify handle: `furlift-reusable-pet-hair-detailer`
- Shopify product ID: `10628065001753`
- Shopify variant ID: `52404939948313`
- Shopify SKU: `VLOY30HZN`
- Supplier: `zendrop`
- Zendrop product URL: `https://app.zendrop.com/product/1974580`
- Zendrop product ID: `1974580`
- Zendrop product title: `Portable Fabric and Pet Hair Remover`
- Zendrop variant: `New Blue`
- Supplier SKU: `VLOY30HZN`
- Retail price: `$24.95 USD`
- Product cost evidence: `$1.49-$1.55 USD`; the order row showed `$1.49`, and the current SKU modal showed `$1.55`.
- Shipping cost evidence: `$4.79 USD`
- Current verified market evidence: United States, average shipping time 8 days
- Shopify inventory evidence: `50,000` placeholder inventory from Zendrop, not real-time factory inventory
- Shopify shipping profile evidence: FurLift is assigned to the `Zendrop` shipping profile. If this profile shows `0 products`, Shopify can mark the storefront product as sold out even when inventory is visible at the Zendrop app location.

Record the verified link through:

```bash
curl -X POST "$API_PUBLIC_URL/internal/suppliers/product-links" \
  -H "content-type: application/json" \
  -d '{
    "productHandle": "furlift-reusable-pet-hair-detailer",
    "shopifyProductId": "10628065001753",
    "shopifyVariantId": "52404939948313",
    "shopifySku": "VLOY30HZN",
    "supplier": "zendrop",
    "supplierProductId": "1974580",
    "supplierSku": "VLOY30HZN",
    "supplierProductUrl": "https://app.zendrop.com/product/1974580",
    "productCostUsd": 1.491,
    "shippingCostUsd": 4.79,
    "retailPriceUsd": 24.95,
    "estimatedDeliveryMinDays": 8,
    "estimatedDeliveryMaxDays": 8,
    "shipsFrom": "Zendrop fulfillment network; origin not shown in dashboard evidence",
    "shipsTo": ["US"],
    "inventoryState": "unknown",
    "inventoryQuantity": 50000,
    "trackingSyncSupported": false,
    "shippingProfile": "Zendrop tracked standard",
    "verificationStatus": "pending",
    "verificationSource": "zendrop_dashboard",
    "marginEstimatePercent": 74.83,
    "rawPayload": {
      "evidence": "Shopify and Zendrop dashboards match product ID, variant ID, SKU, price, US shipping, cost, and shipping estimate. Tracking sync and real factory inventory are not independently verified yet."
    }
  }'
```

Keep the link pending until tracking sync and order visibility are verified with a real paid Shopify order. The API rejects non-Zendrop product URLs, unknown inventory, missing SKU mapping, missing tracking support, and delivery windows that are too slow.

## Sold-Out Troubleshooting

If FurLift shows `Unavailable` or `Sold out` on the Shopify storefront:

1. Open `Settings > Shipping and delivery`.
2. Open the `Zendrop` shipping profile.
3. Confirm `Products` includes `FurLift Reusable Pet Hair Detailer`.
4. Confirm the fulfillment location is `Zendrop`.
5. Confirm the shipping zone/rate covers the target market, starting with United States.
6. Save the profile, then reload the product page.

For `shopwithin`, the verified fix was moving FurLift from the general profile into the `Zendrop` shipping profile. After saving, the storefront showed `Add to cart` and `Buy it now`.

## Order Visibility Check

After a Shopify paid order appears in Zendrop:

```bash
curl -X POST "$API_PUBLIC_URL/internal/suppliers/order-visibility" \
  -H "content-type: application/json" \
  -d '{
    "shopifyOrderId": "7122424365337",
    "productHandle": "furlift-reusable-pet-hair-detailer",
    "shopifySku": "VLOY30HZN",
    "supplier": "zendrop",
    "supplierProductId": "1974580",
    "visibleInZendrop": true,
    "linkedProductCorrect": true,
    "fulfillmentEligible": true,
    "zendropOrderStatus": "unfulfilled_unpaid"
  }'
```

The OS records the order as `linked` only when the Shopify order is visible in Zendrop, the linked Zendrop product is correct, and the order is eligible for fulfillment.

## shopwithin Order Visibility Evidence

Verified on `shopwithin`:

- Shopify order: `#1001`
- Shopify order ID: `7122424365337`
- Shopify confirmation: `YZHGPFMK3`
- Customer name used for staging checkout: `Staging Buyer`
- Zendrop Orders page shows total orders `1`, unfulfilled `1`.
- Zendrop row shows order `#1001`, date `5/18/2026`, customer order `Received`, Zendrop payment `Unpaid`, order status `Unfulfilled`.
- Expanded Zendrop row shows product `Portable Fabric and Pet Hair Remover`, SKU `VLOY30HZN`, variant `New Blue`, quantity `1`, unit cost `$1.49`, and order total `$6.48`.
- Zendrop product page shows product `1974580`, `US shipping`, selected variant `New Blue`, SKU `VLOY30HZN`, and average shipping time `8 days`.
- Zendrop shows a `Fulfill` action, but it was not clicked.
- No supplier payment was made.
- Dropship OS recorded order visibility as `linked` for order `7122424365337`.
- The supplier product link remains blocked on `supplier_tracking_sync_not_verified`; this is intentional until a real tracking number is observed and synced.

## First Live Order Rule

The first live customer order must be manually approved and manually fulfilled from Zendrop. Do not turn on Auto-Fulfillment until at least one full delivery lifecycle has been observed from paid order to delivered tracking state.
