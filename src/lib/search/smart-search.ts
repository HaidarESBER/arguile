import type { Product } from "@/types/product";

/**
 * Smart product search with synonym expansion, fuzzy matching,
 * accent normalization, and relevance scoring.
 *
 * Designed for a French chicha/hookah e-commerce store.
 */

// ── Synonym map ──────────────────────────────────────────────────────────
// Each key maps to a set of equivalent terms.
// When the user types any of these words, products matching ANY synonym score higher.
const SYNONYMS: Record<string, string[]> = {
  // Product types
  chicha: ["chicha", "chichas", "hookah", "hookahs", "narguilé", "narguile", "narghilé", "narghile", "shisha", "shishas", "pipe à eau", "pipe a eau", "waterpipe"],
  bol: ["bol", "bols", "foyer", "foyers", "bowl", "bowls", "tête", "tete", "head"],
  tuyau: ["tuyau", "tuyaux", "tube", "tubes", "hose", "silicone", "flexible"],
  charbon: ["charbon", "charbons", "coal", "coals", "braise", "braises", "naturel", "coco", "coconut"],
  accessoire: ["accessoire", "accessoires", "accessory", "accessories", "pièce", "piece", "pièces", "pieces"],

  // Materials & qualities
  verre: ["verre", "glass", "cristal", "crystal", "transparent"],
  acier: ["acier", "inox", "stainless", "steel", "métal", "metal", "aluminium"],
  bois: ["bois", "wood", "wooden"],
  ceramique: ["céramique", "ceramique", "ceramic", "argile", "clay", "terre cuite"],
  silicone: ["silicone", "caoutchouc", "rubber", "souple", "flexible"],

  // Sizes
  petit: ["petit", "petite", "mini", "compact", "compacte", "small", "portable", "voyage", "travel"],
  grand: ["grand", "grande", "large", "big", "xl", "xxl", "géant", "geant"],
  moyen: ["moyen", "moyenne", "medium", "standard", "normal"],

  // Qualities
  premium: ["premium", "luxe", "luxury", "haut de gamme", "prestige", "pro", "professionnel"],
  classique: ["classique", "classic", "traditionnel", "traditionnelle", "traditional", "basique", "basic", "simple"],
  moderne: ["moderne", "modern", "contemporain", "design", "led", "rgb"],

  // Colors
  noir: ["noir", "noire", "black", "sombre", "dark"],
  blanc: ["blanc", "blanche", "white"],
  rouge: ["rouge", "red"],
  bleu: ["bleu", "bleue", "blue"],
  or: ["or", "doré", "dore", "gold", "golden"],
  argent: ["argent", "argenté", "argente", "silver"],
  rose: ["rose", "pink"],

  // Usage
  fumee: ["fumée", "fumee", "smoke", "vapeur", "vapor"],
  filtre: ["filtre", "filtres", "filter", "diffuseur", "diffuser"],
  embout: ["embout", "embouts", "mouthpiece", "bec"],
  pince: ["pince", "pinces", "tongs", "clip"],
  grille: ["grille", "grilles", "screen", "mesh", "grid"],
  joint: ["joint", "joints", "seal", "étanchéité"],
  plaque: ["plaque", "plaques", "plate", "plateau", "tray"],
  allume: ["allume", "allumeur", "briquet", "lighter", "allumage", "ignition"],

  // Intent-based
  cadeau: ["cadeau", "cadeaux", "gift", "offrir", "idée cadeau"],
  pas_cher: ["pas cher", "bon marché", "economique", "économique", "abordable", "affordable", "cheap", "budget", "promo", "promotion", "solde", "soldes"],
  meilleur: ["meilleur", "meilleure", "best", "top", "populaire", "recommandé", "recommande"],
  nouveau: ["nouveau", "nouvelle", "new", "nouveauté", "nouveaute", "récent", "recent", "dernier", "dernière"],
};

// Build a reverse lookup: word → list of synonym group keys
const REVERSE_SYNONYMS = new Map<string, string[]>();
for (const [key, words] of Object.entries(SYNONYMS)) {
  for (const word of words) {
    const normalized = normalize(word);
    const existing = REVERSE_SYNONYMS.get(normalized) || [];
    existing.push(key);
    REVERSE_SYNONYMS.set(normalized, existing);
  }
}

// ── Normalization ────────────────────────────────────────────────────────

/** Strip accents, lowercase, collapse whitespace */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // strip accents
    .replace(/['']/g, " ")            // replace apostrophes with space
    .replace(/[-_]/g, " ")            // replace hyphens/underscores with space
    .replace(/[^a-z0-9\s]/g, "")      // remove non-alphanumeric
    .replace(/\s+/g, " ")             // collapse whitespace
    .trim();
}

/** Tokenize a string into individual words */
function tokenize(text: string): string[] {
  return normalize(text).split(" ").filter(Boolean);
}

// ── Fuzzy matching ───────────────────────────────────────────────────────

/** Levenshtein distance for short strings (typo tolerance) */
function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[b.length][a.length];
}

/** Check if queryWord fuzzy-matches targetWord */
function fuzzyMatch(queryWord: string, targetWord: string): boolean {
  // Exact match or prefix match
  if (targetWord.startsWith(queryWord) || queryWord.startsWith(targetWord)) return true;
  if (targetWord.includes(queryWord)) return true;

  // Levenshtein for short words (typo tolerance)
  const maxDist = queryWord.length <= 3 ? 1 : queryWord.length <= 6 ? 2 : 3;
  return levenshtein(queryWord, targetWord) <= maxDist;
}

