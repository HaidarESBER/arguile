-- =============================================================================
-- Customer Profiles Extension
-- =============================================================================
-- Extends profiles table with phone, saved addresses, and communication preferences
-- Run this in Supabase SQL Editor after initial schema setup
-- =============================================================================

-- Add phone column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add saved_addresses column (JSONB array)
-- Structure: [{id: uuid, label: string, firstName: string, lastName: string,
--              address: string, address2?: string, city: string, postalCode: string,
--              country: string, phone: string, isDefault: boolean}]
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS saved_addresses JSONB DEFAULT '[]'::jsonb;

-- Add preferences column (JSONB object)
-- Structure: {email_marketing: boolean, email_order_updates: boolean, email_promotions: boolean, track_browsing: boolean}
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"email_marketing": false, "email_order_updates": true, "email_promotions": false, "track_browsing": true}'::jsonb;

-- Update existing profiles to include track_browsing default (for existing users)
UPDATE profiles
SET preferences = jsonb_set(preferences, '{track_browsing}', 'true'::jsonb)
WHERE preferences->>'track_browsing' IS NULL;

-- Add index on saved_addresses for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_saved_addresses ON profiles USING gin (saved_addresses);

-- Add index on preferences for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_preferences ON profiles USING gin (preferences);
