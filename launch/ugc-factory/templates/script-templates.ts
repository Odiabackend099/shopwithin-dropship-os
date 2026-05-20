export const ScriptTemplates = {
  // Problem-solution scripts
  problemSolution: (product: string, problem: string, solution: string) => {
    return [
      `I was so tired of dealing with ${problem} every single day.`,
      `It was frustrating, time-consuming, and honestly, it was ruining my routine.`,
      `Then I found ${product} and everything changed.`,
      `${solution}`,
      `Now I can finally enjoy my day without that constant stress.`,
      `If you're dealing with ${problem}, you need to try this.`
    ];
  },

  // Transformation scripts
  transformation: (product: string, before: string, after: string) => {
    return [
      `This is what my life looked like before: ${before}`,
      `It was honestly exhausting dealing with this every day.`,
      `But then I discovered ${product} and watch this transformation:`,
      `${after}`,
      `The difference is actually insane.`,
      `I wish I found this solution sooner.`
    ];
  },

  // Testimonial scripts
  testimonial: (product: string, experience: string, benefit: string) => {
    return [
      `I've been using ${product} for a while now and I have to share my experience.`,
      `${experience}`,
      `The difference it's made is ${benefit}.`,
      `I was skeptical at first, but now I can't imagine going back.`,
      `If you're on the fence about trying this, just do it.`,
      `Your future self will thank you.`
    ];
  },

  // Quick demo scripts
  quickDemo: (product: string, features: string[]) => {
    return [
      `You need to see this ${product} in action.`,
      ...features.map(feature => `Look at this: ${feature}`),
      `It's actually genius how well this works.`,
      `I use this every single day now.`,
      `Seriously, get one of these.`
    ];
  },

  // Before-after scripts
  beforeAfter: (product: string, before: string, after: string) => {
    return [
      `This is the before: ${before}`,
      `I know, it's frustrating right?`,
      `But watch what happens when I use ${product}:`,
      `${after}`,
      `I mean, come on, that's actually incredible.`,
      `This is the kind of result that actually matters.`
    ];
  },

  // POV scripts
  pov: (product: string, scenario: string, result: string) => {
    return [
      `POV: You're dealing with ${scenario}`,
      `It's honestly the worst when you're in that situation.`,
      `But then you discover ${product}`,
      `${result}`,
      `And suddenly everything is so much easier.`,
      `This is the game-changer you didn't know you needed.`
    ];
  },

  // Reaction scripts
  reaction: (product: string, reaction: string, explanation: string) => {
    return [
      `My honest reaction to ${product}:`,
      `${reaction}`,
      `I know, I didn't expect it to be this good either.`,
      `${explanation}`,
      `This is why everyone is talking about this.`,
      `Once you try it, you can't go back.`
    ];
  },

  // Category-specific scripts
  pet: (product: string, pet: string, problem: string) => {
    return [
      `If you're a ${pet} owner, you NEED to see this.`,
      `Dealing with ${problem} was honestly exhausting.`,
      `Then I found ${product} and it changed everything for my ${pet}.`,
      `Now my ${pet} is happier and I'm less stressed.`,
      `Every pet owner should have this in their life.`,
      `Your ${pet} will thank you for this.`
    ];
  },

  car: (product: string, problem: string, solution: string) => {
    return [
      `Car owners need to see this game-changer.`,
      `Dealing with ${problem} in my car was so frustrating.`,
      `Then I discovered ${product} and ${solution}.`,
      `My driving experience is completely different now.`,
      `This is the car accessory that actually matters.`,
      `Don't wait until you're desperate like I was.`
    ];
  },

  home: (product: string, problem: string, result: string) => {
    return [
      `This changed my entire home routine.`,
      `Dealing with ${problem} at home was honestly exhausting.`,
      `Then I found ${product} and ${result}.`,
      `My home has never been this organized and peaceful.`,
      `Every homeowner needs this in their life.`,
      `Your home will thank you for this.`
    ];
  },

  kitchen: (product: string, task: string, improvement: string) => {
    return [
      `This kitchen hack changed everything.`,
      `${task} used to take me forever.`,
      `Then I got ${product} and ${improvement}.`,
      `Cooking is actually enjoyable now.`,
      `Every home cook needs this gadget.`,
      `I can't believe I cooked without this for so long.`
    ];
  },

  beauty: (product: string, routine: string, result: string) => {
    return [
      `This transformed my beauty routine completely.`,
      `My ${routine} was such a struggle before.`,
      `Then I discovered ${product} and ${result}.`,
      `My skin/look has never been this good.`,
      `Every beauty enthusiast needs to try this.`,
      `I wish I found this sooner.`
    ];
  },

  wellness: (product: string, stress: string, relief: string) => {
    return [
      `This brought so much peace to my daily routine.`,
      `Dealing with ${stress} was honestly overwhelming.`,
      `Then I found ${product} and ${relief}.`,
      `I finally feel in control of my wellness.`,
      `This is the self-care tool that actually delivers.`,
      `Your mind and body will thank you.`
    ];
  },

  gadget: (product: string, problem: string, solution: string) => {
    return [
      `Tech enthusiasts need to see this game-changer.`,
      `Dealing with ${problem} was so frustrating.`,
      `Then I discovered ${product} and ${solution}.`,
      `This gadget actually changed my daily life.`,
      `Every tech lover needs this in their setup.`,
      `I can't believe I lived without this.`
    ];
  },

  organization: (product: string, clutter: string, result: string) => {
    return [
      `This transformed my entire organization system.`,
      `Dealing with ${clutter} was honestly overwhelming.`,
      `Then I found ${product} and ${result}.`,
      `My space has never been this organized.`,
      `If you struggle with clutter, you need this.`,
      `Your space will thank you for this.`
    ];
  },

  travel: (product: string, struggle: string, solution: string) => {
    return [
      `This changed how I travel completely.`,
      `Dealing with ${struggle} when traveling was exhausting.`,
      `Then I discovered ${product} and ${solution}.`,
      `My travel experience is so much better now.`,
      `Every traveler needs to see this.`,
      `I wish I had this for my last trip.`
    ];
  },

  getRandomScript(type: string, params: any): string[] {
    const scriptFn = this[type as keyof typeof this] as Function;
    if (typeof scriptFn === 'function') {
      return scriptFn(...Object.values(params));
    }
    return this.problemSolution(params.product, params.problem, params.solution);
  }
};
