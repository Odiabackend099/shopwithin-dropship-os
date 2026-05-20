# TikTok Account Checklist

| Item | Required State | Status |
| --- | --- | --- |
| Business Center | Connected for shopwithin | Connected through Shopify TikTok app |
| Ads Manager | Created under the same Business Center | Connected through Shopify TikTok app |
| Currency | USD if selectable | USD selected |
| Timezone | Chosen once and kept stable | Lagos Time selected |
| Payment method | Added only by operator | Not added by Codex |
| Pixel | Created and assigned to Shopify | Connected: Shopify pixel `1779121530`; observed pixel code `D85JQUJC77UBBEKNOSU0` |
| Shopify TikTok app | Connected to shopwithin | Installed and connected to TikTok For Business |
| Product catalog | FurLift visible with USD price | Storefront verified; catalog-side status still needs TikTok setup completion |
| Pageview/ViewContent | Fires on product page | `Pageview` observed from TikTok Shopify pixel |
| AddToCart | Fires on add-to-cart | `AddToCart` observed from TikTok Shopify pixel |
| InitiateCheckout | Fires on checkout start | Pending |
| CompletePayment | Fires after Flutterwave-paid order | Pending |
| Campaigns | Draft only, no spend | Not launched |
| Company/tax validation | Clear before funding | Blocked by TikTok response `CANNOT_PASS_TAX_VALIDATION_CHECK` after CAC/NRS Tax ID verification |

## Current Handoff

The open Shopify TikTok app tab is blocked on company information because TikTok returned `CANNOT_PASS_TAX_VALIDATION_CHECK`. Currency is `USD`, timezone is Lagos Time, data sharing is confirmed, and storefront pixel requests are firing.

The latest submitted address values were:

- State/Province: `Federal Capital Territory`
- City: `Abuja`
- Street address: `170 Golden Spring Estate`
- Postal code: `90001`, then retried as `900001`
- Are you an ad agency?: `No`
- Tax ID: verified through official CAC/iCRP and NRS Tax ID Portal, but not committed to this repo

Official registry checks found:

- CAC/iCRP public search result: `ODIADEV AI LTD`, `RC 8989175`, status `ACTIVE`, registered `Nov 11, 2025`.
- NRS Tax ID Portal corporate retrieval verified `ODIADEV AI LTD` by RC number and matched it to a Tax ID.
- Legacy FIRS/NRS TIN verification returned: `Kindly visit your taxoffice and register on TaxPro Max`.

TikTok still rejected the save with `CANNOT_PASS_TAX_VALIDATION_CHECK`, so the remaining blocker is TikTok-side tax validation, a missing TaxPro Max registration path, or a legal-name/address mismatch that the Shopify embedded TikTok screen does not expose. The visible Shopify TikTok company-information panel did not expose a legal business name field, so `ODIADEV AI LTD` could not be entered on that screen.

Direct `ads.tiktok.com` account settings returned HTTP `403` from this browser session, so the embedded Shopify TikTok setup remains the only accessible TikTok configuration surface for now.

The operator must personally resolve any required tax-office/TaxPro Max registration or TikTok account review. Do not add billing or launch campaigns until the blocker is cleared and checkout/purchase events are verified.
