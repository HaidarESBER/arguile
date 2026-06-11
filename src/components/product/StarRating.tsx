"use client";

interface StarRatingProps {
  rating: number; // 0-5, supports decimals (e.g., 4.3)
  size?: "xs" | "sm" | "md" | "lg";
  interactive?: boolean; // For future review submission feature
  onChange?: (rating: number) => void; // For interactive mode
}

const sizeClasses = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

/**
 * StarRating component displays star ratings with half-star support
 *
 * Features:
 * - Displays 1-5 stars (filled/empty) based on rating value
 * - Half stars for decimal ratings (4.5 shows 4.5 stars)
 * - Brand colors: filled = blush (#D4A5A5), empty = mist (#E8E8E8)
 * - Two modes: display (static) and interactive (for future review submission)
 *
 * @example
 * <StarRating rating={4.3} size="md" />
 */
export function StarRating({
  rating,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, index) => {
    const starValue = index + 1;
    const fillPercentage = Math.max(0, Math.min(1, rating - index)) * 100;

    return {
      key: starValue,
      fillPercentage,
    };
  });

  const handleClick = (starValue: number) => {
    if (interactive && onChange) {
      onChange(starValue);
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      {stars.map(({ key, fillPercentage }) => (
        <button
          key={key}
          onClick={() => handleClick(key)}
          disabled={!interactive}
          className={`relative ${sizeClasses[size]} ${
            interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""
          }`}
          aria-label={`${key} star${key > 1 ? "s" : ""}`}
          type="button"
        >
          {/* Empty star (background) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#E8E8E8"
            className="absolute inset-0"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>

          {/* Filled star (gradient overlay) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - fillPercentage}% 0 0)` }}
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill="#D4A5A5"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

/**
 * StarRatingDisplay - Compact version with rating number
 */
export function StarRatingDisplay({
  rating,
  totalReviews,
  size = "sm",
}: {
  rating: number;
  totalReviews: number;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const textSizes = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex items-center gap-2">
      <StarRating rating={rating} size={size} />
      <span className={`${textSizes[size]} text-muted`}>
        {rating.toFixed(1)} ({totalReviews})
      </span>
    </div>
  );
}
