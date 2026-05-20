const fs = require('fs');
const path = require('path');

// Load the infrastructure components
const basePath = '/Users/mac/Desktop/Risewithin Shopify/dropship-os/launch/ugc-factory';

console.log('🚀 Generating Flow AI prompts for sample products...\n');

// Load sample products
const productsPath = path.join(basePath, 'products', 'sample-products.json');
const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
const products = productsData.products;

// Load hook library
const hookLibraryPath = path.join(basePath, 'templates', 'hook-library.ts');
const hookLibraryContent = fs.readFileSync(hookLibraryPath, 'utf-8');

// Load script templates
const scriptTemplatesPath = path.join(basePath, 'templates', 'script-templates.ts');
const scriptTemplatesContent = fs.readFileSync(scriptTemplatesPath, 'utf-8');

// Load caption templates
const captionTemplatesPath = path.join(basePath, 'templates', 'caption-templates.ts');
const captionTemplatesContent = fs.readFileSync(captionTemplatesPath, 'utf-8');

// Load characters
const charactersPath = path.join(basePath, 'characters');
const characterFiles = fs.readdirSync(charactersPath).filter(f => f.endsWith('.json'));
const characters = characterFiles.map(file => {
  return JSON.parse(fs.readFileSync(path.join(charactersPath, file), 'utf-8'));
});

// Load scenes
const scenesPath = path.join(basePath, 'scenes');
const sceneFiles = fs.readdirSync(scenesPath).filter(f => f.endsWith('.json'));
const scenes = sceneFiles.map(file => {
  return JSON.parse(fs.readFileSync(path.join(scenesPath, file), 'utf-8'));
});

// Load motions
const motionsPath = path.join(basePath, 'motions');
const motionFiles = fs.readdirSync(motionsPath).filter(f => f.endsWith('.json'));
const motions = motionFiles.map(file => {
  return JSON.parse(fs.readFileSync(path.join(motionsPath, file), 'utf-8'));
});

console.log(`✅ Loaded infrastructure:`);
console.log(`  - ${products.length} products`);
console.log(`  - ${characters.length} characters`);
console.log(`  - ${scenes.length} scenes`);
console.log(`  - ${motions.length} motions\n`);

// Generate Flow AI prompts for each product
const flowPrompts = [];

