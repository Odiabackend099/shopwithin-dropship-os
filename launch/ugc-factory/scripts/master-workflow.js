const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const basePath = '/Users/mac/Desktop/Risewithin Shopify/dropship-os/launch/ugc-factory';

console.log('🚀 AI UGC Pipeline - Master Workflow\n');

/**
 * Execute the complete AI UGC pipeline workflow
 * This orchestrates: prompt generation → video generation → posting → analytics
 */
async function executeMasterWorkflow(options = {}) {
  const {
    skipPromptGeneration = false,
    skipVideoGeneration = false,
    skipPosting = false,
    skipAnalytics = false,
    productCount = 10,
    variantsPerProduct = 3
  } = options;

  console.log('📋 WORKFLOW CONFIGURATION');
  console.log('=' .repeat(50));
  console.log(`Skip prompt generation: ${skipPromptGeneration}`);
  console.log(`Skip video generation: ${skipVideoGeneration}`);
  console.log(`Skip posting: ${skipPosting}`);
  console.log(`Skip analytics: ${skipAnalytics}`);
  console.log(`Product count: ${productCount}`);
  console.log(`Variants per product: ${variantsPerProduct}`);
  console.log('');

  try {
    // Step 1: Generate Flow AI Prompts
    if (!skipPromptGeneration) {
      console.log('🎬 STEP 1: Generating Flow AI Prompts');
      console.log('=' .repeat(50));
      execSync('node scripts/generate-flow-prompts.js', { cwd: basePath, stdio: 'inherit' });
      console.log('');
    } else {
      console.log('⏭️ Skipping prompt generation\n');
    }

    // Step 2: Generate Videos with Flow AI API
    if (!skipVideoGeneration) {
      console.log('🎥 STEP 2: Generating Videos with Flow AI API');
      console.log('=' .repeat(50));
      
      // Check if API credentials are configured
      const flowApiKey = process.env.FLOW_AI_API_KEY;
      if (!flowApiKey || flowApiKey.includes('YOUR_')) {
        console.log('⚠️ Flow AI API key not configured.');
        console.log('Set FLOW_AI_API_KEY environment variable to generate actual videos.');
        console.log('Skipping video generation step.\n');
      } else {
        execSync('node scripts/flow-api-integration.js', { cwd: basePath, stdio: 'inherit' });
        console.log('');
      }
    } else {
      console.log('⏭️ Skipping video generation\n');
    }

    // Step 3: Execute Mass Organic Posting
    if (!skipPosting) {
      console.log('📱 STEP 3: Executing Mass Organic Posting');
      console.log('=' .repeat(50));
      
      // Check if any social media API credentials are configured
      const hasSocialCredentials = 
        (process.env.TIKTOK_API_KEY && !process.env.TIKTOK_API_KEY.includes('YOUR_')) ||
        (process.env.INSTAGRAM_API_KEY && !process.env.INSTAGRAM_API_KEY.includes('YOUR_')) ||
        (process.env.YOUTUBE_API_KEY && !process.env.YOUTUBE_API_KEY.includes('YOUR_')) ||
        (process.env.PINTEREST_API_KEY && !process.env.PINTEREST_API_KEY.includes('YOUR_'));
      
      if (!hasSocialCredentials) {
        console.log('⚠️ Social media API credentials not configured.');
        console.log('Set the following environment variables to enable posting:');
        console.log('  - TIKTOK_API_KEY');
        console.log('  - INSTAGRAM_API_KEY');
        console.log('  - YOUTUBE_API_KEY');
        console.log('  - PINTEREST_API_KEY');
        console.log('Skipping posting step.\n');
      } else {
        execSync('node scripts/posting-automation.js', { cwd: basePath, stdio: 'inherit' });
        console.log('');
      }
    } else {
      console.log('⏭️ Skipping posting\n');
    }

    // Step 4: Track Performance
    if (!skipAnalytics) {
      console.log('📊 STEP 4: Tracking Performance');
      console.log('=' .repeat(50));
      
      // Check if there are posting results to analyze
      const postingResultsPath = path.join(basePath, 'posting-results');
      if (fs.existsSync(postingResultsPath)) {
        const resultFiles = fs.readdirSync(postingResultsPath).filter(f => f.startsWith('posting-results-') && f.endsWith('.json'));
        
        if (resultFiles.length > 0) {
          console.log(`Found ${resultFiles.length} posting result files to analyze.`);
          console.log('Analytics tracking is ready. Implement analytics monitoring to track:');
          console.log('  - Views, watch time, completion rate');
          console.log('  - Likes, comments, shares, saves');
          console.log('  - CTR on product links');
          console.log('  - Conversions and revenue');
          console.log('  - Performance classification');
          console.log('');
          
          // Generate analytics summary
          generateAnalyticsSummary(resultFiles);
        } else {
          console.log('⚠️ No posting results found. Run posting step first.');
          console.log('Skipping analytics step.\n');
        }
      } else {
        console.log('⚠️ No posting results directory found.');
        console.log('Run posting step first to generate data for analytics.\n');
      }
    } else {
      console.log('⏭️ Skipping analytics\n');
    }

    // Final Summary
    console.log('🎉 WORKFLOW COMPLETE');
    console.log('=' .repeat(50));
    console.log('✅ AI UGC Pipeline executed successfully');
    console.log('');
    console.log('📁 Generated files:');
    console.log('  - flow-ai-prompts/ (Flow AI prompts)');
    console.log('  - flow-ai-output/ (Generated videos)');
    console.log('  - posting-results/ (Posting results)');
    console.log('  - analytics/ (Performance data)');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Review generated videos');
    console.log('2. Monitor posting results');
    console.log('3. Track performance metrics');
    console.log('4. Iterate on winning content');
    console.log('5. Scale successful products');
    console.log('');
    console.log('📖 For detailed setup instructions, see SETUP_GUIDE.md');

  } catch (error) {
    console.error('❌ Workflow execution failed:', error.message);
    process.exit(1);
  }
}

