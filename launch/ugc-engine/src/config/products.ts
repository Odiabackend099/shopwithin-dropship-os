import { z } from "zod";

export const productSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  priceUsd: z.number().positive(),
  category: z.string().min(1),
  niche: z.string().min(1),
  problemStatement: z.string().min(1),
  transformationStatement: z.string().min(1),
  targetAudience: z.string().min(1),
  emotionalHooks: z.array(z.string().min(1)),
  demoProps: z.array(z.string().min(1)),
  visualDescriptors: z.array(z.string().min(1)),
  ctaVariants: z.array(z.string().min(1)),
  hashtags: z.array(z.string().min(1)),
});

export type ProductDefinition = z.infer<typeof productSchema>;

export const furliftProduct: ProductDefinition = {
  sku: "VLOY30HZN",
  name: "FurLift Reusable Pet Hair Detailer",
  slug: "furlift",
  priceUsd: 24.95,
  category: "pet-grooming",
  niche: "pet-hair-removal",
  problemStatement:
    "Pet hair sticks to every couch, car seat, and sweater. Lint rollers run out. Vacuums are bulky. Nothing actually works fast.",
  transformationStatement:
    "One swipe with FurLift lifts embedded pet hair instantly. No refills, no batteries, reusable forever.",
  targetAudience:
    "Pet owners aged 25–54, mostly women, who clean hair daily from furniture, clothes, and cars.",
  emotionalHooks: [
    "You love your pet, but you hate the hair everywhere.",
    "Your couch looks like a fur coat.",
    "Guests are coming in 10 minutes.",
    "That black sweater is ruined again.",
    "You just bought a lint roller and it is already empty.",
  ],
  demoProps: [
    "couch with golden retriever hair",
    "car seat with short cat hair",
    "black sweater covered in white fur",
    "pet bed with embedded hair",
    "carpet corner with clumped hair",
  ],
  visualDescriptors: [
    "bright blue ergonomic handle",
    "transparent rubber blade edge",
    "before-and-after contrast on dark fabric",
    "hand holding device in motion",
    "hair collecting in satisfying clumps",
  ],
  ctaVariants: [
    "Get FurLift for $24.95 — free shipping today",
    "Tap the link in bio before stock runs out",
    "Shop now and stop picking hair off your clothes",
    "Limited launch price — claim yours",
    "Link in bio — your couch will thank you",
  ],
  hashtags: [
    "#petlife",
    "#dogmom",
    "#catmom",
    "#pethair",
    "#cleaninghacks",
    "#furproblems",
    "#pets",
    "#homehacks",
    "#furlift",
    "#petgrooming",
  ],
};

export const products: Record<string, ProductDefinition> = {
  [furliftProduct.slug]: furliftProduct,
};

export function getProduct(slug: string): ProductDefinition {
  const p = products[slug];
  if (!p) throw new Error(`Unknown product slug: ${slug}`);
  return p;
}
