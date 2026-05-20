import { HookGenerator } from './hook-generator';

interface ProductDefinition {
  name: string;
  problemStatement: string;
  transformationStatement: string;
  targetAudience: string;
  emotionalHooks: string[];
}

export class ScriptGenerator {
  private hookGenerator: HookGenerator;

  constructor() {
    this.hookGenerator = new HookGenerator();
  }

  generateScript(product: ProductDefinition, sceneType: string): string {
    const hook = this.hookGenerator.generateHook(product);
    const problem = this.generateProblemSection(product);
    const solution = this.generateSolutionSection(product);
    const cta = this.generateCTASection(product);

    return this.assembleScript(hook, problem, solution, cta, sceneType);
  }

  private generateProblemSection(product: ProductDefinition): string {
    const variations = [
      `I've been dealing with ${product.problemStatement.toLowerCase()} and it's been so frustrating.`,
      `You know the struggle with ${product.problemStatement.toLowerCase()}? I've been there.`,
      `My biggest issue has been ${product.problemStatement.toLowerCase()}.`
    ];
    return this.selectRandom(variations);
  }

  private generateSolutionSection(product: ProductDefinition): string {
    const variations = [
      `But then I found ${product.name}. ${product.transformationStatement}`,
      `That's when I discovered ${product.name}. ${product.transformationStatement}`,
      `I tried ${product.name} and ${product.transformationStatement.toLowerCase()}`
    ];
    return this.selectRandom(variations);
  }

  private generateCTASection(product: ProductDefinition): string {
    const variations = [
      `If you're dealing with this too, you need to try this.`,
      `Trust me, you're going to want this.`,
      `This is exactly what you've been looking for.`
    ];
    return this.selectRandom(variations);
  }

  private assembleScript(hook: string, problem: string, solution: string, cta: string, sceneType: string): string {
    return `${hook}\n\n${problem}\n\n${solution}\n\n${cta}`;
  }

  private selectRandom(options: string[]): string {
    const index = Math.floor(Math.random() * options.length);
    return options[index];
  }
}
