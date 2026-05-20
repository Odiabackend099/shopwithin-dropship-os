import * as fs from 'fs';
import * as path from 'path';
import { MasterPromptGenerator } from './master-prompt-generator';
import { HookLibrary } from '../templates/hook-library';
import { ScriptTemplates } from '../templates/script-templates';
import { CaptionTemplates } from '../templates/caption-templates';

interface Character {
  id: string;
  name: string;
  character_block: string;
  camera_block: string;
  environment_block: string;
  platform_block: string;
  lighting_block: string;
  motion_block: string;
  audio_block: string;
  negative_prompt_block: string;
}

interface Scene {
  id: string;
  name: string;
  environment_block: string;
  camera_block: string;
  product_interaction_block: string;
  performance_block: string;
  platform_block: string;
  lighting_block: string;
  motion_block: string;
  audio_block: string;
  negative_prompt_block: string;
}

interface Motion {
  id: string;
  name: string;
  camera_block: string;
  body_language_block: string;
  timing_block: string;
  expression_block: string;
  platform_block: string;
  negative_prompt_block: string;
}

interface FlowAIContent {
  prompt: string;
  hook: string;
  script: string[];
  caption: string;
  character: string;
  scene: string;
  motion: string;
  product: string;
  category: string;
}

export class FlowAIIntegration {
  private basePath: string;
  private promptGenerator: MasterPromptGenerator;
  private characters: Map<string, Character>;
  private scenes: Map<string, Scene>;
  private motions: Map<string, Motion>;
  private outputPath: string;

  constructor(basePath: string = '/Users/mac/Desktop/Risewithin Shopify/dropship-os/launch/ugc-factory') {
    this.basePath = basePath;
    this.promptGenerator = new MasterPromptGenerator(basePath);
    this.characters = new Map();
    this.scenes = new Map();
    this.motions = new Map();
    this.outputPath = path.join(basePath, 'flow-ai-output');
    
    this.loadTemplates();
  }

  private loadTemplates(): void {
    // Load characters
    const charactersPath = path.join(this.basePath, 'characters');
    if (fs.existsSync(charactersPath)) {
      const files = fs.readdirSync(charactersPath).filter((f: string) => f.endsWith('.json'));
      files.forEach((file: string) => {
        const content = JSON.parse(fs.readFileSync(path.join(charactersPath, file), 'utf-8'));
        this.characters.set(content.id, content);
      });
      console.log(`✅ Loaded ${this.characters.size} character templates`);
    }

    // Load scenes
    const scenesPath = path.join(this.basePath, 'scenes');
    if (fs.existsSync(scenesPath)) {
      const files = fs.readdirSync(scenesPath).filter((f: string) => f.endsWith('.json'));
      files.forEach((file: string) => {
        const content = JSON.parse(fs.readFileSync(path.join(scenesPath, file), 'utf-8'));
        this.scenes.set(content.id, content);
      });
      console.log(`✅ Loaded ${this.scenes.size} scene templates`);
    }

    // Load motions
    const motionsPath = path.join(this.basePath, 'motions');
    if (fs.existsSync(motionsPath)) {
      const files = fs.readdirSync(motionsPath).filter((f: string) => f.endsWith('.json'));
      files.forEach((file: string) => {
        const content = JSON.parse(fs.readFileSync(path.join(motionsPath, file), 'utf-8'));
        this.motions.set(content.id, content);
      });
      console.log(`✅ Loaded ${this.motions.size} motion templates`);
    }
  }

  generateConsistentContent(config: {
    characterId: string;
    sceneId: string;
    motionId: string;
    product: string;
    category: string;
    problemStatement: string;
    transformationStatement: string;
  }): FlowAIContent {
    const character = this.characters.get(config.characterId);
    const scene = this.scenes.get(config.sceneId);
    const motion = this.motions.get(config.motionId);

    if (!character || !scene || !motion) {
      throw new Error(`Missing templates: character=${!!character}, scene=${!!scene}, motion=${!!motion}`);
    }

    // Generate hook
    const hook = HookLibrary.getRandomHook(config.category);

    // Generate script
    const script = ScriptTemplates.getRandomScript(config.category, {
      product: config.product,
      problem: config.problemStatement,
      solution: config.transformationStatement
    });

    // Generate Flow AI prompt using master prompt generator
    const prompt = this.promptGenerator.generateMasterPrompt(
      config.characterId,
      config.sceneId,
      config.motionId,
      config.product,
      config.problemStatement
    );

    // Generate caption
    const caption = CaptionTemplates.generateFullCaption(config.category);

    return {
      prompt,
      hook,
      script,
      caption,
      character: character.name,
      scene: scene.name,
      motion: motion.name,
      product: config.product,
      category: config.category
    };
  }

  generateBatchContent(configs: Array<{
    characterId: string;
    sceneId: string;
    motionId: string;
    product: string;
    category: string;
    problemStatement: string;
    transformationStatement: string;
  }>): FlowAIContent[] {
    return configs.map(config => this.generateConsistentContent(config));
  }

  async saveFlowAIContent(content: FlowAIContent): Promise<void> {
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${content.category}-${content.product}-${timestamp}`;
    const filepath = path.join(this.outputPath, `${filename}.json`);

    const data = {
      ...content,
      generatedAt: new Date().toISOString()
    };

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`💾 Saved Flow AI content to: ${filepath}`);
  }

  async saveBatchFlowAIContent(contents: FlowAIContent[]): Promise<void> {
    for (const content of contents) {
      await this.saveFlowAIContent(content);
    }
  }

  getCharacterByCategory(category: string): Character | null {
    const categoryCharacterMap: Record<string, string> = {
      pet: 'sarah-pet-mom',
      car: 'car-enthusiast',
      home: 'home-organizer',
      kitchen: 'kitchen-enthusiast',
      beauty: 'beauty-enthusiast',
      wellness: 'wellness-enthusiast',
      gadgets: 'tech-reviewer',
      organization: 'home-organizer',
      travel: 'travel-enthusiast'
    };

    const characterId = categoryCharacterMap[category];
    if (!characterId) {
      return null;
    }

    return this.characters.get(characterId) || null;
  }

  getScenesByCategory(category: string): Scene[] {
    const categorySceneMap: Record<string, string[]> = {
      pet: ['couch-cleaning', 'car-seat-cleaning', 'before-after'],
      car: ['car-interior-demo'],
      home: ['organization-transformation'],
      kitchen: ['kitchen-gadget-demo'],
      beauty: ['beauty-tool-demo'],
      wellness: ['wellness-relaxation'],
      gadgets: ['gadget-demonstration'],
      organization: ['organization-transformation'],
      travel: ['travel-packing']
    };

    const sceneIds = categorySceneMap[category] || [];
    return sceneIds
      .map(id => this.scenes.get(id))
      .filter((scene): scene is Scene => scene !== undefined);
  }

  getMotions(): Motion[] {
    return Array.from(this.motions.values());
  }

  getAvailableCharacters(): Character[] {
    return Array.from(this.characters.values());
  }

  getAvailableScenes(): Scene[] {
    return Array.from(this.scenes.values());
  }

  getAvailableMotions(): Motion[] {
    return Array.from(this.motions.values());
  }
}