products.forEach(product => {
  console.log(`🎬 Generating prompts for: ${product.name} (${product.category})`);
  
  // Get appropriate character for category
  const character = characters.find(c => 
    c.id.includes(product.category) || 
    (product.category === 'pet' && c.id.includes('pet')) ||
    (product.category === 'gadgets' && c.id.includes('tech')) ||
    (product.category === 'organization' && c.id.includes('organizer')) ||
    (product.category === 'car' && c.id.includes('car')) ||
    (product.category === 'kitchen' && c.id.includes('kitchen')) ||
    (product.category === 'beauty' && c.id.includes('beauty')) ||
    (product.category === 'wellness' && c.id.includes('wellness')) ||
    (product.category === 'travel' && c.id.includes('travel')) ||
    (product.category === 'home' && c.id.includes('home'))
  ) || characters[0]; // Default to first character if no match
  
  // Get scenes for category
  const categoryScenes = scenes.filter(s => 
    s.id.includes(product.category) ||
    (product.category === 'pet' && (s.id.includes('couch') || s.id.includes('cleaning'))) ||
    (product.category === 'home' && (s.id.includes('home') || s.id.includes('organization'))) ||
    (product.category === 'gadgets' && s.id.includes('gadget')) ||
    (product.category === 'car' && s.id.includes('car')) ||
    (product.category === 'kitchen' && s.id.includes('kitchen')) ||
    (product.category === 'beauty' && s.id.includes('beauty')) ||
    (product.category === 'wellness' && s.id.includes('wellness')) ||
    (product.category === 'travel' && s.id.includes('travel')) ||
    (product.category === 'organization' && s.id.includes('organization'))
  ) || scenes.slice(0, 3); // Default to first 3 scenes if no match
  
  // Generate 3 prompts per product with different combinations
  for (let i = 0; i < 3; i++) {
    const scene = categoryScenes[i % categoryScenes.length] || scenes[i % scenes.length];
    const motion = motions[i % motions.length];
    const hook = product.emotionalHooks[i % product.emotionalHooks.length];
    const cta = product.ctaVariants[i % product.ctaVariants.length];
    
    // Generate Flow AI master prompt
    const flowPrompt = {
      productId: product.id,
      productName: product.name,
      category: product.category,
      variant: i + 1,
      character: {
        id: character.id,
        name: character.name,
        character_block: character.character_block,
        camera_block: character.camera_block,
        environment_block: character.environment_block,
        platform_block: character.platform_block,
        lighting_block: character.lighting_block,
        motion_block: character.motion_block,
        audio_block: character.audio_block,
        negative_prompt_block: character.negative_prompt_block
      },
      scene: {
        id: scene.id,
        name: scene.name,
        environment_block: scene.environment_block,
        camera_block: scene.camera_block,
        product_interaction_block: scene.product_interaction_block,
        performance_block: scene.performance_block,
        platform_block: scene.platform_block,
        lighting_block: scene.lighting_block,
        motion_block: scene.motion_block,
        audio_block: scene.audio_block,
        negative_prompt_block: scene.negative_prompt_block
      },
      motion: {
        id: motion.id,
        name: motion.name,
        camera_block: motion.camera_block,
        body_language_block: motion.body_language_block,
        timing_block: motion.timing_block,
        expression_block: motion.expression_block,
        platform_block: motion.platform_block,
        negative_prompt_block: motion.negative_prompt_block
      },
      content: {
        hook: hook,
        problemStatement: product.problemStatement,
        transformationStatement: product.transformationStatement,
        cta: cta,
        script: generateScript(product, hook, scene, motion),
        caption: generateCaption(product, hook, cta)
      },
      masterPrompt: generateMasterPrompt(character, scene, motion, product, hook)
    };
    
    flowPrompts.push(flowPrompt);
    console.log(`  ✅ Generated variant ${i + 1}: ${scene.name} + ${motion.name}`);
  }
  
  console.log('');
});

// Save Flow AI prompts
const outputPath = path.join(basePath, 'flow-ai-prompts');
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const promptsPath = path.join(outputPath, `flow-prompts-${timestamp}.json`);
fs.writeFileSync(promptsPath, JSON.stringify(flowPrompts, null, 2));

console.log(`💾 Saved ${flowPrompts.length} Flow AI prompts to: ${promptsPath}`);
console.log('\n📊 Generation Summary:');
console.log(`  Total products: ${products.length}`);
console.log(`  Total prompts generated: ${flowPrompts.length}`);
console.log(`  Prompts per product: 3`);
console.log('\n🚀 Ready to use these prompts with Flow AI API to generate actual videos!');

function generateScript(product, hook, scene, motion) {
  return [
    hook,
    product.problemStatement,
    `Let me show you how ${product.name} solves this.`,
    product.transformationStatement,
    `It's so simple and effective.`,
    product.ctaVariants[0]
  ];
}

function generateCaption(product, hook, cta) {
  return `${hook}\n\n${product.transformationStatement}\n\n${cta}\n\n#fyp #viral #trending #${product.category} #problemsolver #lifehack`;
}

function generateMasterPrompt(character, scene, motion, product, hook) {
  return `
CHARACTER BLOCK
${character.character_block}

CAMERA BLOCK
${character.camera_block}

ENVIRONMENT BLOCK
${scene.environment_block}

PRODUCT INTERACTION BLOCK
${scene.product_interaction_block}

PERFORMANCE BLOCK
${scene.performance_block}

PLATFORM BLOCK
${character.platform_block}

LIGHTING BLOCK
${character.lighting_block}

MOTION BLOCK
${motion.camera_block}
${motion.body_language_block}
${motion.timing_block}
${motion.expression_block}

AUDIO BLOCK
${character.audio_block}

NEGATIVE PROMPT BLOCK
${character.negative_prompt_block}
${scene.negative_prompt_block}
${motion.negative_prompt_block}

CONTENT DIRECTION
Hook: ${hook}
Problem: ${product.problemStatement}
Solution: ${product.transformationStatement}
Product: ${product.name}
Category: ${product.category}
`.trim();
}