// ── Synonym expansion ────────────────────────────────────────────────────

/** Expand a query word into all its synonyms */
function expandSynonyms(word: string): string[] {
  const normalized = normalize(word);
  const groups = REVERSE_SYNONYMS.get(normalized);
  if (!groups) return [normalized];

  const expanded = new Set<string>([normalized]);
  for (const groupKey of groups) {
    const synonyms = SYNONYMS[groupKey];
    if (synonyms) {
      for (const syn of synonyms) {
        expanded.add(normalize(syn));
      }
    }
  }
  return Array.from(expanded);
}

/** Expand a multi-word query phrase against multi-word synonym entries */
function expandPhraseSynonyms(queryNormalized: string): string[] {
  const expanded: string[] = [];

  for (const [, words] of Object.entries(SYNONYMS)) {
    for (const phrase of words) {
      const normalizedPhrase = normalize(phrase);
      // If query contains this multi-word synonym phrase
      if (normalizedPhrase.includes(" ") && queryNormalized.includes(normalizedPhrase)) {
        // Add all other synonyms in the same group
        for (const syn of words) {
          expanded.push(normalize(syn));
        }
      }
    }
  }

  return expanded;
}

// ── Scoring ──────────────────────────────────────────────────────────────

interface ScoredProduct {
  product: Product;
  score: number;
}

/**
 * Score a product against a search query.
 * Higher = more relevant.
 */
function scoreProduct(product: Product, queryTokens: string[], phraseSynonyms: string[], queryNormalized: string): number {
  const nameNorm = normalize(product.name);
  const descNorm = normalize(product.description);
  const shortDescNorm = normalize(product.shortDescription);
  const categoryNorm = normalize(product.category);
  const specsNorm = (product.specs || []).map(s => normalize(`${s.label} ${s.value}`)).join(" ");

  const allText = `${nameNorm} ${descNorm} ${shortDescNorm} ${categoryNorm} ${specsNorm}`;
  const nameTokens = tokenize(nameNorm);
  const allTokens = tokenize(allText);

  let score = 0;

  // Full query match in name (highest value)
  if (nameNorm.includes(queryNormalized)) {
    score += 100;
  }

  // Full query match in description
  if (descNorm.includes(queryNormalized) || shortDescNorm.includes(queryNormalized)) {
    score += 30;
  }

  for (const qToken of queryTokens) {
    const synonyms = expandSynonyms(qToken);

    // Check each synonym against product text
    for (const syn of synonyms) {
      const synTokens = tokenize(syn);

      for (const synToken of synTokens) {
        // Exact token match in name
        if (nameTokens.some(t => t === synToken)) {
          score += syn === qToken ? 40 : 20; // direct match scores more than synonym match
        }
        // Prefix match in name
        else if (nameTokens.some(t => t.startsWith(synToken) || synToken.startsWith(t))) {
          score += syn === qToken ? 25 : 12;
        }
        // Exact token match anywhere
        else if (allTokens.some(t => t === synToken)) {
          score += syn === qToken ? 15 : 8;
        }
        // Fuzzy match in name
        else if (nameTokens.some(t => fuzzyMatch(synToken, t))) {
          score += syn === qToken ? 20 : 10;
        }
        // Fuzzy match anywhere
        else if (allTokens.some(t => fuzzyMatch(synToken, t))) {
          score += syn === qToken ? 10 : 5;
        }
      }
    }
  }

  // Multi-word phrase synonym matches
  for (const phraseSyn of phraseSynonyms) {
    if (allText.includes(phraseSyn)) {
      score += 15;
    }
  }

  // Category match bonus
  for (const qToken of queryTokens) {
    const synonyms = expandSynonyms(qToken);
    for (const syn of synonyms) {
      if (categoryNorm === syn || categoryNorm.includes(syn)) {
        score += 25;
      }
    }
  }

  // Featured product bonus (tie-breaker)
  if (product.featured && score > 0) {
    score += 3;
  }

  // In-stock bonus (tie-breaker)
  if (product.inStock && score > 0) {
    score += 2;
  }

  return score;
}

// ── Public API ────────────────────────────────────────────────────────────

export interface SmartSearchResult {
  product: Product;
  score: number;
}

/**
 * Perform intelligent product search.
 *
 * Features:
 * - Accent & case normalization ("céramique" = "ceramique")
 * - Synonym expansion ("hookah" finds "chicha", "narguilé" finds "chicha")
 * - Fuzzy/typo tolerance ("chciha" finds "chicha")
 * - Multi-word phrase matching ("pipe à eau" matches chicha products)
 * - Relevance scoring (name matches > description > category)
 * - Featured & in-stock products ranked slightly higher
 *
 * @param products - Full product catalog
 * @param query - User search query
 * @param options - Search options
 * @returns Sorted array of matching products (best match first)
 */
export function smartSearch(
  products: Product[],
  query: string,
  options?: { limit?: number; minScore?: number }
): SmartSearchResult[] {
  const { limit, minScore = 5 } = options ?? {};

  const queryNormalized = normalize(query);
  if (!queryNormalized) return [];

  const queryTokens = tokenize(queryNormalized);
  if (queryTokens.length === 0) return [];

  const phraseSynonyms = expandPhraseSynonyms(queryNormalized);

  const scored: ScoredProduct[] = [];
  for (const product of products) {
    const score = scoreProduct(product, queryTokens, phraseSynonyms, queryNormalized);
    if (score >= minScore) {
      scored.push({ product, score });
    }
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  const results = limit ? scored.slice(0, limit) : scored;
  return results;
}
