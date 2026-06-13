import type { ProductSpec } from "@/types/product";

export interface ProductTranslation {
  name?: string;
  shortDescription?: string;
  description?: string;
  specs?: ProductSpec[];
}

/**
 * English copy for catalog products, keyed by slug. Products without an
 * entry fall back to their French content (the Supabase catalog is the
 * source of truth; this overlay avoids a DB schema change for 2 languages).
 *
 * When adding a product in the admin, add its English copy here too.
 */
export const PRODUCT_TRANSLATIONS_EN: Record<string, ProductTranslation> = {
  "chicha-crystal-premium": {
    name: "Crystal Premium Hookah",
    shortDescription: "Hand-blown glass hookah with an elegant crystalline design",
    description:
      "An exceptional hookah with a crystalline design. The hand-blown glass delivers unmatched smoke quality and a refined look that will elevate your interior. Wide, stable base for safe everyday use.",
    specs: [
      { label: "Height", value: "55 cm" },
      { label: "Materials", value: "Hand-blown glass, 304 stainless steel" },
      { label: "Hose", value: "Medical-grade silicone, aluminium tip" },
    ],
  },
  "chicha-classic-noir": {
    name: "Classic Black Hookah",
    shortDescription: "Traditional hookah with a matte black finish",
    description:
      "A timeless classic revisited with a matte black finish. Ideal for lovers of traditional hookahs looking for a modern touch. Sturdy construction and easy maintenance.",
  },
  "bol-silicone-pro": {
    name: "Pro Silicone Bowl",
    shortDescription: "Silicone bowl with ceramic insert, unbreakable",
    description:
      "Food-grade silicone bowl with a ceramic insert. Resistant to extreme heat and unbreakable. Perfect for even heat distribution.",
  },
  "bol-ceramique-artisanal": {
    name: "Artisan Ceramic Bowl",
    shortDescription: "Handmade ceramic bowl, every piece is unique",
    description:
      "Handmade ceramic bowl crafted by artisans. Each piece is unique, with subtle colour variations. Excellent heat retention for extended sessions.",
  },
  "tuyau-silicone-premium": {
    name: "Premium Silicone Hose",
    shortDescription: "1.8 m silicone hose, stainless steel tip, washable",
    description:
      "Ultra-flexible 1.8 m food-grade silicone hose. Dishwasher safe. Stainless steel mouthpiece with an ergonomic handle.",
  },
  "charbon-naturel-coco": {
    name: "Natural Coconut Charcoal",
    shortDescription: "Natural coconut charcoal, 72 pieces, 60+ min",
    description:
      "Natural charcoal made from coconut shells. Burns for 60+ minutes. Odourless and tasteless. Box of 72 pieces (1 kg).",
  },
  "pince-charbon-pro": {
    name: "Pro Charcoal Tongs",
    shortDescription: "Stainless steel tongs with heat-resistant handle, 25 cm",
    description:
      "Stainless steel tongs with a heat-resistant handle. Ergonomic design for precise charcoal handling. Ideal 25 cm length.",
  },
  "kit-nettoyage-complet": {
    name: "Complete Cleaning Kit",
    shortDescription: "5-piece kit: brushes, hose brush, sponge",
    description:
      "Complete kit for maintaining your hookah. Includes 3 brushes in different sizes, a hose pipe brush and a special sponge for glass.",
  },

  // Dev fixture catalog (local development without Supabase)
  "bol-silicone-phunnel": {
    name: "Silicone Phunnel Bowl",
    shortDescription: "Unbreakable, works with every heat management system",
    description:
      "The everyday bowl: medical-grade silicone, central phunnel spire that preserves the tobacco juices, compatible with every heat management system.",
  },
  "tuyau-cuir-tresse": {
    name: "Braided Leather Hose",
    shortDescription: "Genuine leather, machined aluminium tip",
    description:
      "Hose wrapped in braided leather with a machined aluminium mouthpiece. Wide draw, easy maintenance (washable silicone core), premium feel.",
  },
  "charbon-naturel-coco-1kg": {
    name: "Natural Coconut Charcoal 1 kg",
    shortDescription: "Coconut shell, long odourless burn",
    description:
      "26 mm cubes of compressed coconut shell: clean ignition, steady burn of 45 minutes and more, with no odour or off-taste. The lounges' choice.",
  },
  "kit-entretien-complet": {
    name: "Complete Care Kit",
    shortDescription: "Brushes, seals and hygienic mouthpieces",
    description:
      "Everything to keep your hookah like new: stem brush, base brush, spare seals and individual hygienic mouthpieces.",
  },
};
