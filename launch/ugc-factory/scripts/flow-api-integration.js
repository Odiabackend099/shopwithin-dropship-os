const fs = require('fs');
const path = require('path');

// Flow AI API Integration Script
// This script demonstrates how to use the generated Flow AI prompts with the Flow AI API

const basePath = '/Users/mac/Desktop/Risewithin Shopify/dropship-os/launch/ugc-factory';
const promptsPath = path.join(basePath, 'flow-ai-prompts');

console.log('🚀 Flow AI API Integration\n');

// Load the most recent Flow AI prompts
const promptFiles = fs.readdirSync(promptsPath).filter(f => f.endsWith('.json'));
const latestPromptFile = promptFiles[promptFiles.length - 1];
const promptsData = JSON.parse(fs.readFileSync(path.join(promptsPath, latestPromptFile), 'utf-8'));

console.log(`📝 Loaded ${promptsData.length} Flow AI prompts from: ${latestPromptFile}\n`);

// Flow AI API Configuration
// NOTE: Replace with your actual Flow AI API credentials
const FLOW_AI_CONFIG = {
  apiKey: process.env.FLOW_AI_API_KEY || 'YOUR_FLOW_AI_API_KEY',
  apiUrl: process.env.FLOW_AI_API_URL || 'https://api.flow.ai/v1/generate',
  model: process.env.FLOW_AI_MODEL || 'flow-ai-v1'
};

/**
 * Generate a video using Flow AI API
 * @param {Object} promptData - The Flow AI prompt data
 * @returns {Promise<Object>} - The generated video data
 */
async function generateVideoWithFlowAI(promptData) {
  try {
    console.log(`🎬 Generating video for: ${promptData.productName} (variant ${promptData.variant})`);
    
    // Prepare the request payload for Flow AI API
    const requestPayload = {
      model: FLOW_AI_CONFIG.model,
      prompt: promptData.masterPrompt,
      character: promptData.character,
      scene: promptData.scene,
      motion: promptData.motion,
      content: {
        hook: promptData.content.hook,
        script: promptData.content.script,
        caption: promptData.content.caption
      },
      settings: {
        duration: 15, // 15 seconds
        resolution: '1080x1920', // Vertical video for TikTok/Reels/Shorts
        format: 'mp4',
        quality: 'high'
      }
    };

    // Make API request to Flow AI
    // This is a placeholder - actual implementation depends on Flow AI's API
    const response = await fetch(FLOW_AI_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FLOW_AI_CONFIG.apiKey}`
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      throw new Error(`Flow AI API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log(`✅ Video generated successfully: ${result.videoUrl || 'Video ID: ' + result.videoId}`);
    
    return {
      promptId: `${promptData.productId}-v${promptData.variant}`,
      productName: promptData.productName,
      category: promptData.category,
      variant: promptData.variant,
      videoUrl: result.videoUrl,
      videoId: result.videoId,
      thumbnailUrl: result.thumbnailUrl,
      duration: result.duration,
      generatedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ Error generating video for ${promptData.productName}:`, error.message);
    return {
      promptId: `${promptData.productId}-v${promptData.variant}`,
      productName: promptData.productName,
      category: promptData.category,
      variant: promptData.variant,
      error: error.message,
      failedAt: new Date().toISOString()
    };
  }
}

/**
 * Batch generate videos for all prompts
 * @param {Array} prompts - Array of Flow AI prompt data
 * @param {number} batchSize - Number of videos to generate in parallel
 * @returns {Promise<Array>} - Array of generation results
 */
async function batchGenerateVideos(prompts, batchSize = 3) {
  const results = [];
  
  console.log(`🎬 Starting batch generation of ${prompts.length} videos (batch size: ${batchSize})\n`);
  
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(prompts.length / batchSize)}`);
    
    const batchResults = await Promise.all(
      batch.map(prompt => generateVideoWithFlowAI(prompt))
    );
    
    results.push(...batchResults);
    
    // Add delay between batches to avoid rate limiting
    if (i + batchSize < prompts.length) {
      console.log(`⏸️ Waiting 2 seconds before next batch...\n`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return results;
}

/**
 * Save generation results
 * @param {Array} results - Array of generation results
 */
function saveGenerationResults(results) {
  const outputPath = path.join(basePath, 'flow-ai-output');
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsPath = path.join(outputPath, `generation-results-${timestamp}.json`);
  
  const summary = {
    generatedAt: new Date().toISOString(),
    totalPrompts: results.length,
    successful: results.filter(r => r.videoUrl).length,
    failed: results.filter(r => r.error).length,
    results: results
  };
  
  fs.writeFileSync(resultsPath, JSON.stringify(summary, null, 2));
  console.log(`💾 Saved generation results to: ${resultsPath}`);
  
  return summary;
}

/**
 * Display generation summary
 * @param {Object} summary - Generation summary
 */
function displaySummary(summary) {
  console.log('\n📊 GENERATION SUMMARY');
  console.log('=' .repeat(50));
  console.log(`Total prompts: ${summary.totalPrompts}`);
  console.log(`Successful: ${summary.successful}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`Success rate: ${((summary.successful / summary.totalPrompts) * 100).toFixed(1)}%`);
  
  if (summary.failed > 0) {
    console.log('\n❌ Failed generations:');
    summary.results.filter(r => r.error).forEach(r => {
      console.log(`  - ${r.productName} (variant ${r.variant}): ${r.error}`);
    });
  }
  
  console.log('\n✅ Successful generations:');
  summary.results.filter(r => r.videoUrl).forEach(r => {
    console.log(`  - ${r.productName} (variant ${r.variant}): ${r.videoUrl}`);
  });
}

// Main execution
async function main() {
  try {
    // Check if API key is configured
    if (FLOW_AI_CONFIG.apiKey === 'YOUR_FLOW_AI_API_KEY') {
      console.log('⚠️ Flow AI API key not configured.');
      console.log('Please set FLOW_AI_API_KEY environment variable or update the config in this script.');
      console.log('\nTo set environment variable:');
      console.log('export FLOW_AI_API_KEY=your_actual_api_key');
      console.log('\nOr update FLOW_AI_CONFIG in this script with your credentials.');
      console.log('\n📝 This script is ready to generate videos once API credentials are configured.');
      console.log(`📝 It will process ${promptsData.length} prompts from: ${latestPromptFile}`);
      return;
    }
    
    // Generate videos
    const results = await batchGenerateVideos(promptsData, 3);
    
    // Save results
    const summary = saveGenerationResults(results);
    
    // Display summary
    displaySummary(summary);
    
    console.log('\n🚀 Video generation complete!');
    console.log('Next steps:');
    console.log('1. Review generated videos');
    console.log('2. Upload to TikTok, Instagram Reels, YouTube Shorts, Pinterest');
    console.log('3. Track performance using analytics tracker');
    console.log('4. Iterate on winning content');
    
  } catch (error) {
    console.error('❌ Fatal error during video generation:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  generateVideoWithFlowAI,
  batchGenerateVideos,
  saveGenerationResults,
  displaySummary
};
