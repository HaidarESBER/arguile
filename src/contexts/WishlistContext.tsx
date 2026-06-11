"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { trackWishlistAdd, trackWishlistRemove } from "@/lib/analytics";

const WISHLIST_STORAGE_KEY = "nuage-wishlist";

interface WishlistContextValue {
  wishlistItems: string[]; // Array of product IDs
  addToWishlist: (productId: string, productName?: string) => void;
  removeFromWishlist: (productId: string, productName?: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

interface WishlistProviderProps {
  children: ReactNode;
}

/**
 * Load wishlist from localStorage
 */
function loadWishlistFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to load wishlist from localStorage:", error);
  }
  return [];
}

/**
 * Save wishlist to localStorage
 */
function saveWishlistToStorage(items: string[]): void {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save wishlist to localStorage:", error);
  }
}

/**
 * WishlistProvider component that wraps the app and provides wishlist state
 * For authenticated users: syncs with database via API
 * For guest users: uses localStorage only
 */
export function WishlistProvider({ children }: WishlistProviderProps) {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status and load wishlist
  useEffect(() => {
    async function init() {
      // Only hit the API when a Supabase auth cookie is present — anonymous
      // visitors get localStorage directly (previously every visitor fired
      // /api/wishlist on every page load just to receive a 401).
      const hasAuthCookie = document.cookie
        .split(";")
        .some((cookie) => cookie.trim().startsWith("sb-"));

      if (!hasAuthCookie) {
        setIsAuthenticated(false);
        setWishlistItems(loadWishlistFromStorage());
        setIsHydrated(true);
        setIsLoading(false);
        return;
      }

      try {
        // Check if user is authenticated by trying to fetch wishlist
        const response = await fetch('/api/wishlist');

        if (response.ok) {
          // User is authenticated - load from API
          setIsAuthenticated(true);
          const data = await response.json();
          const apiProductIds = data.items.map(
            (item: { productId: string }) => item.productId
          );

          // MIGRATION: Sync localStorage wishlist to database
          const localStorageItems = loadWishlistFromStorage();
          const itemsToMigrate = localStorageItems.filter(
            (id) => !apiProductIds.includes(id)
          );

          if (itemsToMigrate.length > 0) {
            console.log(`Migrating ${itemsToMigrate.length} items from localStorage to database`);

            // Add each localStorage item to database
            await Promise.allSettled(
              itemsToMigrate.map((productId) =>
                fetch('/api/wishlist', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ productId }),
                })
              )
            );

            // Reload wishlist after migration
            const refreshResponse = await fetch('/api/wishlist');
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              const mergedIds = refreshData.items.map(
                (item: { productId: string }) => item.productId
              );
              setWishlistItems(mergedIds);
            }

            // Clear localStorage after successful migration
            localStorage.removeItem(WISHLIST_STORAGE_KEY);
          } else {
            setWishlistItems(apiProductIds);
          }
        } else {
          // 401 (not authenticated) or any other API error: fall back to
          // localStorage so the wishlist isn't left empty
          setIsAuthenticated(false);
          const stored = loadWishlistFromStorage();
          setWishlistItems(stored);
        }
      } catch (error) {
        console.error('Failed to load wishlist:', error);
        // Fallback to localStorage on error
        const stored = loadWishlistFromStorage();
        setWishlistItems(stored);
        setIsAuthenticated(false);
      } finally {
        setIsHydrated(true);
        setIsLoading(false);
      }
    }

    init();
  }, []);

  // Listen for storage events from other tabs (guest users only)
  useEffect(() => {
    if (isAuthenticated === false) {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === WISHLIST_STORAGE_KEY) {
          setWishlistItems(loadWishlistFromStorage());
        }
      };
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, [isAuthenticated]);

  // Save to localStorage for guest users
  useEffect(() => {
    if (isHydrated && isAuthenticated === false) {
      saveWishlistToStorage(wishlistItems);
    }
  }, [wishlistItems, isHydrated, isAuthenticated]);

  const addToWishlist = useCallback(async (productId: string, productName?: string) => {
    // Optimistic update
    setWishlistItems((current) => {
      if (current.includes(productId)) {
        return current;
      }
      return [...current, productId];
    });

    // Track wishlist add event
    trackWishlistAdd(productId, productName);

    // If authenticated, sync with API
    if (isAuthenticated) {
      try {
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
          // Revert optimistic update on error
          setWishlistItems((current) => current.filter(id => id !== productId));
          console.error('Failed to add to wishlist');
        }
      } catch (error) {
        // Revert optimistic update on error
        setWishlistItems((current) => current.filter(id => id !== productId));
        console.error('Failed to add to wishlist:', error);
      }
    } else {
      // Guest user - just save to localStorage (handled by useEffect)
    }
  }, [isAuthenticated]);

  const removeFromWishlist = useCallback(async (productId: string, productName?: string) => {
    // Optimistic update
    const previousItems = wishlistItems;
    setWishlistItems((current) => current.filter((id) => id !== productId));

    // Track wishlist remove event
    trackWishlistRemove(productId, productName);

    // If authenticated, sync with API
    if (isAuthenticated) {
      try {
        const response = await fetch(`/api/wishlist/${productId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          // Revert optimistic update on error
          setWishlistItems(previousItems);
          console.error('Failed to remove from wishlist');
        }
      } catch (error) {
        // Revert optimistic update on error
        setWishlistItems(previousItems);
        console.error('Failed to remove from wishlist:', error);
      }
    } else {
      // Guest user - just save to localStorage (handled by useEffect)
    }
  }, [isAuthenticated, wishlistItems]);

  const isInWishlist = useCallback(
    (productId: string) => {
      return wishlistItems.includes(productId);
    },
    [wishlistItems]
  );

  const clearWishlist = useCallback(async () => {
    // Optimistic update
    const previousItems = wishlistItems;
    setWishlistItems([]);

    // For authenticated users, sync the deletions to the database
    // (previously the DB copy survived and reappeared on next load)
    if (isAuthenticated && previousItems.length > 0) {
      try {
        const responses = await Promise.allSettled(
          previousItems.map((productId) =>
            fetch(`/api/wishlist/${productId}`, { method: 'DELETE' })
          )
        );

        // Restore any items whose deletion failed
        const failedItems = previousItems.filter((_, index) => {
          const result = responses[index];
          return result.status === 'rejected' || !result.value.ok;
        });

        if (failedItems.length > 0) {
          console.error('Failed to remove some wishlist items');
          setWishlistItems((current) => [
            ...current,
            ...failedItems.filter((id) => !current.includes(id)),
          ]);
        }
      } catch (error) {
        console.error('Failed to clear wishlist:', error);
        setWishlistItems(previousItems);
      }
    }
  }, [isAuthenticated, wishlistItems]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
      isLoading,
    }),
    [
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
      isLoading,
    ]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

/**
 * Hook to access wishlist context
 * Must be used within a WishlistProvider
 */
export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
