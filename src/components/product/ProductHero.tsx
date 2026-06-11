"use client";

import { motion } from "framer-motion";

/**
 * Hero section for products page
 *
 * Features:
 * - Eye-catching gradient background
 * - Animated text
 * - CTA buttons
 * - Stats or highlights
 */
export function ProductHero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-accent/20 rounded-[--radius-card] mb-12">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative px-6 py-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Title & Description */}
          <div className="flex-1 min-w-0">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="font-heading text-xl md:text-2xl text-background mb-1"
            >
              Collection <span className="text-accent italic">Premium</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-background/80 text-xs md:text-sm"
            >
              Chichas et accessoires de qualité supérieure
            </motion.p>
          </div>

          {/* Right: CTA Button */}
          <motion.a
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            href="#products"
            className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium bg-background text-primary rounded-[--radius-button] hover:bg-accent hover:text-background transition-colors whitespace-nowrap"
          >
            Explorer
          </motion.a>
        </div>
      </div>
    </div>
  );
}
