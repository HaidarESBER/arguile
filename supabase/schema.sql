-- =============================================================================
-- Nuage E-Commerce Database Schema
-- =============================================================================
-- Run this in Supabase SQL Editor to create all tables, RLS policies,
-- triggers, and seed data.
-- =============================================================================

-- =============================================================================
-- 1. TABLES
-- =============================================================================

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  price INTEGER NOT NULL,
  compare_at_price INTEGER,
  images TEXT[] NOT NULL DEFAULT '{}',
  category TEXT NOT NULL CHECK (category IN ('chicha', 'bol', 'tuyau', 'charbon', 'accessoire')),
  in_stock BOOLEAN NOT NULL DEFAULT true,
  stock_level INTEGER DEFAULT 10,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_email TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  shipping INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending_payment', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB NOT NULL,
  notes TEXT,
  discount_code TEXT,
  discount_amount INTEGER DEFAULT 0,
  tracking_number TEXT,
  tracking_url TEXT,
  estimated_delivery TEXT,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- =============================================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Products: public read, admin write
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Products are editable by admins" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Orders: admin read all, users read own
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    user_email = (SELECT email FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Order items: same access as parent order
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (
      orders.user_email = (SELECT email FROM profiles WHERE id = auth.uid())
      OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
    ))
  );

CREATE POLICY "Anyone can create order items" ON order_items
  FOR INSERT WITH CHECK (true);

-- Profiles: users read own, admins read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- =============================================================================
-- 3. TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (NEW.id, NEW.email, '', '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 4. SEED DATA - Products
-- =============================================================================

INSERT INTO products (slug, name, description, short_description, price, images, category, in_stock, featured) VALUES
(
  'chicha-crystal-premium',
  'Chicha Crystal Premium',
  'Une chicha d''exception au design cristallin. Le verre soufflé à la main offre une qualité de fumée incomparable et une esthétique raffinée qui sublimera votre intérieur. Base stable et large pour une utilisation en toute sécurité.',
  'Chicha en verre soufflé main, design cristallin élégant',
  12999,
  ARRAY['https://placehold.co/600x600/2D2D2D/F7F5F3?text=Chicha+Crystal', 'https://placehold.co/600x600/C4A98F/2D2D2D?text=Chicha+Crystal+2'],
  'chicha',
  true,
  true
),
(
  'chicha-classic-noir',
  'Chicha Classic Noir',
  'Un classique revisité avec une finition noir mat. Idéale pour les amateurs de chichas traditionnelles recherchant une touche de modernité. Construction robuste et entretien facile.',
  'Chicha traditionnelle finition noir mat',
  8999,
  ARRAY['https://placehold.co/600x600/1A1A1A/F7F5F3?text=Classic+Noir'],
  'chicha',
  true,
  true
),
(
  'bol-silicone-pro',
  'Bol en Silicone Pro',
  'Bol en silicone de qualité alimentaire avec insert en céramique. Résistant à la chaleur extrême et incassable. Parfait pour une distribution homogène de la chaleur.',
  'Bol silicone avec insert céramique, incassable',
  2499,
  ARRAY['https://placehold.co/600x600/C4A98F/2D2D2D?text=Bol+Silicone'],
  'bol',
  true,
  false
),
(
  'bol-ceramique-artisanal',
  'Bol Céramique Artisanal',
  'Bol en céramique fait main par des artisans. Chaque pièce est unique avec des variations subtiles de couleur. Excellente rétention de chaleur pour des sessions prolongées.',
  'Bol céramique fait main, pièce unique',
  3499,
  ARRAY['https://placehold.co/600x600/9B9590/F7F5F3?text=Bol+Ceramique'],
  'bol',
  true,
  true
),
(
  'tuyau-silicone-premium',
  'Tuyau Silicone Premium',
  'Tuyau en silicone alimentaire ultra-flexible de 1,8m. Lavable au lave-vaisselle. Embout en acier inoxydable avec poignée ergonomique.',
  'Tuyau silicone 1,8m, embout inox, lavable',
  1999,
  ARRAY['https://placehold.co/600x600/2D2D2D/C4A98F?text=Tuyau+Premium'],
  'tuyau',
  true,
  false
),
(
  'charbon-naturel-coco',
  'Charbon Naturel Coco',
  'Charbon naturel à base de coque de noix de coco. Durée de combustion de 60+ minutes. Sans odeur et sans goût. Boîte de 72 pièces (1kg).',
  'Charbon coco naturel, 72 pièces, 60+ min',
  1499,
  ARRAY['https://placehold.co/600x600/4A4A4A/F7F5F3?text=Charbon+Coco'],
  'charbon',
  true,
  true
),
(
  'pince-charbon-pro',
  'Pince à Charbon Pro',
  'Pince en acier inoxydable avec manche anti-chaleur. Design ergonomique pour une manipulation précise des charbons. Longueur idéale de 25cm.',
  'Pince inox avec manche anti-chaleur, 25cm',
  999,
  ARRAY['https://placehold.co/600x600/9B9590/2D2D2D?text=Pince+Pro'],
  'accessoire',
  true,
  false
),
(
  'kit-nettoyage-complet',
  'Kit Nettoyage Complet',
  'Kit complet pour l''entretien de votre chicha. Inclut 3 brosses de tailles différentes, un goupillon pour tuyau, et une éponge spéciale pour le verre.',
  'Kit 5 pièces: brosses, goupillon, éponge',
  1899,
  ARRAY['https://placehold.co/600x600/E8E4DF/2D2D2D?text=Kit+Nettoyage'],
  'accessoire',
  false,
  false
);

-- Update compare_at_price for products that have it
UPDATE products SET compare_at_price = 10999 WHERE slug = 'chicha-classic-noir';
UPDATE products SET compare_at_price = 1299 WHERE slug = 'pince-charbon-pro';
