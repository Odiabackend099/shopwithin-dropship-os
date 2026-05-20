import * as fs from 'fs';
import * as path from 'path';
import { UGCWorkflow } from '../workflow/ugc-workflow';

interface ProductCategory {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  hashtags: string[];
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  problemStatement: string;
  transformationStatement: string;
  emotionalHooks: string[];
  ctaVariants: string[];
}

interface ContentBatchConfig {
  productId: string;
  characterId: string;
  sceneIds: string[];
  motionIds: string[];
  videoCount: number;
  platforms: ('tiktok' | 'reels' | 'shorts')[];
  duration: number;
}

interface GenerationResult {
  productId: string;
  totalVideos: number;
  prompts: string[];
  scripts: string[];
  hooks: string[];
  captions: string[];
  timestamp: string;
}

export class ScalableUGCPipeline {
  private basePath: string;
  private outputPath: string;
  private workflow: UGCWorkflow;
  private productCategories: Map<string, ProductCategory>;
  private products: Map<string, Product>;
  private characters: Map<string, any>;
  private scenes: Map<string, any>;
  private motions: Map<string, any>;

  constructor(basePath: string = '/Users/mac/Desktop/Risewithin Shopify/dropship-os/launch/ugc-factory') {
    this.basePath = basePath;
    this.outputPath = path.join(basePath, 'batch-output');
    this.workflow = new UGCWorkflow(basePath);
    this.productCategories = new Map();
    this.products = new Map();
    this.characters = new Map();
    this.scenes = new Map();
    this.motions = new Map();
    
    this.initializePipeline();
  }

  private async initializePipeline(): Promise<void> {
    console.log('🚀 Initializing Scalable UGC Pipeline...');
    
    // Load product categories
    await this.loadProductCategories();
    
    // Load existing templates
    await this.loadTemplates();
    
    console.log('✅ Pipeline initialized successfully');
  }

  private async loadProductCategories(): Promise<void> {
    const categories: ProductCategory[] = [
      {
        id: 'pet',
        name: 'Pet Care',
        description: 'Products for pet owners dealing with shedding, grooming, and pet-related messes',
        targetAudience: 'Pet owners aged 25-54, mostly women',
        hashtags: ['#petsoftiktok', '#dogsoftiktok', '#catsoftiktok', '#petcare', '#pethairremoval', '#petproducts']
      },
      {
        id: 'car',
        name: 'Car Accessories',
        description: 'Car gadgets, organizers, cleaning tools, and accessories',
        targetAudience: 'Car owners aged 18-45, both genders',
        hashtags: ['#carsoftiktok', '#cargadgets', '#caraccessories', '#cardiffuser', '#cargoodthing']
      },
      {
        id: 'home',
        name: 'Home Solutions',
        description: 'Home organization, cleaning tools, and household problem solvers',
        targetAudience: 'Homeowners and renters aged 25-55',
        hashtags: ['#hometok', '#homehacks', '#cleantok', '#organization', '#homeorganization']
      },
      {
        id: 'kitchen',
        name: 'Kitchen Gadgets',
        description: 'Kitchen tools, gadgets, and cooking accessories',
        targetAudience: 'Home cooks aged 25-55',
        hashtags: ['#kitchentok', '#kitchenhacks', '#cookinghacks', '#kitchengadgets']
      },
      {
        id: 'beauty',
        name: 'Beauty Tools',
        description: 'Beauty gadgets, skincare tools, and personal care accessories',
        targetAudience: 'Beauty enthusiasts aged 18-45, mostly women',
        hashtags: ['#beautytok', '#skincaretok', '#beautygadgets', '#beautyhacks']
      },
      {
        id: 'wellness',
        name: 'Wellness Products',
        description: 'Self-care, relaxation, and wellness accessories',
        targetAudience: 'Wellness-conscious adults aged 25-55',
        hashtags: ['#wellnesstok', '#selfcare', '#wellnesshacks', '#relaxation']
      },
      {
        id: 'gadgets',
        name: 'Tech Gadgets',
        description: 'Tech accessories, phone gadgets, and electronic problem solvers',
        targetAudience: 'Tech enthusiasts aged 18-45',
        hashtags: ['#techtok', '#gadgets', '#phoneaccessories', '#techhacks']
      },
      {
        id: 'organization',
        name: 'Organization',
        description: 'Storage solutions, organizers, and decluttering tools',
        targetAudience: 'Organizers aged 25-55',
        hashtags: ['#organizationtok', '#storagehacks', '#declutter', '#organizing']
      },
      {
        id: 'travel',
        name: 'Travel Accessories',
        description: 'Travel gadgets, packing solutions, and on-the-go accessories',
        targetAudience: 'Travelers aged 25-55',
        hashtags: ['#traveltok', '#travelhacks', '#travelaccessories', '#packing']
      }
    ];

    categories.forEach(cat => this.productCategories.set(cat.id, cat));
    console.log(`✅ Loaded ${categories.length} product categories`);
  }

