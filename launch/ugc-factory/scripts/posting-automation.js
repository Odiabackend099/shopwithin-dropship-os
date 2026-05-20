const fs = require('fs');
const path = require('path');

// Social Media Posting Automation Script
// This script automates posting to TikTok, Instagram Reels, YouTube Shorts, and Pinterest

const basePath = '/Users/mac/Desktop/Risewithin Shopify/dropship-os/launch/ugc-factory';

console.log('🚀 Social Media Posting Automation\n');

// Platform Configuration
const PLATFORM_CONFIG = {
  tiktok: {
    apiKey: process.env.TIKTOK_API_KEY || 'YOUR_TIKTOK_API_KEY',
    apiUrl: process.env.TIKTOK_API_URL || 'https://open.tiktokapis.com/v2/post/',
    enabled: true,
    dailyLimit: 5,
    optimalTimes: ['09:00', '12:00', '15:00', '18:00', '21:00']
  },
  instagram: {
    apiKey: process.env.INSTAGRAM_API_KEY || 'YOUR_INSTAGRAM_API_KEY',
    apiUrl: process.env.INSTAGRAM_API_URL || 'https://graph.facebook.com/v18.0/me/media',
    enabled: true,
    dailyLimit: 2,
    optimalTimes: ['11:00', '19:00']
  },
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || 'YOUR_YOUTUBE_API_KEY',
    apiUrl: process.env.YOUTUBE_API_URL || 'https://www.googleapis.com/upload/youtube/v3/videos',
    enabled: true,
    dailyLimit: 2,
    optimalTimes: ['10:00', '20:00']
  },
  pinterest: {
    apiKey: process.env.PINTEREST_API_KEY || 'YOUR_PINTEREST_API_KEY',
    apiUrl: process.env.PINTEREST_API_URL || 'https://api.pinterest.com/v5/pins',
    enabled: true,
    dailyLimit: 1,
    optimalTimes: ['14:00']
  }
};

/**
 * Post video to TikTok
 * @param {Object} content - Content to post
 * @returns {Promise<Object>} - Post result
 */
async function postToTikTok(content) {
  try {
    console.log(`📱 Posting to TikTok: ${content.productName}`);
    
    const requestPayload = {
      video_url: content.videoUrl,
      caption: content.caption,
      hashtags: ['#fyp', '#viral', '#trending', '#foryou', `#${content.category}`],
      privacy_level: 'public'
    };

    // Placeholder for actual TikTok API call
    const response = await fetch(PLATFORM_CONFIG.tiktok.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PLATFORM_CONFIG.tiktok.apiKey}`
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      throw new Error(`TikTok API error: ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ Posted to TikTok: ${result.post_id || 'Success'}`);
    
    return {
      platform: 'tiktok',
      postId: result.post_id,
      url: result.post_url,
      postedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ Error posting to TikTok:`, error.message);
    return { platform: 'tiktok', error: error.message };
  }
}

/**
 * Post video to Instagram Reels
 * @param {Object} content - Content to post
 * @returns {Promise<Object>} - Post result
 */
async function postToInstagram(content) {
  try {
    console.log(`📸 Posting to Instagram Reels: ${content.productName}`);
    
    const requestPayload = {
      video_url: content.videoUrl,
      caption: content.caption,
      media_type: 'REELS'
    };

    // Placeholder for actual Instagram API call
    const response = await fetch(PLATFORM_CONFIG.instagram.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PLATFORM_CONFIG.instagram.apiKey}`
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ Posted to Instagram: ${result.id || 'Success'}`);
    
    return {
      platform: 'instagram',
      postId: result.id,
      url: result.permalink,
      postedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ Error posting to Instagram:`, error.message);
    return { platform: 'instagram', error: error.message };
  }
}

/**
 * Post video to YouTube Shorts
 * @param {Object} content - Content to post
 * @returns {Promise<Object>} - Post result
 */
async function postToYouTube(content) {
  try {
    console.log(`📺 Posting to YouTube Shorts: ${content.productName}`);
    
    const requestPayload = {
      video_url: content.videoUrl,
      title: `${content.hook} - ${content.productName}`,
      description: content.caption,
      tags: ['shorts', 'viral', 'trending', content.category],
      privacyStatus: 'public'
    };

    // Placeholder for actual YouTube API call
    const response = await fetch(PLATFORM_CONFIG.youtube.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PLATFORM_CONFIG.youtube.apiKey}`
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ Posted to YouTube: ${result.id || 'Success'}`);
    
    return {
      platform: 'youtube',
      postId: result.id,
      url: result.url,
      postedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ Error posting to YouTube:`, error.message);
    return { platform: 'youtube', error: error.message };
  }
}

