-- Add Stripe columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Update status CHECK constraint to include pending_payment
-- First drop the existing constraint, then re-add with new values
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending_payment', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));
