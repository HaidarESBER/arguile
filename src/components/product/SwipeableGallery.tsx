"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

interface SwipeableGalleryProps {
  images: string[];
  productName: string;
  onImageClick?: () => void;
}

/**
 * SwipeableGallery component for mobile-first product image galleries
 *
 * Features:
 * - Horizontal swipe to navigate between images
 * - Drag threshold: 50px to trigger image change
 * - Momentum scrolling with velocity-based snap
 * - Resistance at start/end (elastic bounce)
 * - Dots indicator below gallery
 * - Desktop fallback with arrow buttons
 */
export function SwipeableGallery({
  images,
  productName,
  onImageClick,
}: SwipeableGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragDirection, setDragDirection] = useState(0);

  const SWIPE_THRESHOLD = 50;
  const SWIPE_VELOCITY_THRESHOLD = 500;

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const swipeDistance = info.offset.x;
    const swipeVelocity = info.velocity.x;

    // Check velocity-based swipe
    if (Math.abs(swipeVelocity) > SWIPE_VELOCITY_THRESHOLD) {
      if (swipeVelocity > 0 && currentIndex > 0) {
        // Swipe right: previous image
        setCurrentIndex(currentIndex - 1);
      } else if (swipeVelocity < 0 && currentIndex < images.length - 1) {
        // Swipe left: next image
        setCurrentIndex(currentIndex + 1);
      }
    }
    // Check distance-based swipe
    else if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
      if (swipeDistance > 0 && currentIndex > 0) {
        // Swipe right: previous image
        setCurrentIndex(currentIndex - 1);
      } else if (swipeDistance < 0 && currentIndex < images.length - 1) {
        // Swipe left: next image
        setCurrentIndex(currentIndex + 1);
      }
    }

    setDragDirection(0);
  };

  const handleDrag = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setDragDirection(info.offset.x);
  };

  const navigatePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const navigateNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  // Calculate resistance at edges
  const getDragConstraints = () => {
    const atStart = currentIndex === 0;
    const atEnd = currentIndex === images.length - 1;

    return {
      left: atEnd ? -100 : 0,
      right: atStart ? 100 : 0,
    };
  };

  return (
    <div className="relative">
      {/* Gallery container */}
      <div
        className="relative aspect-square bg-background-secondary rounded-[--radius-card] overflow-hidden mb-4 cursor-grab active:cursor-grabbing"
        onClick={onImageClick}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentIndex}
            drag="x"
            dragConstraints={getDragConstraints()}
            dragElastic={0.2}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: dragDirection < 0 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dragDirection < 0 ? -50 : 50 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="relative w-full h-full"
            style={{ touchAction: "pan-y" }}
          >
            <Image
              src={images[currentIndex]}
              alt={`${productName} - Image ${currentIndex + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority={currentIndex === 0}
            />

            {/* Peek indicators for next/prev images */}
            {currentIndex > 0 && (
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-primary/20 to-transparent pointer-events-none" />
            )}
            {currentIndex < images.length - 1 && (
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Desktop arrow buttons (hidden on mobile) */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigatePrev();
              }}
              disabled={currentIndex === 0}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-background/80 hover:bg-background text-primary rounded-full opacity-0 hover:opacity-100 transition-opacity disabled:opacity-0 disabled:cursor-not-allowed z-10"
              aria-label="Previous image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateNext();
              }}
              disabled={currentIndex === images.length - 1}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-background/80 hover:bg-background text-primary rounded-full opacity-0 hover:opacity-100 transition-opacity disabled:opacity-0 disabled:cursor-not-allowed z-10"
              aria-label="Next image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 mb-4">
          {images.length <= 5 ? (
            // Show dots for 5 or fewer images
            images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${
                    index === currentIndex
                      ? "bg-accent w-6"
                      : "bg-muted hover:bg-primary"
                  }
                `}
                style={{ minWidth: "44px", minHeight: "44px", padding: "20px" }}
                aria-label={`Go to image ${index + 1}`}
              />
            ))
          ) : (
            // Show count for 6+ images
            <div className="text-sm text-muted font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
