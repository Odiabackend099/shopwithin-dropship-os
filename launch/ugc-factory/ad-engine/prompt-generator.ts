import * as fs from 'fs';
import * as path from 'path';

interface Character {
  id: string;
  name: string;
  [key: string]: any;
}

interface Scene {
  id: string;
  name: string;
  [key: string]: any;
}

interface Motion {
  id: string;
  name: string;
  [key: string]: any;
}

export class PromptGenerator {
  private charactersPath: string;
  private scenesPath: string;
  private motionsPath: string;

  constructor(basePath: string = '/Users/mac/Desktop/Risewithin Shopify/dropship-os/launch/ugc-factory') {
    this.charactersPath = path.join(basePath, 'characters');
    this.scenesPath = path.join(basePath, 'scenes');
    this.motionsPath = path.join(basePath, 'motions');
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

  generateFlowPrompt(
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
      this.buildCharacterBlock(character),
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

    return blocks.join('\n\n');
  }

  private buildCharacterBlock(character: Character): string {
    return character.character_block || `Realistic TikTok UGC video of a ${character.age}-year-old ${character.hair} ${character.gender} UGC creator with ${character.makeup}, ${character.clothing}, ${character.skin}, ${character.aesthetic}, ${character.expression}, ${character.energy}.`;
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
}

// Example usage
const generator = new PromptGenerator();
const prompt = generator.generateFlowPrompt(
  'sarah-pet-mom',
  'couch-cleaning',
  'hand-demo',
  'FurLift',
  'blue reusable pet hair remover'
);
console.log(prompt);
