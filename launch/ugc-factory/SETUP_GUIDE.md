# AI UGC Pipeline Setup Guide

This guide walks you through setting up the complete AI UGC pipeline for mass content generation and posting.

## Prerequisites

- Node.js installed (v18+)
- Shopify store access
- Flow AI API access
- Social media platform API access (TikTok, Instagram, YouTube, Pinterest)

## Step 1: Environment Configuration

Create a `.env` file in the `ugc-factory` directory:

```bash
cd /Users/mac/Desktop/Risewithin\ Shopify/dropship-os/launch/ugc-factory
touch .env
```

Add the following environment variables:

```env
# Flow AI API Configuration
FLOW_AI_API_KEY=your_flow_ai_api_key
FLOW_AI_API_URL=https://api.flow.ai/v1/generate
FLOW_AI_MODEL=flow-ai-v1

# TikTok API Configuration
TIKTOK_API_KEY=your_tiktok_api_key
TIKTOK_API_URL=https://open.tiktokapis.com/v2/post/

# Instagram API Configuration
INSTAGRAM_API_KEY=your_instagram_api_key
INSTAGRAM_API_URL=https://graph.facebook.com/v18.0/me/media

# YouTube API Configuration
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_API_URL=https://www.googleapis.com/upload/youtube/v3/videos

# Pinterest API Configuration
PINTEREST_API_KEY=your_pinterest_api_key
PINTEREST_API_URL=https://api.pinterest.com/v5/pins
PINTEREST_BOARD_ID=your_board_id
```

## Step 2: Install Dependencies

```bash
cd /Users/mac/Desktop/Risewithin\ Shopify/dropship-os/launch/ugc-factory
npm install
```

## Step 3: Generate Flow AI Prompts

Run the prompt generation script:

```bash
node scripts/generate-flow-prompts.js
```

This will:
- Load all sample products
- Load character, scene, and motion templates
- Generate 30 Flow AI prompts (3 variants per product)
- Save prompts to `flow-ai-prompts/` directory

## Step 4: Generate Videos with Flow AI

Run the Flow AI API integration script:

```bash
node scripts/flow-api-integration.js
```

This will:
- Load the generated Flow AI prompts
- Call Flow AI API to generate videos
- Save generation results to `flow-ai-output/` directory
- Generate 30 videos (15 seconds each, 1080x1920 vertical format)

## Step 5: Execute Mass Organic Posting

Run the posting automation script:

```bash
node scripts/posting-automation.js
```

This will:
- Load generated videos
- Post to TikTok (5 videos daily)
- Post to Instagram Reels (2 videos daily)
- Post to YouTube Shorts (2 videos daily)
- Post to Pinterest (1 video daily)
- Save posting results to `posting-results/` directory

## Step 6: Track Performance

Use the analytics tracker to monitor performance:

```typescript
import { AnalyticsTracker } from './ad-engine/analytics-tracker';

const tracker = new AnalyticsTracker();

// Track video metrics
tracker.trackVideo({
  videoId: 'video-123',
  productId: 'furlift',
  platform: 'tiktok',
  postedAt: '2026-05-20T09:00:00Z',
  metrics: {
    views: 10000,
    watchTime: 50000,
    completionRate: 50,
    likes: 500,
    comments: 50,
    shares: 100,
    saves: 75,
    ctr: 3.5,
    conversions: 15,
    revenue: 374.25
  },
  status: 'active'
});

// Generate weekly report
const report = tracker.generateWeeklyReport();
console.log(report);

// Save analytics
tracker.saveAnalytics();
```

## Step 7: Iterate on Winning Content

Based on analytics data:

1. **Identify Winners**: Videos with >10k views, >50% completion, >3% CTR, >10 conversions
2. **Scale Winners**: Create more variations of winning content
3. **Kill Losers**: Pause content with poor performance
4. **Optimize Hooks**: Test different hooks for underperforming videos
5. **Adjust Posting Times**: Experiment with different posting schedules

## Daily Workflow

### Morning (9:00 AM)
1. Check analytics from previous day
2. Identify top-performing content
3. Generate new content variations for winners

### Mid-Day (12:00 PM - 3:00 PM)
1. Post TikTok videos (optimal engagement times)
2. Monitor early performance indicators

### Evening (6:00 PM - 9:00 PM)
1. Post Instagram Reels and YouTube Shorts
2. Post Pinterest content
3. Engage with comments and community

### Night (Before Bed)
1. Review daily analytics
2. Plan tomorrow's content
3. Adjust strategy based on data

## Weekly Workflow

### Monday
- Review weekly analytics report
- Identify winning and losing products
- Plan content calendar for the week

### Tuesday-Thursday
- Execute daily posting schedule
- Monitor performance in real-time
- Iterate on content based on early data

### Friday
- Generate new Flow AI prompts for next week
- Test new content variations
- Plan weekend posting strategy

### Saturday-Sunday
- Reduced posting volume (maintain consistency)
- Focus on community engagement
- Analyze weekend vs weekday performance

## Troubleshooting

### Flow AI API Issues
- Check API key is correct
- Verify API endpoint URL
- Check rate limits
- Review prompt format

### Social Media API Issues
- Verify API credentials
- Check platform-specific requirements
- Ensure video format meets platform specs
- Review rate limits and posting rules

### Content Not Performing
- Check hook strength
- Verify video quality
- Test different posting times
- Experiment with captions and hashtags
- Review competitor content

## Scaling Strategy

### Phase 1: Foundation (Week 1-2)
- 10 products, 30 videos, 70 posts/week
- Focus on content quality and consistency
- Establish baseline performance metrics

### Phase 2: Optimization (Week 3-4)
- Scale winners to 5-10 variations each
- Kill underperforming products
- Optimize posting schedule
- Improve conversion rates

### Phase 3: Expansion (Week 5-8)
- Add 10-20 new products
- Increase posting volume to 15-20 videos/day
- Expand to additional platforms
- Test paid traffic on winning content

### Phase 4: Automation (Week 9+)
- Fully automate content generation
- Automate posting schedule
- Automate analytics reporting
- Scale to 50+ products, 100+ videos/day

## Success Metrics

### Content Metrics
- Average views per video: >5,000
- Completion rate: >40%
- Engagement rate: >5%
- CTR: >2%

### Business Metrics
- Conversion rate: >1%
- Average order value: >$25
- Customer acquisition cost: <$10
- Return on ad spend: >2x

### Growth Metrics
- Weekly follower growth: >10%
- Monthly revenue growth: >20%
- Product expansion rate: +5 products/month
- Content scaling rate: +20 videos/month

## Support

For issues or questions:
1. Check this setup guide
2. Review script documentation
3. Check platform API documentation
4. Review analytics data for insights