  private async loadTemplates(): Promise<void> {
    // Load characters
    const charactersPath = path.join(this.basePath, 'characters');
    if (fs.existsSync(charactersPath)) {
      const files = fs.readdirSync(charactersPath).filter(f => f.endsWith('.json'));
      files.forEach(file => {
        const content = JSON.parse(fs.readFileSync(path.join(charactersPath, file), 'utf-8'));
        this.characters.set(content.id, content);
      });
      console.log(`✅ Loaded ${this.characters.size} character templates`);
    }

    // Load scenes
    const scenesPath = path.join(this.basePath, 'scenes');
    if (fs.existsSync(scenesPath)) {
      const files = fs.readdirSync(scenesPath).filter(f => f.endsWith('.json'));
      files.forEach(file => {
        const content = JSON.parse(fs.readFileSync(path.join(scenesPath, file), 'utf-8'));
        this.scenes.set(content.id, content);
      });
      console.log(`✅ Loaded ${this.scenes.size} scene templates`);
    }

    // Load motions
    const motionsPath = path.join(this.basePath, 'motions');
    if (fs.existsSync(motionsPath)) {
      const files = fs.readdirSync(motionsPath).filter(f => f.endsWith('.json'));
      files.forEach(file => {
        const content = JSON.parse(fs.readFileSync(path.join(motionsPath, file), 'utf-8'));
        this.motions.set(content.id, content);
      });
      console.log(`✅ Loaded ${this.motions.size} motion templates`);
    }
  }

  addProduct(product: Product): void {
    this.products.set(product.id, product);
    console.log(`✅ Added product: ${product.name} (${product.category})`);
  }

  async generateContentBatch(config: ContentBatchConfig): Promise<GenerationResult> {
    const product = this.products.get(config.productId);
    if (!product) {
      throw new Error(`Product not found: ${config.productId}`);
    }

    console.log(`\n🎬 Starting content batch for: ${product.name}`);
    console.log(`Videos to generate: ${config.videoCount}`);
    console.log(`Platforms: ${config.platforms.join(', ')}`);
    console.log(`Character: ${config.characterId}`);
    console.log('');

    const result: GenerationResult = {
      productId: product.id,
      totalVideos: config.videoCount,
      prompts: [],
      scripts: [],
      hooks: [],
      captions: [],
      timestamp: new Date().toISOString()
    };

    // Generate content for each video
    for (let i = 0; i < config.videoCount; i++) {
      const sceneId = config.sceneIds[i % config.sceneIds.length];
      const motionId = config.motionIds[i % config.motionIds.length];

      const videoContent = this.workflow.generateSingleVideo({
        characterId: config.characterId,
        sceneId,
        motionId,
        productName: product.name,
        productDescription: product.problemStatement,
        hook: product.emotionalHooks[i % product.emotionalHooks.length]
      });

      result.prompts.push(videoContent.prompt);
      result.scripts.push(videoContent.script);
      result.hooks.push(videoContent.hook);
      result.captions.push(videoContent.caption);

      console.log(`✅ Generated video ${i + 1}/${config.videoCount} (${sceneId} + ${motionId})`);
    }

    // Save batch results
    await this.saveBatchResult(result, config);

    console.log(`\n🎉 Batch generation complete for: ${product.name}`);
    console.log(`Total videos: ${result.totalVideos}`);
    console.log(`Prompts: ${result.prompts.length}`);
    console.log(`Scripts: ${result.scripts.length}`);
    console.log(`Hooks: ${result.hooks.length}`);
    console.log(`Captions: ${result.captions.length}`);

    return result;
  }

  async generateMultiProductBatch(configs: ContentBatchConfig[]): Promise<GenerationResult[]> {
    console.log(`\n🚀 Starting multi-product batch generation...`);
    console.log(`Products: ${configs.length}`);
    console.log(`Total videos: ${configs.reduce((sum, c) => sum + c.videoCount, 0)}`);
    console.log('');

    const results: GenerationResult[] = [];

    for (const config of configs) {
      const result = await this.generateContentBatch(config);
      results.push(result);
    }

    console.log(`\n🎉 Multi-product batch generation complete!`);
    console.log(`Total products: ${results.length}`);
    console.log(`Total videos generated: ${results.reduce((sum, r) => sum + r.totalVideos, 0)}`);

    return results;
  }

  private async saveBatchResult(result: GenerationResult, config: ContentBatchConfig): Promise<void> {
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const batchPath = path.join(this.outputPath, `${config.productId}_${timestamp}`);
    fs.mkdirSync(batchPath, { recursive: true });

    // Save prompts
    const promptsPath = path.join(batchPath, 'prompts');
    fs.mkdirSync(promptsPath, { recursive: true });
    result.prompts.forEach((prompt, index) => {
      fs.writeFileSync(path.join(promptsPath, `prompt_${index + 1}.txt`), prompt, 'utf-8');
    });

    // Save scripts
    fs.writeFileSync(
      path.join(batchPath, 'scripts.json'),
      JSON.stringify(result.scripts, null, 2),
      'utf-8'
    );

    // Save hooks
    fs.writeFileSync(
      path.join(batchPath, 'hooks.json'),
      JSON.stringify(result.hooks, null, 2),
      'utf-8'
    );

    // Save captions
    fs.writeFileSync(
      path.join(batchPath, 'captions.json'),
      JSON.stringify(result.captions, null, 2),
      'utf-8'
    );

    // Save batch metadata
    const metadata = {
      ...result,
      config,
      generatedAt: new Date().toISOString()
    };
    fs.writeFileSync(
      path.join(batchPath, 'batch-metadata.json'),
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );

    console.log(`💾 Saved batch results to: ${batchPath}`);
  }

  getAvailableCategories(): ProductCategory[] {
    return Array.from(this.productCategories.values());
  }

  getAvailableProducts(): Product[] {
    return Array.from(this.products.values());
  }

  getAvailableCharacters(): any[] {
    return Array.from(this.characters.values());
  }

  getAvailableScenes(): any[] {
    return Array.from(this.scenes.values());
  }

  getAvailableMotions(): any[] {
    return Array.from(this.motions.values());
  }
}

// Export for use
export { ScalableUGCPipeline };
