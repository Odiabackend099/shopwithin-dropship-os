export const CaptionTemplates = {
  // Problem captions
  problemCaptions: [
    "Struggling with [PROBLEM]? This changed everything for me 🤯",
    "I was so tired of [PROBLEM] until I found this solution ✨",
    "If you deal with [PROBLEM], you NEED to see this 👇",
    "The [PROBLEM] struggle is real, but this fixed it 💯",
    "I wish I knew about this sooner for my [PROBLEM] issue"
  ],
  
  // Transformation captions
  transformationCaptions: [
    "From [BEFORE] to [AFTER] in seconds! 😱",
    "The difference is actually insane 🤯",
    "Watch this transformation happen in real-time ✨",
    "I can't believe how much this changed everything 💯",
    "Before vs After - which one would you rather have? 👇"
  ],
  
  // Product reveal captions
  productRevealCaptions: [
    "You're not going to believe how this works 🤯",
    "This is the game-changer you didn't know you needed ✨",
    "I discovered something that changed everything 💯",
    "This hack is actually genius, try it! 👇",
    "Nobody talks about this but it works so well 😱"
  ],
  
  // Testimonial captions
  testimonialCaptions: [
    "I've been using this for [TIME] and I'm obsessed ✨",
    "This is my honest review - no gatekeeping here 💯",
    "I wish I found this sooner, it's that good 🤯",
    "Once you try this, you can't go back 😱",
    "This is why everyone is talking about this product ✨"
  ],
  
  // Call-to-action captions
  ctaCaptions: [
    "Link in bio to get yours! 👇",
    "Tap the link before it's gone! 🔗",
    "Your future self will thank you for this ✨",
    "Don't wait until you're desperate like I was 💯",
    "Get yours while you still can! 🛒"
  ],
  
  // Category-specific captions
  petCaptions: [
    "Pet owners need to see this! 🐾",
    "My pet's life changed when I found this ✨",
    "Every pet owner struggles with this until they find the right solution 🤯",
    "I wish I knew about this sooner for my fur baby 💕",
    "This is the pet hack that actually works! 💯"
  ],
  
  carCaptions: [
    "Car owners need to see this game-changer 🚗",
    "This transformed my driving experience completely ✨",
    "Every car owner deals with this problem 😤",
    "I can't believe I drove without this for so long 🤯",
    "This is the car accessory that actually matters 💯"
  ],
  
  homeCaptions: [
    "This changed my entire home routine 🏠",
    "Homeowners need this in their lives right now ✨",
    "I finally found the solution to [HOME PROBLEM] 💯",
    "This home hack is actually genius 🤯",
    "My home has never been this organized! 🏡"
  ],
  
  kitchenCaptions: [
    "This kitchen hack changed everything 🍳",
    "Cooking became so much easier with this ✨",
    "Every home cook needs this gadget 💯",
    "I can't believe I cooked without this 🤯",
    "This is the kitchen tool that actually delivers! 🍴"
  ],
  
  beautyCaptions: [
    "This transformed my beauty routine completely 💄",
    "Every beauty enthusiast needs to see this ✨",
    "I wish I found this beauty tool sooner 💯",
    "This is the beauty hack that actually works 🤯",
    "My skincare routine has never been this good! 🧴"
  ],
  
  wellnessCaptions: [
    "This brought so much peace to my daily routine 🧘",
    "Wellness enthusiasts need to try this ✨",
    "I finally found true relaxation with this 💯",
    "This wellness tool actually delivers 🤯",
    "My self-care routine transformed with this! 💕"
  ],
  
  gadgetCaptions: [
    "Tech enthusiasts need to see this game-changer 📱",
    "This gadget actually changed my daily life ✨",
    "Every tech lover needs this in their setup 💯",
    "I can't believe I lived without this tech 🤯",
    "This is the gadget that actually delivers! 🔋"
  ],
  
  organizationCaptions: [
    "This transformed my entire organization system 📦",
    "If you struggle with clutter, you need this ✨",
    "I finally found the perfect organization solution 💯",
    "This organization hack is actually genius 🤯",
    "My space has never been this organized! 🏡"
  ],
  
  travelCaptions: [
    "This changed how I travel completely ✈️",
    "Every traveler needs to see this ✨",
    "I wish I had this for my last trip 💯",
    "This travel hack is actually brilliant 🤯",
    "My travel experience transformed with this! 🌍"
  ],
  
  // Hashtag sets
  hashtags: {
    pet: ['#petsoftiktok', '#dogsoftiktok', '#catsoftiktok', '#petcare', '#pethairremoval', '#petproducts', '#petlover', '#fyp'],
    car: ['#carsoftiktok', '#cargadgets', '#caraccessories', '#cardiffuser', '#cargoodthing', '#carhacks', '#fyp'],
    home: ['#hometok', '#homehacks', '#cleantok', '#organization', '#homeorganization', '#homehacks', '#fyp'],
    kitchen: ['#kitchentok', '#kitchenhacks', '#cookinghacks', '#kitchengadgets', '#cookingtips', '#fyp'],
    beauty: ['#beautytok', '#skincaretok', '#beautygadgets', '#beautyhacks', '#skincare', '#fyp'],
    wellness: ['#wellnesstok', '#selfcare', '#wellnesshacks', '#relaxation', '#mentalhealth', '#fyp'],
    gadgets: ['#techtok', '#gadgets', '#phoneaccessories', '#techhacks', '#tech', '#fyp'],
    organization: ['#organizationtok', '#storagehacks', '#declutter', '#organizing', '#homeorganization', '#fyp'],
    travel: ['#traveltok', '#travelhacks', '#travelaccessories', '#packing', '#travel', '#fyp']
  },
  
  getRandomCaption(category: string): string {
    const captions = this[`${category}Captions` as keyof typeof this] as string[];
    if (!captions || captions.length === 0) {
      return this.problemCaptions[Math.floor(Math.random() * this.problemCaptions.length)];
    }
    return captions[Math.floor(Math.random() * captions.length)];
  },
  
  getRandomCTA(): string {
    return this.ctaCaptions[Math.floor(Math.random() * this.ctaCaptions.length)];
  },
  
  getHashtags(category: string): string[] {
    return this.hashtags[category as keyof typeof this.hashtags] || ['#fyp', '#viral', '#trending'];
  },
  
  generateFullCaption(category: string, customCaption?: string): string {
    const caption = customCaption || this.getRandomCaption(category);
    const cta = this.getRandomCTA();
    const hashtags = this.getHashtags(category).join(' ');
    
    return `${caption}\n\n${cta}\n\n${hashtags}`;
  }
};
