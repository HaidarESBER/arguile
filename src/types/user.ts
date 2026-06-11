/**
 * User type definitions for authentication
 */

/**
 * Saved address structure
 */
export interface SavedAddress {
  id: string;
  label: string; // e.g., "Domicile", "Bureau", "Autre"
  firstName: string;
  lastName: string;
  address: string;
  address2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

/**
 * Email communication preferences
 */
export interface EmailPreferences {
  email_marketing: boolean;
  email_order_updates: boolean;
  email_promotions: boolean;
  track_browsing: boolean; // Allow browse history tracking for recommendations
}

/**
 * Profile update data (subset of fields user can edit)
 */
export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  preferences?: EmailPreferences;
}

export interface User {
  id: string;
  email: string;
  /** Hashed password (never send to client) */
  passwordHash: string;
  firstName: string;
  lastName: string;
  /** Admin role flag */
  isAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * User data for registration
 */
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * User data for login
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * User session (safe to send to client)
 */
export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  /** Admin role flag */
  isAdmin?: boolean;
  phone?: string;
  savedAddresses?: SavedAddress[];
  preferences?: EmailPreferences;
}

/**
 * Generate a cryptographically secure UUID v4
 */
export function generateUserId(): string {
  // Use crypto.randomUUID() for secure UUID generation
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older environments (should not happen in modern Node.js/browsers)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
