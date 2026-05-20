import * as fs from 'fs';
import * as path from 'path';

interface ProductDefinition {
  emotionalHooks: string[];
  problemStatement: string;
  transformationStatement: string;
}

export class HookGenerator {
  private hooksPath: string;
  private usedHooks: Set<string>;

  constructor(basePath: string = '/Users/mac/Desktop/Risewithin Shopify/dropship-os/launch/ugc-factory') {
    this.hooksPath = path.join(basePath, 'hooks');
    this.usedHooks = new Set();
  }

  generateHook(product: ProductDefinition, context?: string): string {
    const availableHooks = product.emotionalHooks.filter(hook => !this.usedHooks.has(hook));
    
    if (availableHooks.length === 0) {
      this.usedHooks.clear();
      return this.selectRandomHook(product.emotionalHooks);
    }

    const selectedHook = this.selectRandomHook(availableHooks);
    this.usedHooks.add(selectedHook);
    
    return this.customizeHook(selectedHook, context);
  }

  private selectRandomHook(hooks: string[]): string {
    const index = Math.floor(Math.random() * hooks.length);
    return hooks[index];
  }

  private customizeHook(hook: string, context?: string): string {
    if (!context) return hook;
    
    return `${hook} ${context}`;
  }

  generateProblemHook(product: ProductDefinition): string {
    const hooks = [
      `You know what I hate? ${product.problemStatement}`,
      `I was so frustrated because ${product.problemStatement}`,
      `Can you believe this? ${product.problemStatement}`,
      `This is my biggest pet peeve: ${product.problemStatement}`
    ];
    
    return this.selectRandomHook(hooks);
  }

  generateTransformationHook(product: ProductDefinition): string {
    const hooks = [
      `But then I found this: ${product.transformationStatement}`,
      `The solution? ${product.transformationStatement}`,
      `This changed everything: ${product.transformationStatement}`,
      `I couldn't believe it: ${product.transformationStatement}`
    ];
    
    return this.selectRandomHook(hooks);
  }
}
