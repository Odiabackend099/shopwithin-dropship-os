import { ScriptGenerator } from './script-generator';

export class CaptionGenerator {
  private scriptGenerator: ScriptGenerator;

  constructor() {
    this.scriptGenerator = new ScriptGenerator();
  }

  generateCaptions(script: string, duration: number): Array<{text: string, start: number, end: number}> {
    const sentences = this.splitIntoSentences(script);
    const totalSentences = sentences.length;
    const durationPerSentence = duration / totalSentences;

    return sentences.map((sentence, index) => ({
      text: sentence,
      start: index * durationPerSentence,
      end: (index + 1) * durationPerSentence
    }));
  }

  private splitIntoSentences(script: string): string[] {
    return script
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  generateSRT(captions: Array<{text: string, start: number, end: number}>): string {
    return captions.map((caption, index) => {
      const startTime = this.formatTime(caption.start);
      const endTime = this.formatTime(caption.end);
      return `${index + 1}\n${startTime} --> ${endTime}\n${caption.text}`;
    }).join('\n\n');
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }
}
