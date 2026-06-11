-- Wishlist table for saving favorite products
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Indexes for performance
CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_wishlist_product ON wishlist(product_id);
CREATE INDEX idx_wishlist_user_added ON wishlist(user_id, added_at DESC);

-- RLS policies: users can only see and modify their own wishlist items
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist items" ON wishlist
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can add to own wishlist" ON wishlist
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove from own wishlist" ON wishlist
  FOR DELETE USING (user_id = auth.uid());

-- Admins can view all wishlists (for analytics)
CREATE POLICY "Admins can view all wishlists" ON wishlist
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );
