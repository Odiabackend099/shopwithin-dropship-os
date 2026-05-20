export const HookLibrary = {
  // Problem hooks
  problemHooks: [
    "I was so tired of dealing with [PROBLEM] every single day",
    "If you're struggling with [PROBLEM], you need to see this",
    "This [PROBLEM] was ruining my daily routine until I found this",
    "I can't believe I lived with [PROBLEM] for so long",
    "The [PROBLEM] struggle is real, but this changed everything"
  ],
  
  // Transformation hooks
  transformationHooks: [
    "Watch how this completely transformed my [SITUATION]",
    "From [BEFORE STATE] to [AFTER STATE] in seconds",
    "The difference is actually insane",
    "I wish I found this solution sooner",
    "This is the kind of transformation that actually matters"
  ],
  
  // Curiosity hooks
  curiosityHooks: [
    "You're not going to believe how this works",
    "I discovered something that changed everything",
    "This hack is actually genius",
    "Nobody talks about this but it works so well",
    "I was skeptical at first but now I'm obsessed"
  ],
  
  // Emotional hooks
  emotionalHooks: [
    "This saved me so much stress and frustration",
    "I finally feel in control of [SITUATION]",
    "The peace of mind this gives me is worth everything",
    "I can't describe how much this helped",
    "This small change made such a huge difference"
  ],
  
  // Urgency hooks
  urgencyHooks: [
    "You need this in your life right now",
    "Don't wait until you're desperate like I was",
    "Stop wasting time with [OLD SOLUTION]",
    "This is the solution you've been looking for",
    "Your future self will thank you for this"
  ],
  
  // Social proof hooks
  socialProofHooks: [
    "Everyone who tries this falls in love with it",
    "I've recommended this to all my friends and family",
    "This is why everyone is talking about [PRODUCT]",
    "The reviews don't lie - this actually works",
    "Once you try this, you can't go back"
  ],
  
  // Category-specific hooks
  petHooks: [
    "If you're a pet owner, you NEED to see this",
    "My pet's life changed when I found this",
    "Every pet owner struggles with this until they find the right solution",
    "I wish I knew about this sooner for my [PET]",
    "This is the pet hack that actually works"
  ],
  
  carHooks: [
    "Car owners need to see this game-changer",
    "This transformed my driving experience",
    "Every car owner deals with this problem",
    "I can't believe I drove without this for so long",
    "This is the car accessory that actually matters"
  ],
  
  homeHooks: [
    "This changed my entire home routine",
    "Homeowners need this in their lives",
    "I finally found the solution to [HOME PROBLEM]",
    "This home hack is actually genius",
    "My home has never been this organized"
  ],
  
  kitchenHooks: [
    "This kitchen hack changed everything",
    "Cooking became so much easier with this",
    "Every home cook needs this gadget",
    "I can't believe I cooked without this",
    "This is the kitchen tool that actually delivers"
  ],
  
  beautyHooks: [
    "This transformed my beauty routine completely",
    "Every beauty enthusiast needs to see this",
    "I wish I found this beauty tool sooner",
    "This is the beauty hack that actually works",
    "My skincare routine has never been this good"
  ],
  
  wellnessHooks: [
    "This brought so much peace to my daily routine",
    "Wellness enthusiasts need to try this",
    "I finally found true relaxation with this",
    "This wellness tool actually delivers",
    "My self-care routine transformed with this"
  ],
  
  gadgetHooks: [
    "Tech enthusiasts need to see this game-changer",
    "This gadget actually changed my daily life",
    "Every tech lover needs this in their setup",
    "I can't believe I lived without this tech",
    "This is the gadget that actually delivers on its promise"
  ],
  
  organizationHooks: [
    "This transformed my entire organization system",
    "If you struggle with clutter, you need this",
    "I finally found the perfect organization solution",
    "This organization hack is actually genius",
    "My space has never been this organized"
  ],
  
  travelHooks: [
    "This changed how I travel completely",
    "Every traveler needs to see this",
    "I wish I had this for my last trip",
    "This travel hack is actually brilliant",
    "My travel experience transformed with this"
  ],
  
  getRandomHook(category: string): string {
    const hooks = this[`${category}Hooks` as keyof typeof this] as string[];
    if (!hooks || hooks.length === 0) {
      return this.problemHooks[Math.floor(Math.random() * this.problemHooks.length)];
    }
    return hooks[Math.floor(Math.random() * hooks.length)];
  },
  
  getAllHooks(): string[] {
    return [
      ...this.problemHooks,
      ...this.transformationHooks,
      ...this.curiosityHooks,
      ...this.emotionalHooks,
      ...this.urgencyHooks,
      ...this.socialProofHooks
    ];
  }
};
