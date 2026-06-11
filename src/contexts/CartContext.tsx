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
import { Product } from "@/types/product";
import { CartItem } from "@/types/cart";
import { trackAddToCart, trackRemoveFromCart } from "@/lib/analytics";

const CART_STORAGE_KEY = "nuage-cart";

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  /** False until the cart has been loaded from localStorage. Consumers that
   * redirect on an empty cart MUST wait for this, or they bounce users away
   * during the first render (e.g. refreshing the page mid-checkout). */
  isHydrated: boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

/**
 * Load cart from localStorage
 */
function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
  }
  return [];
}

/**
 * Save cart to localStorage
 */
function saveCartToStorage(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
}

/**
 * CartProvider component that wraps the app and provides cart state
 * Persists cart to localStorage with hydration-safe initialization
 */
export function CartProvider({ children }: CartProviderProps) {
  // Start with empty array to avoid hydration mismatch
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage after hydration
  useEffect(() => {
    const stored = loadCartFromStorage();
    // Reads localStorage on mount; deferred to effect to avoid SSR hydration mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(stored);
    setIsHydrated(true);
  }, []);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) {
        setItems(loadCartFromStorage());
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Save to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (isHydrated) {
      saveCartToStorage(items);
    }
  }, [items, isHydrated]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingIndex >= 0) {
        // Update quantity of existing item
        const updated = [...currentItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      // Add new item
      return [...currentItems, { product, quantity }];
    });

    // Track add to cart event
    trackAddToCart(product, quantity);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((currentItems) => {
      // Find the item being removed for tracking
      const itemToRemove = currentItems.find((item) => item.product.id === productId);

      if (itemToRemove) {
        // Track remove from cart event
        trackRemoveFromCart(
          itemToRemove.product.id,
          itemToRemove.product.name,
          itemToRemove.quantity
        );
      }

      return currentItems.filter((item) => item.product.id !== productId);
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      setItems((currentItems) =>
        currentItems.filter((item) => item.product.id !== productId)
      );
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isHydrated,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, isHydrated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Hook to access cart context
 * Must be used within a CartProvider
 */
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
