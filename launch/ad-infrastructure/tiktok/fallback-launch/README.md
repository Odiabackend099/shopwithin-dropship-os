# TikTok Fallback Launch

Generated: 2026-05-18

## Situation

The Shopify-created TikTok Ads Manager path is blocked by TikTok company/tax validation. The store and pixel are not the blocker:

- Storefront is public.
- FurLift product page works.
- TikTok Pageview and AddToCart events fire through the Shopify TikTok pixel.
- Billing has not been touched.
- No ads have launched.

The blocker is advertiser account compliance:

```text
CANNOT_PASS_TAX_VALIDATION_CHECK
```

This means the campaign cannot be safely launched from the current Shopify-connected TikTok Ads Manager until the account review/tax validation path clears.

## Legal Fallback Paths

### Path A: TikTok Promote

Use TikTok's in-app Promote tool from the TikTok mobile app to boost already-posted videos.

Use this only if Promote allows website traffic and does not trigger the same tax validation screen.

Initial setup:

- Post 5 FurLift videos organically first.
- Boost only the top 1-2 posts after at least 4-12 hours of organic data.
- Objective: website visits if available; otherwise video views.
- Destination URL:

```text
https://mxu168-9g.myshopify.com/products/furlift-reusable-pet-hair-detailer?utm_source=tiktok&utm_medium=promote&utm_campaign=furlift_promote_test&utm_content={{video_slug}}
```

Budget:

- Day 1: NGN 2,000 total split across 1-2 posts.
- Day 2: NGN 3,000 if CTR/engagement is visible.
- Hard cap before proof of add-to-cart: NGN 8,000.

Kill rules:

- Stop if no profile visits, link clicks, or site traffic after NGN 2,000.
- Stop if comments are negative or trust objections dominate.
- Stop if Shopify analytics shows no sessions from `utm_medium=promote`.

### Path B: Paid Creator Posts

Pay real TikTok creators/pages to post FurLift as native content. This does not require the blocked TikTok Ads Manager.

Target creator profiles:

- Pet owners.
- Cleaning/home hacks.
- Dog/cat care.
- US/UK/CA/AU audience if possible.
- 5k-80k followers.
- Recent videos with real comments, not bot engagement.

Budget:

- NGN 20,000 for 4-8 micro placements.
- NGN 2,500-5,000 per small creator if they accept remote assets.
- Pay more only for creators with clear pet-owner engagement.

Tracking:

```text
https://mxu168-9g.myshopify.com/products/furlift-reusable-pet-hair-detailer?utm_source=tiktok_creator&utm_medium=paid_creator&utm_campaign=furlift_seed&utm_content={{creator_handle}}
```

Discount code:

```text
FUR10
```

Required disclosure:

```text
#ad
```

Kill rules:

- Do not buy a second post from a creator unless the first post gets link clicks, comments asking for the product, or Shopify sessions.
- Do not prepay large packages.
- Do not accept creator pages with generic stolen gadget videos and no real audience.

### Path C: Fresh Individual TikTok Advertiser Account

If the operator has personal identity information available, create a separate TikTok Ads Manager account as an individual/sole proprietor directly through TikTok, not through the Shopify app.

Use only true personal/legal details. Do not fake country, address, company, or tax information.

Expected requirements:

- Personal identity verification if requested.
- Nigerian individual Tax ID may require NIN retrieval through the official Nigerian Tax ID Portal.
- A new TikTok pixel may need to be created and installed manually in Shopify Customer Events.

Use this only if TikTok offers an individual account flow and does not force the current blocked company validation.

### Path D: Legit Managed Agency Account

Use a real agency or TikTok Marketing Partner to run managed campaigns from their verified ad account.

Rules:

- No black-market ad account rental.
- No fake US business identity.
- No giving Shopify admin password.
- Use UTM links and invoice-based spend.
- Agency should provide screenshots or dashboard access for spend, CPM, CPC, CTR, and conversions.

Campaign URL:

```text
https://mxu168-9g.myshopify.com/products/furlift-reusable-pet-hair-detailer?utm_source=tiktok&utm_medium=agency_paid&utm_campaign=furlift_cold_test&utm_content={{creative_name}}
```

## Tonight's Budget Split

Total: NGN 50,000

| Channel | Budget | Purpose |
| --- | ---: | --- |
| TikTok Promote | NGN 8,000 | Test direct boosting if available |
| Paid creator posts | NGN 20,000 | Buy native reach without Ads Manager |
| Content production/posting buffer | NGN 7,000 | Captions, small edits, posting ops |
| TikTok ad account retry/verification buffer | NGN 5,000 | Only if validation clears |
| Reserve | NGN 10,000 | Do not spend until one channel shows signal |

Do not add the full NGN 50,000 to TikTok while the Ads Manager account is blocked.

## Exact Launch Order

1. Post these 5 videos organically:
   - `furlift-tiktok-v1-problem-first.mp4`
   - `furlift-spark-a-problem-first.mp4`
   - `furlift-spark-b-transformation-first.mp4`
   - `furlift-spark-c-pov-style.mp4`
   - `furlift-spark-e-pet-owner-emotion.mp4`
2. Wait 4-12 hours.
3. Promote only the top video if TikTok Promote is available.
4. DM 20 creators with the paid creator brief.
5. Buy 4 small creator posts.
6. Review Shopify analytics every 12 hours.
7. Spend more only on the source that drives sessions and add-to-cart.

## What Not To Do

- Do not fake tax details.
- Do not create a fake US ad account.
- Do not buy unknown "verified agency accounts" from Telegram/WhatsApp.
- Do not fund the blocked TikTok Ads Manager.
- Do not spend NGN 50,000 in one day.
- Do not launch broad ads without pixel/account verification.
