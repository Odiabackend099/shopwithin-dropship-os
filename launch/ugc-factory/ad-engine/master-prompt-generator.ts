import * as fs from 'fs';
import * as path from 'path';

interface Character {
  id: string;
  name: string;
  character_block: string;
  camera_block: string;
  environment_block: string;
  platform_block: string;
  lighting_block: string;
  audio_block: string;
  negative_prompt_block: string;
  [key: string]: any;
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
  [key: string]: any;
}

interface Motion {
  id: string;
  name: string;
  camera_block: string;
  motion_block: string;
  performance_block: string;
  platform_block: string;
  audio_block: string;
  negative_prompt_block: string;
  [key: string]: any;
}

export class MasterPromptGenerator {
  private charactersPath: string;
  private scenesPath: string;
  private motionsPath: string;
  private outputPath: string;

  constructor(basePath: string = '/Users/mac/Desktop/Risewithin Shopify/dropship-os/launch/ugc-factory') {
    this.charactersPath = path.join(basePath, 'characters');
    this.scenesPath = path.join(basePath, 'scenes');
    this.motionsPath = path.join(basePath, 'motions');
    this.outputPath = path.join(basePath, 'output');
  }

  loadCharacter(characterId: string): Character {
    const filePath = path.join(this.charactersPath, `${characterId}.json`);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }

  loadScene(sceneId: string): Scene {
    const filePath = path.join(this.scenesPath, `${sceneId}.json`);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }

  loadMotion(motionId: string): Motion {
    const filePath = path.join(this.motionsPath, `${motionId}.json`);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }

  generateMasterPrompt(
    characterId: string,
    sceneId: string,
    motionId: string,
    productName: string,
    productDescription: string
  ): string {
    const character = this.loadCharacter(characterId);
    const scene = this.loadScene(sceneId);
    const motion = this.loadMotion(motionId);

    const prompt = this.buildMasterPrompt(character, scene, motion, productName, productDescription);
    return prompt;
  }

  private buildMasterPrompt(
    character: Character,
    scene: Scene,
    motion: Motion,
    productName: string,
    productDescription: string
  ): string {
    const blocks = [
      this.buildCharacterBlock(character, productName),
      this.buildCameraBlock(character.camera_block),
      this.buildEnvironmentBlock(scene.environment_block),
      this.buildProductInteractionBlock(scene.product_interaction_block, productName),
      this.buildPerformanceBlock(scene.performance_block),
      this.buildPlatformBlock(scene.platform_block),
      this.buildLightingBlock(scene.lighting_block),
      this.buildMotionBlock(motion.motion_block),
      this.buildAudioBlock(scene.audio_block),
      this.buildNegativePrompt(character.negative_prompt_block)
    ];

    return blocks.filter(block => block.trim()).join('\n\n');
  }

  private buildCharacterBlock(character: Character, productName: string): string {
    return character.character_block || '';
  }

  private buildCameraBlock(cameraBlock: string): string {
    return cameraBlock || '';
  }

  private buildEnvironmentBlock(environmentBlock: string): string {
    return environmentBlock || '';
  }

  private buildProductInteractionBlock(interactionBlock: string, productName: string): string {
    return interactionBlock || '';
  }

  private buildPerformanceBlock(performanceBlock: string): string {
    return performanceBlock || '';
  }

  private buildPlatformBlock(platformBlock: string): string {
    return platformBlock || '';
  }

  private buildLightingBlock(lightingBlock: string): string {
    return lightingBlock || '';
  }

  private buildMotionBlock(motionBlock: string): string {
    return motionBlock || '';
  }

  private buildAudioBlock(audioBlock: string): string {
    return audioBlock || '';
  }

  private buildNegativePrompt(negativeBlock: string): string {
    return negativeBlock || '';
  }

  generateBatchPrompts(config: {
    characterId: string;
    sceneIds: string[];
    motionIds: string[];
    productName: string;
    productDescription: string;
  }): Array<{ sceneId: string; motionId: string; prompt: string }> {
    const results: Array<{ sceneId: string; motionId: string; prompt: string }> = [];

    for (const sceneId of config.sceneIds) {
      for (const motionId of config.motionIds) {
        const prompt = this.generateMasterPrompt(
          config.characterId,
          sceneId,
          motionId,
          config.productName,
          config.productDescription
        );
        results.push({ sceneId, motionId, prompt });
      }
    }

    return results;
  }

  savePrompt(prompt: string, filename: string): void {
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }

    const filePath = path.join(this.outputPath, filename);
    fs.writeFileSync(filePath, prompt, 'utf-8');
    console.log(`Prompt saved to: ${filePath}`);
  }

  saveBatchPrompts(prompts: Array<{ sceneId: string; motionId: string; prompt: string }>, prefix: string): void {
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }

    prompts.forEach(({ sceneId, motionId, prompt }) => {
      const filename = `${prefix}_${sceneId}_${motionId}.txt`;
      const filePath = path.join(this.outputPath, filename);
      fs.writeFileSync(filePath, prompt, 'utf-8');
      console.log(`Prompt saved to: ${filePath}`);
    });
  }
}

// Example usage
if (require.main === module) {
  const generator = new MasterPromptGenerator();
  
  // Single prompt generation
  const prompt = generator.generateMasterPrompt(
    'sarah-pet-mom',
    'couch-cleaning',
    'hand-demo',
    'FurLift',
    'blue reusable pet hair remover'
  );
  console.log('=== GENERATED MASTER PROMPT ===');
  console.log(prompt);
  console.log('\n');

  // Batch prompt generation
  const batchPrompts = generator.generateBatchPrompts({
    characterId: 'sarah-pet-mom',
    sceneIds: ['couch-cleaning', 'car-seat-cleaning', 'before-after'],
    motionIds: ['selfie-talking', 'hand-demo', 'reaction-zoom'],
    productName: 'FurLift',
    productDescription: 'blue reusable pet hair remover'
  });

  generator.saveBatchPrompts(batchPrompts, 'furlift_ugc');
  console.log(`Generated ${batchPrompts.length} batch prompts`);
}

export { MasterPromptGenerator };
