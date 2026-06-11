"use client";

import { SwipeableGallery } from "../SwipeableGallery";

interface MobileGalleryProps {
  images: string[];
  productName: string;
  onImageClick: () => void;
}

/**
 * Mobile-optimized gallery wrapper
 * Uses SwipeableGallery for native touch gestures
 */
export function MobileGallery({
  images,
  productName,
  onImageClick,
}: MobileGalleryProps) {
  return (
    <div className="w-full">
      <SwipeableGallery
        images={images}
        productName={productName}
        onImageClick={onImageClick}
      />
    </div>
  );
}
