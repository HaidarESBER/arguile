import { Product } from "@/types/product";

/**
 * DEV-ONLY fixture catalog.
 *
 * Served by src/lib/products.ts ONLY when BOTH conditions hold:
 *   - process.env.NODE_ENV === "development"
 *   - Supabase is not configured (placeholder client)
 *
 * Lets the storefront (catalog, product pages, search, homepage) be developed
 * and reviewed without Supabase credentials. Never ships data to production:
 * production builds without credentials stay empty (or fail loudly, see
 * lib/supabase/admin.ts).
 */
export const DEV_FIXTURE_PRODUCTS: Product[] = [
  {
    id: "dev-0000-0000-0000-000000000001",
    slug: "chicha-crystal-premium",
    name: "Chicha Crystal Premium",
    shortDescription: "Verre soufflé main, tirage doux et stable.",
    description:
      "Notre pièce signature. Vase en verre soufflé main, colonne en inox brossé, plateau aimanté. Conçue pour des sessions longues : tirage doux, fumée dense, stabilité parfaite. Livrée avec bol en céramique artisanale et tuyau silicone.",
    price: 12999,
    compareAtPrice: 14999,
    images: ["/chicha.jpg", "/bowl.jpg", "/hose.webp", "/coal.webp"],
    category: "chicha",
    inStock: true,
    stockLevel: 12,
    featured: true,
    specs: [
      { label: "Hauteur", value: "55 cm" },
      { label: "Matériaux", value: "Verre soufflé, inox 304" },
      { label: "Tuyau", value: "Silicone médical, embout aluminium" },
    ],
  },
  {
    id: "dev-0000-0000-0000-000000000002",
    slug: "chicha-classic-noir",
    name: "Chicha Classic Noir",
    shortDescription: "Le classique indémodable, finition noir mat.",
    description:
      "Une silhouette intemporelle en finition noir mat, facile d'entretien. Idéale pour débuter ou pour un usage quotidien sans compromis sur la qualité de fumée.",
    price: 7999,
    images: ["/chicha.jpg"],
    category: "chicha",
    inStock: true,
    stockLevel: 4,
    featured: false,
  },
  {
    id: "dev-0000-0000-0000-000000000003",
    slug: "bol-ceramique-artisanal",
    name: "Bol Céramique Artisanal",
    shortDescription: "Tourné main, chauffe régulière, chaque pièce est unique.",
    description:
      "Tourné à la main par un atelier partenaire. La céramique épaisse retient la chaleur et la diffuse uniformément — moins de charbon, plus de goût. Chaque bol présente de légères variations qui le rendent unique.",
    price: 2499,
    images: ["/bowl.jpg"],
    category: "bol",
    inStock: true,
    stockLevel: 23,
    featured: true,
  },
  {
    id: "dev-0000-0000-0000-000000000004",
    slug: "bol-silicone-phunnel",
    name: "Bol Silicone Phunnel",
    shortDescription: "Incassable, compatible tous systèmes de chauffe.",
    description:
      "Le bol du quotidien : silicone de qualité médicale, cheminée centrale phunnel qui préserve les jus du tabac, compatible avec tous les systèmes de gestion de chaleur.",
    price: 1499,
    compareAtPrice: 1999,
    images: ["/bowl.jpg"],
    category: "bol",
    inStock: true,
    stockLevel: 40,
    featured: false,
  },
  {
    id: "dev-0000-0000-0000-000000000005",
    slug: "tuyau-cuir-tresse",
    name: "Tuyau Cuir Tressé",
    shortDescription: "Cuir véritable, embout aluminium usiné.",
    description:
      "Tuyau gainé de cuir tressé avec embout en aluminium usiné. Tirage large, entretien facile (âme silicone lavable), toucher premium.",
    price: 3499,
    images: ["/hose.webp"],
    category: "tuyau",
    inStock: true,
    stockLevel: 9,
    featured: true,
  },
  {
    id: "dev-0000-0000-0000-000000000006",
    slug: "charbon-naturel-coco-1kg",
    name: "Charbon Naturel Coco 1 kg",
    shortDescription: "Coque de coco, combustion longue et sans odeur.",
    description:
      "Cubes 26 mm en coque de coco compressée : allumage propre, combustion régulière de 45 minutes et plus, sans odeur ni goût parasite. Le choix des salons.",
    price: 899,
    images: ["/coal.webp"],
    category: "charbon",
    inStock: true,
    stockLevel: 60,
    featured: true,
  },
  {
    id: "dev-0000-0000-0000-000000000007",
    slug: "pince-charbon-pro",
    name: "Pince à Charbon Pro",
    shortDescription: "Inox, manche anti-chaleur, prise précise.",
    description:
      "Pince en inox avec manche anti-chaleur. La longueur idéale pour manipuler les charbons en sécurité, et un grip précis pour les retourner sans les casser.",
    price: 1299,
    images: ["/accessories.jpg"],
    category: "accessoire",
    inStock: true,
    stockLevel: 31,
    featured: false,
  },
  {
    id: "dev-0000-0000-0000-000000000008",
    slug: "kit-entretien-complet",
    name: "Kit Entretien Complet",
    shortDescription: "Brosses, joints et embouts hygiéniques.",
    description:
      "Tout pour garder votre chicha comme au premier jour : brosse colonne, brosse vase, joints de rechange et embouts hygiéniques individuels.",
    price: 1999,
    images: ["/accessories.jpg"],
    category: "accessoire",
    inStock: false,
    stockLevel: 0,
    featured: false,
  },
];

/** Plausible rating stats so review UI is reviewable in dev. */
export const DEV_FIXTURE_RATINGS: Record<
  string,
  { productId: string; averageRating: number; totalReviews: number; ratingBreakdown: { 5: number; 4: number; 3: number; 2: number; 1: number } }
> = {
  "dev-0000-0000-0000-000000000001": {
    productId: "dev-0000-0000-0000-000000000001",
    averageRating: 4.8,
    totalReviews: 23,
    ratingBreakdown: { 5: 19, 4: 3, 3: 1, 2: 0, 1: 0 },
  },
  "dev-0000-0000-0000-000000000003": {
    productId: "dev-0000-0000-0000-000000000003",
    averageRating: 4.6,
    totalReviews: 11,
    ratingBreakdown: { 5: 8, 4: 2, 3: 1, 2: 0, 1: 0 },
  },
  "dev-0000-0000-0000-000000000005": {
    productId: "dev-0000-0000-0000-000000000005",
    averageRating: 4.4,
    totalReviews: 7,
    ratingBreakdown: { 5: 4, 4: 2, 3: 1, 2: 0, 1: 0 },
  },
  "dev-0000-0000-0000-000000000006": {
    productId: "dev-0000-0000-0000-000000000006",
    averageRating: 4.9,
    totalReviews: 31,
    ratingBreakdown: { 5: 28, 4: 3, 3: 0, 2: 0, 1: 0 },
  },
};

/** True when the dev fixture catalog should be served. */
export function devFixturesActive(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    !(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  );
}
