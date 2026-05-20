# Paid Ads Safety SOP

## Non-Negotiables

- Do not launch ads automatically.
- Do not enter card details for the operator.
- Do not enable auto-spend rules.
- Do not use automatic budget scaling.
- Do not change `PAID_ADS_ENABLED=false` without explicit operator approval.
- Do not run broad Meta cold traffic before organic proof.

## Account Safety

- Use one business manager/business center per store.
- Use admin access for the operator only.
- Use 2FA on TikTok, Meta, Facebook, and Instagram accounts.
- Keep payment methods under operator control.
- Avoid logging in from many countries/devices in a short period.
- Do not use misleading claims in ads.

## Spend Safety

- Start with draft campaigns.
- Set daily budgets at the ad-set/ad-group level where possible.
- Use manual review before publishing.
- Check billing currency before launch.
- Check campaign status after every edit.

## Stop Conditions

Pause immediately if:

- Pixel purchase event fires without a real order.
- Purchase event fires twice for one order.
- Shopify checkout breaks.
- Flutterwave payment success does not match Shopify order status.
- Comments flag shipping, trust, refund, or product quality concerns.

