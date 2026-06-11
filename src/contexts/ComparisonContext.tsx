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

const COMPARISON_STORAGE_KEY = "nuage-comparison";
const MAX_COMPARISON_ITEMS = 3;

interface ComparisonContextValue {
  comparisonItems: string[]; // Array of product IDs
  addToComparison: (productId: string) => boolean;
  removeFromComparison: (productId: string) => void;
  isInComparison: (productId: string) => boolean;
  clearComparison: () => void;
  canAddMore: boolean;
}

const ComparisonContext = createContext<ComparisonContextValue | undefined>(undefined);

interface ComparisonProviderProps {
  children: ReactNode;
}

/**
 * Load comparison from sessionStorage (temporary - clears on session end)
 */
function loadComparisonFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = sessionStorage.getItem(COMPARISON_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, MAX_COMPARISON_ITEMS); // Ensure max 3
      }
    }
  } catch (error) {
    console.error("Failed to load comparison from sessionStorage:", error);
  }
  return [];
}

/**
 * Save comparison to sessionStorage
 */
function saveComparisonToStorage(items: string[]): void {
  try {
    sessionStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save comparison to sessionStorage:", error);
  }
}

/**
 * ComparisonProvider component that wraps the app and provides comparison state
 * Persists comparison to sessionStorage (temporary)
 */
export function ComparisonProvider({ children }: ComparisonProviderProps) {
  const [comparisonItems, setComparisonItems] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from sessionStorage after hydration
  useEffect(() => {
    const stored = loadComparisonFromStorage();
    // Reads sessionStorage on mount; deferred to effect to avoid SSR hydration mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setComparisonItems(stored);
    setIsHydrated(true);
  }, []);

  // Save to sessionStorage whenever items change (after hydration)
  useEffect(() => {
    if (isHydrated) {
      saveComparisonToStorage(comparisonItems);
    }
  }, [comparisonItems, isHydrated]);

  const addToComparison = useCallback((productId: string): boolean => {
    if (comparisonItems.includes(productId)) {
      return true; // Already in comparison
    }

    if (comparisonItems.length >= MAX_COMPARISON_ITEMS) {
      return false; // Max limit reached
    }

    setComparisonItems((current) => [...current, productId]);
    return true;
  }, [comparisonItems]);

  const removeFromComparison = useCallback((productId: string) => {
    setComparisonItems((current) => current.filter((id) => id !== productId));
  }, []);

  const isInComparison = useCallback(
    (productId: string) => {
      return comparisonItems.includes(productId);
    },
    [comparisonItems]
  );

  const clearComparison = useCallback(() => {
    setComparisonItems([]);
  }, []);

  const value = useMemo<ComparisonContextValue>(
    () => ({
      comparisonItems,
      addToComparison,
      removeFromComparison,
      isInComparison,
      clearComparison,
      canAddMore: comparisonItems.length < MAX_COMPARISON_ITEMS,
    }),
    [
      comparisonItems,
      addToComparison,
      removeFromComparison,
      isInComparison,
      clearComparison,
    ]
  );

  return <ComparisonContext.Provider value={value}>{children}</ComparisonContext.Provider>;
}

/**
 * Hook to access comparison context
 * Must be used within a ComparisonProvider
 */
export function useComparison(): ComparisonContextValue {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
}
