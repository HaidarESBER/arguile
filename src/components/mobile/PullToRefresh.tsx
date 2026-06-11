"use client";

import { useEffect, useState, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
}

/**
 * PullToRefresh wrapper component for mobile native-like refresh
 *
 * Features:
 * - Detects pull-down gesture on touch devices
 * - Shows visual feedback: animated refresh icon
 * - Threshold: 80px pull distance to trigger
 * - Smooth spring animation using Framer Motion
 * - Calls onRefresh callback when threshold met
 * - Resets after refresh completes
 * - Haptic feedback if available (navigator.vibrate(50))
 * - Only active on mobile (<768px)
 * - Only triggers at scroll position 0 (top of page)
 */
export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle touch events for pull-to-refresh
  useEffect(() => {
    if (!isMobile || !containerRef.current) return;

    const container = containerRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if at top of page
      if (window.scrollY === 0) {
        touchStartY.current = e.touches[0].clientY;
        touchStartX.current = e.touches[0].clientX;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Only trigger if at top of page and not already refreshing
      if (window.scrollY !== 0 || isRefreshing) return;

      const touchY = e.touches[0].clientY;
      const touchX = e.touches[0].clientX;
      const distanceY = touchY - touchStartY.current;
      const distanceX = Math.abs(touchX - touchStartX.current);

      // Only activate on pull down, and only if it's more vertical than horizontal
      if (distanceY > 0 && distanceY > distanceX) {
        // Prevent default scroll behavior while pulling
        // Only call preventDefault if the event is cancelable
        if (distanceY > 10 && e.cancelable) {
          e.preventDefault();
        }

        // Cap distance at MAX_PULL for visual effect
        const cappedDistance = Math.min(distanceY, MAX_PULL);
        setPullDistance(cappedDistance);
        setIsPulling(true);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;

      // Trigger refresh if threshold met
      if (pullDistance >= PULL_THRESHOLD) {
        setIsRefreshing(true);

        // Haptic feedback
        if ("vibrate" in navigator) {
          navigator.vibrate(50);
        }

        try {
          await onRefresh();
        } catch (error) {
          console.error("Refresh failed:", error);
        } finally {
          setIsRefreshing(false);
        }
      }

      // Reset state
      setIsPulling(false);
      setPullDistance(0);
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, isPulling, pullDistance, isRefreshing, onRefresh]);

  // Calculate indicator opacity and scale based on pull distance
  const indicatorOpacity = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const indicatorScale = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden">
      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{
              opacity: isRefreshing ? 1 : indicatorOpacity,
              y: 0,
              scale: isRefreshing ? 1 : indicatorScale,
            }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center w-12 h-12 bg-background rounded-full shadow-md"
            style={{
              transform: `translateX(-50%) translateY(${isRefreshing ? "20px" : `${pullDistance / 2}px`})`,
            }}
          >
            {/* Spinner icon */}
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
              animate={isRefreshing ? { rotate: 360 } : {}}
              transition={
                isRefreshing
                  ? { duration: 1, repeat: Infinity, ease: "linear" }
                  : {}
              }
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </motion.svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {children}
    </div>
  );
}
