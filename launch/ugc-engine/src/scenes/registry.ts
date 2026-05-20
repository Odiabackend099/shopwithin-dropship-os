import { type SceneConfig, sceneConfigSchema } from "../schemas/index.js";

const scenes: SceneConfig[] = [
  {
    id: "couch-cleaning",
    type: "couch-cleaning",
    name: "Couch Cleaning Demo",
    description: "A creator demonstrates FurLift on a hair-covered couch, showing satisfying before-to-after motion.",
    promptContext:
      "Close-up of a hand holding a blue FurLift pet hair detailer, dragging it across a fabric couch covered in visible pet hair. Hair lifts and clumps into satisfying rolls. Natural living room lighting, cozy aesthetic, warm tones.",
    shotAngles: ["close-up hand action", "medium shot showing couch section", "overhead showing hair clumps"],
    lighting: "soft natural window light, warm afternoon tones",
    props: ["fabric couch", "pet hair clumps", "FurLift device"],
    mood: "satisfying, domestic, relatable",
    durationEstimateSec: 5,
    recommendedAudio: "soft satisfying scraping sound or gentle ASMR",
  },
  {
    id: "car-seat-cleaning",
    type: "car-seat-cleaning",
    name: "Car Seat Rescue",
    description: "Creator cleans pet hair from car upholstery before a road trip or commute.",
    promptContext:
      "Interior car shot, hand swiping FurLift across a grey fabric car seat covered in short pet hair. Daylight through car windows. Clean modern vehicle interior. Action-focused, quick satisfying swipe.",
    shotAngles: ["car interior medium", "close-up of seat fabric and hair", "hand action detail"],
    lighting: "bright daylight through car windows",
    props: ["car seat", "FurLift device", "seatbelt visible"],
    mood: "practical, quick-win, everyday problem solved",
    durationEstimateSec: 4,
    recommendedAudio: "car ambient + swipe sound",
  },
  {
    id: "pet-interaction",
    type: "pet-interaction",
    name: "Pet & Owner Moment",
    description: "Creator hugs their pet on the couch, then reveals the hair problem and solution.",
    promptContext:
      "A person sitting on a couch hugging a golden retriever. Then they lift the dog and show the hair left behind. They grab FurLift and clean it with one swipe. Warm, loving, relatable home scene.",
    shotAngles: ["medium shot person and pet", "close-up of hair on couch", "action shot cleaning"],
    lighting: "warm indoor lamp + window light",
    props: ["couch", "pet", "FurLift device", "throw blanket"],
    mood: "warm, humorous, relatable",
    durationEstimateSec: 6,
    recommendedAudio: "gentle pet sounds + playful music",
  },
  {
    id: "testimonial",
    type: "testimonial",
    name: "Real Owner Testimonial",
    description: "Creator speaks to camera about how FurLift changed their cleaning routine.",
    promptContext:
      "A person speaking directly to camera in their living room, holding FurLift. Genuine expression. Background slightly blurred showing a clean couch. Natural window light. Authentic testimonial energy, not overly polished.",
    shotAngles: ["medium close-up talking head", "slight side angle for variety"],
    lighting: "natural window light, soft and flattering",
    props: ["FurLift device", "clean couch in background"],
    mood: "authentic, grateful, convincing",
    durationEstimateSec: 8,
    recommendedAudio: "clear voice, minimal background noise",
  },
  {
    id: "selfie",
    type: "selfie",
    name: "Selfie POV Demo",
    description: "Creator films themselves selfie-style showing FurLift in action on their own clothes.",
    promptContext:
      "Selfie POV shot of a person wearing a black sweater covered in white pet hair. They hold FurLift up to camera, then swipe it down their sleeve. Hair vanishes in one motion. Bright, casual, authentic phone-camera look.",
    shotAngles: ["selfie POV", "close-up of sleeve before/after"],
    lighting: "bright indoor light or daylight",
    props: ["black clothing", "white pet hair", "FurLift device"],
    mood: "casual, authentic, quick-tip",
    durationEstimateSec: 4,
    recommendedAudio: "light upbeat music or natural sound",
  },
  {
    id: "unboxing",
    type: "unboxing",
    name: "Unboxing First Impression",
    description: "Creator unboxes FurLift, shows packaging, first reaction, and immediate first use.",
    promptContext:
      "Hands opening a simple branded package on a clean table. Revealing the blue FurLift device. Creator holds it up, smiles, then immediately uses it on a nearby hair-covered surface. Bright, crisp, satisfying unboxing energy.",
    shotAngles: ["overhead unboxing", "close-up of device in hand", "first use action"],
    lighting: "bright even table lighting",
    props: ["package", "FurLift device", "hair-covered test surface"],
    mood: "excited, curious, satisfying",
    durationEstimateSec: 7,
    recommendedAudio: "crinkling package + upbeat discovery music",
  },
  {
    id: "before-after",
    type: "before-after",
    name: "Before & After Transformation",
    description: "Split-screen or sequential before/after showing dramatic hair removal result.",
    promptContext:
      "Side-by-side before and after of a dark fabric surface covered in pet hair versus completely clean after using FurLift. Dramatic contrast. Clean framing. Bold visual transformation.",
    shotAngles: ["static framed shot", "split screen layout"],
    lighting: "consistent bright light for both shots",
    props: ["dark fabric surface", "pet hair", "FurLift device"],
    mood: "dramatic, satisfying, convincing",
    durationEstimateSec: 3,
    recommendedAudio: "transformation whoosh or reveal sound",
  },
];

const sceneMap = new Map<string, SceneConfig>(scenes.map((s) => [s.id, s]));

export function getScene(id: string): SceneConfig {
  const s = sceneMap.get(id);
  if (!s) throw new Error(`Unknown scene id: ${id}`);
  return s;
}

export function listScenes(): SceneConfig[] {
  return Array.from(sceneMap.values());
}

export function getScenesByType(type: SceneConfig["type"]): SceneConfig[] {
  return scenes.filter((s) => s.type === type);
}

export function validateScene(data: unknown): SceneConfig {
  return sceneConfigSchema.parse(data);
}
