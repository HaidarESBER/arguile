import { ProductCategory } from "@/types/product";
import type { Locale } from "@/lib/i18n/config";

/**
 * Category URL slugs — each category has a real, indexable page at
 * /produits/<slug> (e.g. /produits/chichas) so Google can rank category
 * keywords and surface the pages as sitelinks. The old ?categorie= URLs
 * permanently redirect to these paths.
 */
export const categorySlugs: Record<ProductCategory, string> = {
  chicha: "chichas",
  bol: "bols",
  tuyau: "tuyaux",
  charbon: "charbons",
  accessoire: "accessoires",
};

export const slugToCategory: Record<string, ProductCategory> = Object.fromEntries(
  Object.entries(categorySlugs).map(([category, slug]) => [slug, category])
) as Record<string, ProductCategory>;

export function categoryPath(category: ProductCategory): string {
  return `/produits/${categorySlugs[category]}`;
}

export interface CategorySeo {
  /** <title> / OG title */
  title: string;
  /** meta description */
  description: string;
  /** Visible SEO paragraph rendered under the category heading */
  intro: string;
}

const categorySeoFr: Record<ProductCategory, CategorySeo> = {
  chicha: {
    title: "Chichas Premium",
    description:
      "Découvrez notre sélection de chichas haut de gamme. Designs élégants et matériaux de qualité pour une expérience unique.",
    intro:
      "Trouvez la chicha qui vous ressemble parmi notre sélection de narguilés haut de gamme. Du modèle compact idéal pour débuter à la pièce d'exception en verre ou en inox pour les connaisseurs, chaque chicha est choisie pour sa qualité de fabrication, son tirage et sa durabilité. Livraison rapide partout en France.",
  },
  bol: {
    title: "Bols à Chicha",
    description:
      "Bols en céramique, verre et silicone pour chicha. Qualité artisanale pour une chauffe optimale du tabac.",
    intro:
      "Le bol (ou foyer) est la pièce qui fait toute la différence sur la qualité de votre session. Découvrez nos bols à chicha en céramique, en verre et en silicone, sélectionnés pour leur chauffe homogène et leur compatibilité avec le charbon naturel. Phunnel, vortex ou classique : il y a un foyer pour chaque style de fumeur.",
  },
  tuyau: {
    title: "Tuyaux de Chicha",
    description:
      "Tuyaux en silicone et cuir pour chicha. Matériaux premium pour un tirage parfait et une expérience confortable.",
    intro:
      "Un bon tuyau change complètement le confort de tirage. Nos tuyaux de chicha en silicone alimentaire et en cuir se nettoient facilement, ne gardent pas les odeurs et s'adaptent à la plupart des narguilés du marché. Embouts en aluminium ou en bois pour une prise en main agréable, session après session.",
  },
  charbon: {
    title: "Charbon pour Chicha",
    description:
      "Charbon naturel et auto-allumant pour chicha. Combustion longue et régulière pour des sessions prolongées.",
    intro:
      "Le charbon est le carburant de votre chicha : un bon charbon, c'est une chauffe stable, sans goût parasite. Retrouvez notre charbon naturel à base de noix de coco, plébiscité pour sa longue combustion et sa neutralité, ainsi que du charbon auto-allumant pratique pour les sessions improvisées. Formats et calibres adaptés à tous les foyers.",
  },
  accessoire: {
    title: "Accessoires Chicha",
    description:
      "Accessoires essentiels pour chicha : pinces, embouts, filtres, brosses et plus. Tout pour entretenir votre chicha.",
    intro:
      "Tout ce qu'il faut pour profiter de votre chicha et la garder comme au premier jour : pinces à charbon, embouts hygiéniques, brosses de nettoyage, joints d'étanchéité et autres indispensables. Des accessoires sélectionnés pour leur qualité, compatibles avec la plupart des narguilés.",
  },
};

const categorySeoEn: Record<ProductCategory, CategorySeo> = {
  chicha: {
    title: "Premium Hookahs",
    description:
      "Discover our selection of high-end hookahs. Elegant designs and quality materials for a unique experience.",
    intro:
      "Find the hookah that suits you among our selection of high-end hookahs. From the compact model perfect for getting started to the exceptional glass or stainless steel piece for connoisseurs, every hookah is chosen for its build quality, smooth draw and durability. Fast shipping throughout France.",
  },
  bol: {
    title: "Hookah Bowls",
    description:
      "Ceramic, glass and silicone hookah bowls. Artisan quality for optimal tobacco heat management.",
    intro:
      "The bowl (or head) is the part that makes all the difference to the quality of your session. Discover our ceramic, glass and silicone hookah bowls, selected for their even heat distribution and compatibility with natural charcoal. Phunnel, vortex or classic: there is a bowl for every style of smoker.",
  },
  tuyau: {
    title: "Hookah Hoses",
    description:
      "Silicone and leather hookah hoses. Premium materials for a perfect draw and a comfortable experience.",
    intro:
      "A good hose completely changes the comfort of your draw. Our food-grade silicone and leather hookah hoses are easy to clean, do not retain odors and fit most hookahs on the market. Aluminum or wooden mouthpieces for a pleasant grip, session after session.",
  },
  charbon: {
    title: "Hookah Charcoal",
    description:
      "Natural and quick-lighting hookah charcoal. Long, steady burn for extended sessions.",
    intro:
      "Charcoal is the fuel of your hookah: good charcoal means stable heat with no off-taste. Discover our natural coconut charcoal, prized for its long burn time and neutral flavor, as well as quick-lighting charcoal that is handy for impromptu sessions. Sizes and formats to suit every bowl.",
  },
  accessoire: {
    title: "Hookah Accessories",
    description:
      "Essential hookah accessories: tongs, mouthpieces, filters, brushes and more. Everything you need to maintain your hookah.",
    intro:
      "Everything you need to enjoy your hookah and keep it like new: charcoal tongs, hygienic mouthpieces, cleaning brushes, seals and other essentials. Accessories selected for their quality, compatible with most hookahs.",
  },
};

/** Per-locale category SEO content. */
export const categorySeoByLocale: Record<
  Locale,
  Record<ProductCategory, CategorySeo>
> = {
  fr: categorySeoFr,
  en: categorySeoEn,
};

/** Localized category SEO content (title, meta description, visible intro). */
export function getCategorySeo(
  category: ProductCategory,
  locale: Locale = "fr"
): CategorySeo {
  return categorySeoByLocale[locale][category];
}

/**
 * French-only category SEO content, kept for backward compatibility.
 * Customer-facing code should use getCategorySeo(category, locale).
 */
export const categorySeo: Record<ProductCategory, CategorySeo> = categorySeoFr;
