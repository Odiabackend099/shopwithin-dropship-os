# Growth Playbook

## Launch Constraint
- Starting cash is `NGN 50,000`, so the system optimizes for product validation before profit.
- Use one-product focus until one product shows real click and buying intent.
- Avoid random broad Meta ads in the first validation pass. Cold paid testing starts only after organic content produces a measurable signal.
- Favor products under `$40` that are emotionally visual, easy to explain in 5 seconds, problem-solving, and demonstrable on short video.
- Do not test generic clothing, random electronics, or a general store during the first budget cycle.

## Organic
- Daily per active product: 3-5 short videos across TikTok, Instagram Reels, YouTube Shorts, and Pinterest.
- Produce 20-30 creatives before asking paid channels to carry the test.
- Formats: problem/solution, before/after, unboxing, comparison, mistake callout, travel/use-case demo, "TikTok made me buy it", and "Amazon find" style videos.
- First 3-6 seconds must show the product or the pain clearly.
- Hooks: "I didn't expect this to work", "Amazon gadget nobody talks about", "This solved my biggest problem", "TikTok made me buy this", and "Stop doing this the hard way".

## Paid
- Start TikTok micro-tests only after at least 15 organic posts, 20 creatives, and either `>= 1.5%` best organic CTR or `>= 1,000` best-video views with site clicks.
- Initial TikTok tests use `NGN 3,000-NGN 5,000/day` max, distinct creative angles, and one product.
- Keep `NGN 10,000` reserved for retargeting, backup tooling, or supplier/payment recovery.
- Start Meta only after product page QA, pixel event checks, and evidence that TikTok/Reels creatives are earning clicks.
- Start TikTok Smart+ Catalog only after at least 4 approved in-stock products; this is not part of the first one-product validation sprint.
- Pause by kill-switch rules, not by emotion.

## Scaling
- Scale only products with positive contribution margin.
- Duplicate winning ads into scaling campaigns or increase budget gradually after stable purchase volume.
- Move winners to better supplier terms, faster warehouses, branded inserts, and stronger post-purchase offers.
- Do not add a second product until the first product has either failed by kill-switch rules or produced a purchase/add-to-cart signal worth iterating.

## Retention
- Klaviyo flows: welcome, abandoned checkout, post-purchase education, tracking update, review request, winback.
- AfterSell: complementary accessory, bundle upgrade, or replenishment offer.
- Support: proactive tracking updates reduce refund and chargeback pressure.

## First 7 Days
1. Day 1: research 10 products from TikTok Shop trends, Meta Ads Library, Amazon Movers, and AliExpress order velocity; pick one.
2. Day 2: build the one-product Shopify page with hero, problem, demo, benefits, shipping clarity, FAQ, sticky CTA, and trust badges.
3. Day 3: generate 30 hooks/scripts/shot lists and publish the first 3-5 videos.
4. Days 4-5: keep posting, reply to comments, record clicks, page sessions, and add-to-carts.
5. Day 6: if validation gates pass, start TikTok at `NGN 3,000-NGN 5,000/day`; otherwise generate new hooks and keep organic.
6. Day 7: kill weak creatives, iterate the landing page, and reserve retargeting spend for viewers/cart abandoners.

## shopwithin Organic Queue

The first FurLift organic queue is seeded without using paid ads:

- Product handle: `furlift-reusable-pet-hair-detailer`
- Creative assets stored: `280`
- Hooks: `100`
- Short-form concepts: `50`
- Ad variants: `30`
- CTA variants: `30`
- Headline variants: `20`
- Queued posts: `120`
- Platforms: TikTok, Instagram Reels, YouTube Shorts, Pinterest
- Cadence: 4 posts per day for 30 days

These posts are queue records for operator execution. They are not auto-published, and `PAID_ADS_ENABLED=false` remains the spend gate.