/**
 * Generate analytics summary from posting results
 * @param {Array} resultFiles - Array of posting result files
 */
function generateAnalyticsSummary(resultFiles) {
  const postingResultsPath = path.join(basePath, 'posting-results');
  const latestResultFile = resultFiles[resultFiles.length - 1];
  const resultsData = JSON.parse(fs.readFileSync(path.join(postingResultsPath, latestResultFile), 'utf-8'));
  
  console.log(`📊 Analytics Summary from: ${latestResultFile}`);
  console.log('-' .repeat(50));
  console.log(`Total videos posted: ${resultsData.totalVideos}`);
  console.log(`Successful posts: ${resultsData.successful}`);
  console.log(`Failed posts: ${resultsData.totalVideos - resultsData.successful}`);
  console.log(`Success rate: ${((resultsData.successful / resultsData.totalVideos) * 100).toFixed(1)}%`);
  console.log('');
  
  // Platform breakdown
  const platformStats = {};
  resultsData.results.forEach(result => {
    result.posts.forEach(post => {
      if (!platformStats[post.platform]) {
        platformStats[post.platform] = { success: 0, failed: 0 };
      }
      if (post.postId) {
        platformStats[post.platform].success++;
      } else {
        platformStats[post.platform].failed++;
      }
    });
  });
  
  console.log('Platform Performance:');
  Object.entries(platformStats).forEach(([platform, stats]) => {
    const total = stats.success + stats.failed;
    const rate = total > 0 ? ((stats.success / total) * 100).toFixed(1) : 0;
    console.log(`  ${platform}: ${stats.success}/${total} successful (${rate}%)`);
  });
  console.log('');
  
  console.log('📈 Recommended next actions:');
  if (resultsData.successful < resultsData.totalVideos * 0.8) {
    console.log('  ⚠️ Low success rate - review API credentials and rate limits');
  } else {
    console.log('  ✅ Good success rate - continue current posting strategy');
  }
  
  const topPlatform = Object.entries(platformStats).sort((a, b) => b[1].success - a[1].success)[0];
  if (topPlatform) {
    console.log(`  🏆 Top performing platform: ${topPlatform[0]} (${topPlatform[1].success} posts)`);
  }
  console.log('');
}

/**
 * Quick workflow - generate prompts only
 */
async function quickWorkflow() {
  console.log('⚡ Quick Workflow: Generate prompts only\n');
  await executeMasterWorkflow({
    skipVideoGeneration: true,
    skipPosting: true,
    skipAnalytics: true
  });
}

/**
 * Full workflow - execute all steps
 */
async function fullWorkflow() {
  console.log('🚀 Full Workflow: Execute all steps\n');
  await executeMasterWorkflow({
    skipPromptGeneration: false,
    skipVideoGeneration: false,
    skipPosting: false,
    skipAnalytics: false
  });
}

/**
 * Posting workflow - posting only (assumes videos exist)
 */
async function postingWorkflow() {
  console.log('📱 Posting Workflow: Post existing videos\n');
  await executeMasterWorkflow({
    skipPromptGeneration: true,
    skipVideoGeneration: true,
    skipPosting: false,
    skipAnalytics: true
  });
}

/**
 * Analytics workflow - analytics only (assumes posting exists)
 */
async function analyticsWorkflow() {
  console.log('📊 Analytics Workflow: Analyze existing data\n');
  await executeMasterWorkflow({
    skipPromptGeneration: true,
    skipVideoGeneration: true,
    skipPosting: true,
    skipAnalytics: false
  });
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'quick':
    quickWorkflow();
    break;
  case 'posting':
    postingWorkflow();
    break;
  case 'analytics':
    analyticsWorkflow();
    break;
  case 'full':
  default:
    fullWorkflow();
    break;
}

module.exports = {
  executeMasterWorkflow,
  quickWorkflow,
  fullWorkflow,
  postingWorkflow,
  analyticsWorkflow
};
