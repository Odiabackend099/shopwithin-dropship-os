import { PromptGenerator } from './prompt-generator';
import { HookGenerator } from './hook-generator';
import { ScriptGenerator } from './script-generator';
import { CaptionGenerator } from './caption-generator';
import * as fs from 'fs';
import * as path from 'path';

interface ProductDefinition {
  name: string;
  sku: string;
  problemStatement: string;
  transformationStatement: string;
  targetAudience: string;
  emotionalHooks: string[];
  ctaVariants: string[];
}

interface UGCConfig {
  characterId: string;
  sceneId: string;
  motionId: string;
  productId: string;
  duration: number;
  platform: 'tiktok' | 'reels' | 'shorts';
}

export class UGCFactory {
  private promptGenerator: PromptGenerator;
  private hookGenerator: HookGenerator;
  private scriptGenerator: ScriptGenerator;
  private captionGenerator: CaptionGenerator;
  private outputPath: string;

  constructor() {
    this.promptGenerator = new PromptGenerator();
    this.hookGenerator = new HookGenerator();
    this.scriptGenerator = new ScriptGenerator();
    this.captionGenerator = new CaptionGenerator();
    this.outputPath = '/Users/mac/Desktop/Risewithin Shopify/dropship-os/launch/ugc-factory/prompts';
  }

  async generateUGC(config: UGCConfig, product: ProductDefinition): Promise<{
    prompt: string;
    script: string;
    captions: string;
    hook: string;
  }> {
    // Generate hook
    const hook = this.hookGenerator.generateHook(product);

    // Generate script
    const script = this.scriptGenerator.generateScript(product, config.sceneId);

    // Generate Flow AI prompt
    const prompt = this.promptGenerator.generateFlowPrompt(
      config.characterId,
      config.sceneId,
      config.motionId,
      product.name,
      product.problemStatement
    );

    // Generate captions
    const captions = this.captionGenerator.generateCaptions(script, config.duration);
    const srtCaptions = this.captionGenerator.generateSRT(captions);

    // Save outputs
    await this.saveOutputs(config, {
      prompt,
      script,
      captions: srtCaptions,
      hook
    });

    return {
      prompt,
      script,
      captions: srtCaptions,
      hook
    };
  }

  private async saveOutputs(config: UGCConfig, outputs: {
    prompt: string;
    script: string;
    captions: string;
    hook: string;
  }): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${config.productId}-${config.sceneId}-${timestamp}`;
    const filepath = path.join(this.outputPath, `${filename}.json`);

    const data = {
      config,
      ...outputs,
      generatedAt: new Date().toISOString()
    };

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`Saved UGC generation to: ${filepath}`);
  }

  async generateBatch(configs: UGCConfig[], product: ProductDefinition): Promise<void> {
    for (const config of configs) {
      await this.generateUGC(config, product);
    }
  }
}

// Example usage
const factory = new UGCFactory();

const furliftProduct: ProductDefinition = {
  name: 'FurLift',
  sku: 'VLOY30HZN',
  problemStatement: 'Pet hair sticks to every couch, car seat, and sweater. Lint rollers run out. Vacuums are bulky. Nothing actually works fast.',
  transformationStatement: 'One swipe with FurLift lifts embedded pet hair instantly. No refills, no batteries, reusable forever.',
  targetAudience: 'Pet owners aged 25–54, mostly women, who clean hair daily from furniture, clothes, and cars.',
  emotionalHooks: [
    'You love your pet, but you hate the hair everywhere.',
    'Your couch looks like a fur coat.',
    'Guests are coming in 10 minutes.',
    'That black sweater is ruined again.',
    'You just bought a lint roller and it is already empty.'
  ],
  ctaVariants: [
    'Get FurLift for $24.95 — free shipping today',
    'Tap the link in bio before stock runs out',
    'Shop now and stop picking hair off your clothes',
    'Limited launch price — claim yours',
    'Link in bio — your couch will thank you'
  ]
};

const configs: UGCConfig[] = [
  {
    characterId: 'sarah-pet-mom',
    sceneId: 'couch-cleaning',
    motionId: 'hand-demo',
    productId: 'furlift',
    duration: 15,
    platform: 'tiktok'
  },
  {
    characterId: 'sarah-pet-mom',
    sceneId: 'car-seat-cleaning',
    motionId: 'before-after-reveal',
    productId: 'furlift',
    duration: 15,
    platform: 'tiktok'
  }
];

factory.generateBatch(configs, furliftProduct).then(() => {
  console.log('Batch generation complete');
});
