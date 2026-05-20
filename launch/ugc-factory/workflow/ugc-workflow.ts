import * as fs from 'fs';
import * as path from 'path';
import { MasterPromptGenerator } from '../ad-engine/master-prompt-generator';
import { HookGenerator } from '../ad-engine/hook-generator';
import { ScriptGenerator } from '../ad-engine/script-generator';
import { CaptionGenerator } from '../ad-engine/caption-generator';

interface WorkflowConfig {
  characterId: string;
  sceneIds: string[];
  motionIds: string[];
  productName: string;
  productDescription: string;
  outputPrefix: string;
}

interface WorkflowResult {
  hooks: string[];
  scripts: string[];
  captions: string[];
  prompts: Array<{ sceneId: string; motionId: string; prompt: string }>;
  timestamp: string;
}

export class UGCWorkflow {
  private basePath: string;
  private outputPath: string;
  private promptGenerator: MasterPromptGenerator;
  private hookGenerator: HookGenerator;
  private scriptGenerator: ScriptGenerator;
  private captionGenerator: CaptionGenerator;

  constructor(basePath: string = '/Users/mac/Desktop/Risewithin Shopify/dropship-os/launch/ugc-factory') {
    this.basePath = basePath;
    this.outputPath = path.join(basePath, 'output');
    this.promptGenerator = new MasterPromptGenerator(basePath);
    this.hookGenerator = new HookGenerator();
    this.scriptGenerator = new ScriptGenerator();
    this.captionGenerator = new CaptionGenerator();
  }

  async runFullWorkflow(config: WorkflowConfig): Promise<WorkflowResult> {
    console.log('🚀 Starting UGC Workflow...');
    console.log(`Character: ${config.characterId}`);
    console.log(`Scenes: ${config.sceneIds.join(', ')}`);
    console.log(`Motions: ${config.motionIds.join(', ')}`);
    console.log(`Product: ${config.productName}`);
    console.log('');

    const result: WorkflowResult = {
      hooks: [],
      scripts: [],
      captions: [],
      prompts: [],
      timestamp: new Date().toISOString()
    };

    // Generate hooks
    console.log('📝 Generating hooks...');
    for (let i = 0; i < 5; i++) {
      const hook = this.hookGenerator.generateHook('pet care', 'problem');
      result.hooks.push(hook);
    }
    console.log(`✅ Generated ${result.hooks.length} hooks`);

    // Generate scripts
    console.log('📝 Generating scripts...');
    for (let i = 0; i < 3; i++) {
      const hook = result.hooks[i % result.hooks.length];
      const script = this.scriptGenerator.generateScript(hook, config.productName, config.productDescription);
      result.scripts.push(script);
    }
    console.log(`✅ Generated ${result.scripts.length} scripts`);

    // Generate captions
    console.log('📝 Generating captions...');
    for (const script of result.scripts) {
      const caption = this.captionGenerator.generateCaption(script);
      result.captions.push(caption);
    }
    console.log(`✅ Generated ${result.captions.length} captions`);

    // Generate master prompts
    console.log('📝 Generating master prompts...');
    result.prompts = this.promptGenerator.generateBatchPrompts({
      characterId: config.characterId,
      sceneIds: config.sceneIds,
      motionIds: config.motionIds,
      productName: config.productName,
      productDescription: config.productDescription
    });
    console.log(`✅ Generated ${result.prompts.length} master prompts`);

    // Save all outputs
    await this.saveWorkflowResult(result, config.outputPrefix);

    console.log('');
    console.log('🎉 Workflow completed successfully!');
    return result;
  }

  private async saveWorkflowResult(result: WorkflowResult, prefix: string): Promise<void> {
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const workflowPath = path.join(this.outputPath, `${prefix}_${timestamp}`);
    fs.mkdirSync(workflowPath, { recursive: true });

    // Save hooks
    fs.writeFileSync(
      path.join(workflowPath, 'hooks.json'),
      JSON.stringify(result.hooks, null, 2),
      'utf-8'
    );

    // Save scripts
    fs.writeFileSync(
      path.join(workflowPath, 'scripts.json'),
      JSON.stringify(result.scripts, null, 2),
      'utf-8'
    );

    // Save captions
    fs.writeFileSync(
      path.join(workflowPath, 'captions.json'),
      JSON.stringify(result.captions, null, 2),
      'utf-8'
    );

    // Save prompts
    const promptsPath = path.join(workflowPath, 'prompts');
    fs.mkdirSync(promptsPath, { recursive: true });
    result.prompts.forEach(({ sceneId, motionId, prompt }) => {
      const filename = `${sceneId}_${motionId}.txt`;
      fs.writeFileSync(path.join(promptsPath, filename), prompt, 'utf-8');
    });

    // Save workflow summary
    const summary = {
      timestamp: result.timestamp,
      characterId: prefix.split('_')[0],
      totalHooks: result.hooks.length,
      totalScripts: result.scripts.length,
      totalCaptions: result.captions.length,
      totalPrompts: result.prompts.length,
      scenes: result.prompts.map(p => p.sceneId),
      motions: result.prompts.map(p => p.motionId)
    };
    fs.writeFileSync(
      path.join(workflowPath, 'workflow-summary.json'),
      JSON.stringify(summary, null, 2),
      'utf-8'
    );

    console.log(`💾 Saved workflow results to: ${workflowPath}`);
  }

  generateSingleVideo(config: {
    characterId: string;
    sceneId: string;
    motionId: string;
    productName: string;
    productDescription: string;
    hook?: string;
  }): { prompt: string; hook: string; script: string; caption: string } {
    const prompt = this.promptGenerator.generateMasterPrompt(
      config.characterId,
      config.sceneId,
      config.motionId,
      config.productName,
      config.productDescription
    );

    const hook = config.hook || this.hookGenerator.generateHook('pet care', 'problem');
    const script = this.scriptGenerator.generateScript(hook, config.productName, config.productDescription);
    const caption = this.captionGenerator.generateCaption(script);

    return { prompt, hook, script, caption };
  }
}

// Example usage
if (require.main === module) {
  const workflow = new UGCWorkflow();

  const config: WorkflowConfig = {
    characterId: 'sarah-pet-mom',
    sceneIds: ['couch-cleaning', 'car-seat-cleaning', 'before-after'],
    motionIds: ['selfie-talking', 'hand-demo', 'reaction-zoom'],
    productName: 'FurLift',
    productDescription: 'blue reusable pet hair remover',
    outputPrefix: 'furlift_campaign'
  };

  workflow.runFullWorkflow(config)
    .then(result => {
      console.log('\n=== WORKFLOW SUMMARY ===');
      console.log(`Hooks: ${result.hooks.length}`);
      console.log(`Scripts: ${result.scripts.length}`);
      console.log(`Captions: ${result.captions.length}`);
      console.log(`Master Prompts: ${result.prompts.length}`);
    })
    .catch(error => {
      console.error('Workflow error:', error);
    });
}

export { UGCWorkflow };