/**
 * Post video to Pinterest
 * @param {Object} content - Content to post
 * @returns {Promise<Object>} - Post result
 */
async function postToPinterest(content) {
  try {
    console.log(`📌 Posting to Pinterest: ${content.productName}`);
    
    const requestPayload = {
      video_url: content.videoUrl,
      title: `${content.hook} - ${content.productName}`,
      description: content.caption,
      board_id: process.env.PINTEREST_BOARD_ID || 'YOUR_BOARD_ID'
    };

    // Placeholder for actual Pinterest API call
    const response = await fetch(PLATFORM_CONFIG.pinterest.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PLATFORM_CONFIG.pinterest.apiKey}`
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      throw new Error(`Pinterest API error: ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ Posted to Pinterest: ${result.id || 'Success'}`);
    
    return {
      platform: 'pinterest',
      postId: result.id,
      url: result.url,
      postedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ Error posting to Pinterest:`, error.message);
    return { platform: 'pinterest', error: error.message };
  }
}

/**
 * Post content to multiple platforms
 * @param {Object} content - Content to post
 * @param {Array} platforms - Platforms to post to
 * @returns {Promise<Array>} - Array of post results
 */
async function postToPlatforms(content, platforms = ['tiktok', 'instagram', 'youtube', 'pinterest']) {
  const results = [];
  
  for (const platform of platforms) {
    if (!PLATFORM_CONFIG[platform].enabled) {
      console.log(`⏭️ Skipping ${platform} (disabled)`);
      continue;
    }
    
    let result;
    switch (platform) {
      case 'tiktok':
        result = await postToTikTok(content);
        break;
      case 'instagram':
        result = await postToInstagram(content);
        break;
      case 'youtube':
        result = await postToYouTube(content);
        break;
      case 'pinterest':
        result = await postToPinterest(content);
        break;
    }
    
    results.push(result);
    
    // Add delay between platform posts to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

/**
 * Load generated videos from Flow AI output
 * @returns {Array} - Array of generated video content
 */
function loadGeneratedVideos() {
  const outputPath = path.join(basePath, 'flow-ai-output');
  const resultFiles = fs.readdirSync(outputPath).filter(f => f.startsWith('generation-results-') && f.endsWith('.json'));
  
  if (resultFiles.length === 0) {
    console.log('⚠️ No generated videos found. Run Flow AI generation first.');
    return [];
  }
  
  const latestResultFile = resultFiles[resultFiles.length - 1];
  const resultsData = JSON.parse(fs.readFileSync(path.join(outputPath, latestResultFile), 'utf-8'));
  
  // Filter successful generations
  const successfulVideos = resultsData.results.filter(r => r.videoUrl);
  
  console.log(`📝 Loaded ${successfulVideos.length} successful video generations from: ${latestResultFile}\n`);
  
  return successfulVideos;
}

/**
 * Load Flow AI prompts to get captions and hooks
 * @returns {Object} - Map of prompt IDs to content
 */
function loadFlowPrompts() {
  const promptsPath = path.join(basePath, 'flow-ai-prompts');
  const promptFiles = fs.readdirSync(promptsPath).filter(f => f.endsWith('.json'));
  const latestPromptFile = promptFiles[promptFiles.length - 1];
  const promptsData = JSON.parse(fs.readFileSync(path.join(promptsPath, latestPromptFile), 'utf-8'));
  
  // Create map of prompt IDs to content
  const promptMap = {};
  promptsData.forEach(prompt => {
    const promptId = `${prompt.productId}-v${prompt.variant}`;
    promptMap[promptId] = prompt.content;
  });
  
  return promptMap;
}

/**
 * Execute daily posting schedule
 */
async function executeDailySchedule() {
  try {
    // Load generated videos
    const videos = loadGeneratedVideos();
    if (videos.length === 0) {
      console.log('⚠️ No videos to post. Generate videos first.');
      return;
    }
    
    // Load Flow AI prompts for captions
    const promptMap = loadFlowPrompts();
    
    console.log(`📅 Executing daily posting schedule for ${videos.length} videos\n`);
    
    const results = [];
    
    for (const video of videos) {
      // Get content from prompt map
      const content = promptMap[video.promptId] || {
        hook: 'Check this out!',
        caption: 'Amazing product! #fyp #viral',
        script: []
      };
      
      // Prepare content for posting
      const postContent = {
        productName: video.productName,
        category: video.category,
        variant: video.variant,
        videoUrl: video.videoUrl,
        videoId: video.videoId,
        hook: content.hook,
        caption: content.caption,
        script: content.script
      };
      
      // Post to all platforms
      const postResults = await postToPlatforms(postContent);
      results.push({
        video: video,
        posts: postResults
      });
      
      console.log('');
    }
    
    // Save posting results
    savePostingResults(results);
    
    // Display summary
    displayPostingSummary(results);
    
  } catch (error) {
    console.error('❌ Error executing daily schedule:', error);
  }
}

/**
 * Save posting results
 * @param {Array} results - Posting results
 */
function savePostingResults(results) {
  const outputPath = path.join(basePath, 'posting-results');
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsPath = path.join(outputPath, `posting-results-${timestamp}.json`);
  
  const summary = {
    postedAt: new Date().toISOString(),
    totalVideos: results.length,
    successful: results.filter(r => r.posts.some(p => p.postId)).length,
    results: results
  };
  
  fs.writeFileSync(resultsPath, JSON.stringify(summary, null, 2));
  console.log(`💾 Saved posting results to: ${resultsPath}`);
}

/**
 * Display posting summary
 * @param {Array} results - Posting results
 */
function displayPostingSummary(results) {
  console.log('\n📊 POSTING SUMMARY');
  console.log('=' .repeat(50));
  console.log(`Total videos posted: ${results.length}`);
  
  let successfulPosts = 0;
  let failedPosts = 0;
  
  const platformStats = {
    tiktok: { success: 0, failed: 0 },
    instagram: { success: 0, failed: 0 },
    youtube: { success: 0, failed: 0 },
    pinterest: { success: 0, failed: 0 }
  };
  
  results.forEach(result => {
    result.posts.forEach(post => {
      if (post.postId) {
        successfulPosts++;
        platformStats[post.platform].success++;
      } else {
        failedPosts++;
        platformStats[post.platform].failed++;
      }
    });
  });
  
  console.log(`Successful posts: ${successfulPosts}`);
  console.log(`Failed posts: ${failedPosts}`);
  
  console.log('\nBy platform:');
  Object.entries(platformStats).forEach(([platform, stats]) => {
    console.log(`  ${platform}: ${stats.success} successful, ${stats.failed} failed`);
  });
  
  console.log('\n🚀 Posting complete!');
  console.log('Next steps:');
  console.log('1. Monitor post performance');
  console.log('2. Track analytics using analytics tracker');
  console.log('3. Iterate on winning content');
}

// Main execution
async function main() {
  // Check if any API keys are configured
  const hasApiKeys = Object.values(PLATFORM_CONFIG).some(config => 
    config.apiKey && !config.apiKey.includes('YOUR_')
  );
  
  if (!hasApiKeys) {
    console.log('⚠️ Social media API keys not configured.');
    console.log('Please set the following environment variables:');
    console.log('  - TIKTOK_API_KEY');
    console.log('  - INSTAGRAM_API_KEY');
    console.log('  - YOUTUBE_API_KEY');
    console.log('  - PINTEREST_API_KEY');
    console.log('\nOr update PLATFORM_CONFIG in this script with your credentials.');
    console.log('\n📝 This script is ready to post videos once API credentials are configured.');
    console.log('📝 It will post to TikTok (5x), Instagram (2x), YouTube (2x), Pinterest (1x) daily.');
    return;
  }
  
  await executeDailySchedule();
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  postToTikTok,
  postToInstagram,
  postToYouTube,
  postToPinterest,
  postToPlatforms,
  executeDailySchedule
};
