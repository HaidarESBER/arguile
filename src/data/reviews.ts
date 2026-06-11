// Shared review types and pure display helpers.
// The mock seed reviews that used to live here were removed: real reviews come
// from Supabase via src/lib/reviews.ts. This module must stay client-safe
// (it is imported by client components for types and date formatting).

export interface Review {
  id: string;
  productId: string;
  authorName: string; // First name + last initial (e.g., "Marie D.")
  rating: number; // 1-5
  comment: string;
  date: string; // ISO timestamp
  verifiedPurchase: boolean;
  photos?: string[]; // Customer review photos
}

export interface ProductRatingStats {
  productId: string;
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

/**
 * Anonymize a name by showing only first and last letters with asterisks in between
 * Example: "Marie D." becomes "M***e D."
 */
export function anonymizeName(name: string): string {
  return name.split(' ').map(part => {
    if (part.length <= 2) {
      return part; // Keep short parts as-is (like "D.")
    }
    const first = part[0];
    const last = part[part.length - 1];
    const middle = '*'.repeat(part.length - 2);
    return `${first}${middle}${last}`;
  }).join(' ');
}

/**
 * Format date as relative time in French
 */
export function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "Aujourd'hui";
  } else if (diffInDays === 1) {
    return "Hier";
  } else if (diffInDays < 7) {
    return `Il y a ${diffInDays} jours`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `Il y a ${months} mois`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `Il y a ${years} an${years > 1 ? "s" : ""}`;
  }
}
