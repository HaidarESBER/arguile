"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/**
 * InstallPrompt component for PWA installation
 *
 * Features:
 * - Listens for beforeinstallprompt event
 * - Shows only on /produits page after scrolling 200px down
 * - Small, subtle banner in bottom-left corner (doesn't interfere with FloatingCartButton)
 * - Compact design: small logo + text + install icon
 * - Dismiss button (X icon in top-right)
 * - Triggers native install prompt on banner click
 * - Dismisses after install or on X click
 * - Stores dismissal in localStorage (don't show again)
 * - Only shows on mobile (<768px)
 * - Smooth slide-in animation from left using Framer Motion
 *
 * Positioning:
 * - Fixed bottom-left, higher up (bottom-20) to avoid overlapping with Filtres button
 * - z-index: 40
 * - Positioned higher to prevent UI conflicts with bottom-centered elements
 */
/** Minimal typing for the non-standard beforeinstallprompt event */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const SCROLL_THRESHOLD = 200;

  // Only show on /produits page
  const shouldShowOnThisPage = pathname === "/produits";

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > SCROLL_THRESHOLD;
      setIsVisible(scrolled);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed === "true") {
      // Reads localStorage on mount; deferred to effect to avoid SSR hydration mismatch
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowPrompt(false);
      return;
    }

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();

      // Double-check dismissal before showing
      const stillDismissed = localStorage.getItem("pwa-install-dismissed");
      if (stillDismissed === "true") {
        return;
      }

      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);

    // Mark as dismissed
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  // Don't render on desktop, wrong page, not scrolled, or if no prompt available
  if (!isMobile || !showPrompt || !shouldShowOnThisPage || !isVisible) return null;

  return (
    <AnimatePresence>
      {showPrompt && isVisible && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={handleInstallClick}
          className="fixed bottom-20 left-4 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg px-3 py-2 z-40 cursor-pointer hover:bg-background transition-colors md:hidden"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-background border border-border rounded-full text-muted hover:text-primary hover:border-primary transition-colors"
            aria-label="Fermer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-3 h-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            {/* Logo */}
            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Nuage"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-primary">
                Installer l&apos;app
              </p>
            </div>

            {/* Install icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 text-primary flex-shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
