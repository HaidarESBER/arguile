"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string;
  alt: string;
  priority?: boolean;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  className?: string;
}

/**
 * OptimizedImage - Production-grade image optimization wrapper
 *
 * Features:
 * - Automatic WebP/AVIF conversion via Next.js Image Optimization API
 * - Lazy loading by default (loading="lazy")
 * - Blur placeholder for smooth loading
 * - Responsive sizes based on layout
 * - Priority loading for above-fold images
 * - Error state with fallback placeholder
 * - Loading state with blur-up effect
 *
 * Performance targets:
 * - LCP (Largest Contentful Paint): < 2.5s
 * - CLS (Cumulative Layout Shift): < 0.1
 * - Images served as WebP (30-50% smaller than JPEG)
 */
export function OptimizedImage({
  src,
  alt,
  priority = false,
  objectFit = "cover",
  className = "",
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Fallback placeholder for error states
  const fallbackSrc = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f5f5f0' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23C7C7C0' font-family='sans-serif' font-size='16'%3EImage non disponible%3C/text%3E%3C/svg%3E";

  // Low-quality image placeholder (LQIP) for blur-up effect
  const blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

  return (
    <Image
      src={hasError ? fallbackSrc : src}
      alt={alt}
      className={`
        transition-opacity duration-300
        ${isLoading ? "opacity-0" : "opacity-100"}
        ${className}
      `}
      style={{
        objectFit: objectFit,
      }}
      onLoad={() => setIsLoading(false)}
      onError={() => {
        setHasError(true);
        setIsLoading(false);
      }}
      loading={priority ? undefined : "lazy"}
      priority={priority}
      placeholder="blur"
      blurDataURL={blurDataURL}
      {...props}
    />
  );
}
