"use client";

import { memo, useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCategory, categoryLabels } from "@/types/product";

interface DesktopGalleryPremiumProps {
  images: string[];
  productName: string;
  category: ProductCategory;
  selectedIndex: number;
  onImageSelect: (index: number) => void;
  onImageClick: () => void;
  hasDiscount?: boolean;
  discountPercentage?: number;
}

/**
 * Premium desktop gallery with side thumbnails
 * Luxury e-commerce layout inspired by high-end brands
 */
export const DesktopGalleryPremium = memo(function DesktopGalleryPremium({
  images,
  productName,
  category,
  selectedIndex,
  onImageSelect,
  onImageClick,
  hasDiscount,
  discountPercentage,
}: DesktopGalleryPremiumProps) {
  const MAX_VISIBLE_THUMBNAILS = 4;
  const [showAllThumbnails, setShowAllThumbnails] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const visibleThumbnails = showAllThumbnails
    ? images
    : images.slice(0, MAX_VISIBLE_THUMBNAILS);
  const remainingCount = images.length - MAX_VISIBLE_THUMBNAILS;

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      onImageSelect((selectedIndex + 1) % images.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [selectedIndex, images.length, isAutoPlaying, onImageSelect]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    onImageSelect(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    onImageSelect((selectedIndex + 1) % images.length);
  };

  const handleThumbnailClick = (index: number) => {
    setIsAutoPlaying(false);
    onImageSelect(index);
  };

  const handleShowAllThumbnails = () => {
    setShowAllThumbnails(true);
  };

  return (
    <div className="space-y-3">
      {/* Main Image Container - Full Width, Square Aspect */}
      <div className="relative">
        {/* Category Badge - Top Left */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="absolute top-3 left-3 z-20"
        >
          <span className="inline-flex text-xs tracking-widest uppercase text-accent font-semibold bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-accent/20">
            {categoryLabels[category]}
          </span>
        </motion.div>

        {/* Sale Badge */}
        {hasDiscount && discountPercentage && (
          <motion.div
            initial={{ scale: 0, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute top-3 right-3 z-20"
          >
            <div className="bg-error text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              -{discountPercentage}%
            </div>
          </motion.div>
        )}

        {/* Main Image - Square Ratio */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-background-secondary to-background shadow-lg cursor-zoom-in group"
          onClick={onImageClick}
        >
          {/* Navigation Arrows - Only show if multiple images */}
          {images.length > 1 && (
            <>
              {/* Previous Arrow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 text-primary" />
              </button>

              {/* Next Arrow */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 text-primary" />
              </button>
            </>
          )}

          {/* Zoom hint overlay */}
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-all duration-300 z-10 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2"
            >
              <ZoomIn className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">
                Cliquer pour agrandir
              </span>
            </motion.div>
          </div>

          {/* Main Product Image with Fade Animation */}
          <div className="relative w-full h-full p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="relative w-full h-full"
              >
                <Image
                  src={images[selectedIndex]}
                  alt={productName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                  priority
                  quality={90}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Subtle border */}
          <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-border/20 pointer-events-none" />

          {/* Image Counter - Inside Image */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-3">
              <div className="bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs text-primary font-medium shadow-lg border border-border/30">
                {selectedIndex + 1} / {images.length}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Horizontal Thumbnails - Below Main Image */}
      {images.length > 1 && (
        <div className="flex gap-2 justify-center flex-wrap">
          {visibleThumbnails.map((image, index) => (
            <motion.button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative w-20 aspect-square rounded-lg overflow-hidden
                border-2 transition-all duration-300 group flex-shrink-0
                ${
                  index === selectedIndex
                    ? "border-accent shadow-md ring-2 ring-accent/20"
                    : "border-border/40 hover:border-accent/50 opacity-60 hover:opacity-100"
                }
              `}
            >
              <Image
                src={image}
                alt={`${productName} - ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
            </motion.button>
          ))}

          {/* "+X more" button - Clickable to show all */}
          {!showAllThumbnails && remainingCount > 0 && (
            <motion.button
              onClick={handleShowAllThumbnails}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-20 aspect-square rounded-lg bg-background-secondary border-2 border-border/40 hover:border-accent/50 flex items-center justify-center transition-all duration-300 hover:bg-accent/10 cursor-pointer"
            >
              <span className="text-xs font-semibold text-muted hover:text-accent transition-colors">
                +{remainingCount}
              </span>
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
});
