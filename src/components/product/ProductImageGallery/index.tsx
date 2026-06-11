"use client";

import { useState, useEffect } from "react";
import { MobileGallery } from "./MobileGallery";
import { DesktopGalleryPremium } from "./DesktopGalleryPremium";
import { ProductCategory } from "@/types/product";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  category: ProductCategory;
  hasDiscount?: boolean;
  discountPercentage?: number;
  selectedIndex?: number;
  onImageSelect?: (index: number) => void;
  onImageClick: () => void;
}

/**
 * Responsive product image gallery
 * - Mobile (<768px): Swipeable gallery with touch gestures
 * - Desktop (≥768px): Premium side thumbnail navigation
 */
export function ProductImageGallery({
  images,
  productName,
  category,
  hasDiscount,
  discountPercentage,
  selectedIndex: externalSelectedIndex,
  onImageSelect: externalOnImageSelect,
  onImageClick,
}: ProductImageGalleryProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [internalSelectedIndex, setInternalSelectedIndex] = useState(0);

  // Use external state if provided, otherwise use internal state
  const selectedIndex = externalSelectedIndex ?? internalSelectedIndex;
  const setSelectedIndex = externalOnImageSelect ?? setInternalSelectedIndex;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return isMobile ? (
    <MobileGallery
      images={images}
      productName={productName}
      onImageClick={onImageClick}
    />
  ) : (
    <DesktopGalleryPremium
      images={images}
      productName={productName}
      category={category}
      selectedIndex={selectedIndex}
      onImageSelect={setSelectedIndex}
      onImageClick={onImageClick}
      hasDiscount={hasDiscount}
      discountPercentage={discountPercentage}
    />
  );
}
