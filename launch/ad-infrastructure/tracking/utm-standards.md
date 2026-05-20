# UTM Standards

## Required Parameters

- `utm_source`: platform, for example `tiktok`, `meta`, `instagram`, `facebook`.
- `utm_medium`: `paid_social`, `organic_social`, `spark_ad`, or `retargeting`.
- `utm_campaign`: product plus test sprint, for example `furlift_validation_20260518_tiktok`.
- `utm_content`: creative variant, for example `problem_first_v1`.
- `utm_term`: audience or hook family, for example `pet_owners_us`.

## Product URL

Base:

```text
https://mxu168-9g.myshopify.com/products/furlift-reusable-pet-hair-detailer
```

## Final URL Examples

TikTok problem-first:

```text
https://mxu168-9g.myshopify.com/products/furlift-reusable-pet-hair-detailer?utm_source=tiktok&utm_medium=paid_social&utm_campaign=furlift_validation_20260518_tiktok&utm_content=problem_first_v1&utm_term=pet_owners_us
```

Instagram Reels transformation:

```text
https://mxu168-9g.myshopify.com/products/furlift-reusable-pet-hair-detailer?utm_source=instagram&utm_medium=paid_social&utm_campaign=furlift_validation_20260518_meta&utm_content=transformation_first_v1&utm_term=pet_owners_us
```

Meta retargeting:

```text
https://mxu168-9g.myshopify.com/products/furlift-reusable-pet-hair-detailer?utm_source=meta&utm_medium=retargeting&utm_campaign=furlift_retargeting_20260518_meta&utm_content=guest_ready_v1&utm_term=site_visitors_30d
```

## Rules

- Use lowercase.
- Use underscores, not spaces.
- Never reuse the same `utm_content` for different videos.
- Keep organic and paid UTMs separate.
- Do not put private notes, personal names, or account IDs in UTMs.

