import * as fs from 'fs';
import * as path from 'path';
import { ScalableUGCPipeline } from '../ad-engine/scalable-ugc-pipeline';
import { FlowAIIntegration } from '../ad-engine/flow-ai-integration';

async function runDemo() {
  console.log('🚀 Starting AI UGC Content Generation Demo...\n');

  const basePath = '/Users/mac/Desktop/Risewithin Shopify/dropship-os/launch/ugc-factory';
  const pipeline = new ScalableUGCPipeline(basePath);
  const flowAI = new FlowAIIntegration(basePath);

  // Load sample products
  const productsPath = path.join(basePath, 'products', 'sample-products.json');
  const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  const products = productsData.products;

  console.log(`📦 Loaded ${products.length} sample products\n`);

  // Add products to pipeline
  products.forEach((product: any) => {
    pipeline.addProduct(product);
  });

  // Generate content for each product
  const results = [];

  for (const product of products) {
    console.log(`\n🎬 Generating content for: ${product.name} (${product.category})`);

    // Get appropriate character for category
    const character = flowAI.getCharacterByCategory(product.category);
    if (!character) {
      console.log(`⚠️  No character found for category: ${product.category}`);
      continue;
    }

    // Get scenes for category
    const scenes = flowAI.getScenesByCategory(product.category);
    if (scenes.length === 0) {
      console.log(`⚠️  No scenes found for category: ${product.category}`);
      continue;
    }

    // Get all motions
    const motions = flowAI.getMotions();
    if (motions.length === 0) {
      console.log(`⚠️  No motions available`);
      continue;
    }

    // Generate 3 videos per product (for demo)
    const videoCount = 3;
    const configs = [];

    for (let i = 0; i < videoCount; i++) {
      const scene = scenes[i % scenes.length];
      const motion = motions[i % motions.length];

      const content = flowAI.generateConsistentContent({
        characterId: character.id,
        sceneId: scene.id,
        motionId: motion.id,
        product: product.name,
        category: product.category,
        problemStatement: product.problemStatement,
        transformationStatement: product.transformationStatement
      });

      configs.push(content);
      console.log(`✅ Generated video ${i + 1}/${videoCount}: ${scene.name} + ${motion.name}`);

      // Save individual content
      await flowAI.saveFlowAIContent(content);
    }

    results.push({
      product: product.name,
      category: product.category,
      videosGenerated: videoCount,
      content: configs
    });
  }

  // Summary
  console.log('\n\n📊 GENERATION SUMMARY');
  console.log('=' .repeat(50));
  console.log(`Total products processed: ${results.length}`);
  console.log(`Total videos generated: ${results.reduce((sum, r) => sum + r.videosGenerated, 0)}`);
  console.log('\nBreakdown by category:');

  const categorySummary: Record<string, number> = {};
  results.forEach(result => {
    categorySummary[result.category] = (categorySummary[result.category] || 0) + result.videosGenerated;
  });

  Object.entries(categorySummary).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} videos`);
  });

  console.log('\n✅ Demo generation complete!');
  console.log('📁 Content saved to: flow-ai-output/');
  console.log('📁 Batch results saved to: batch-output/');
}

// Run the demo
runDemo().catch(error => {
  console.error('❌ Demo failed:', error);
  process.exit(1);
});
