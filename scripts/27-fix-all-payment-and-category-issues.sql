-- Fix all payment and category issues
-- This script addresses:
-- 1. Missing total_price column in order_items
-- 2. Foreign key constraint issues
-- 3. Missing subcategories table
-- 4. Category query issues

-- Add missing total_price column to order_items
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS total_price NUMERIC DEFAULT 0;

-- Update existing records to calculate total_price
UPDATE order_items 
SET total_price = price * quantity 
WHERE total_price IS NULL OR total_price = 0;

-- Drop existing foreign key constraint if it exists
ALTER TABLE order_items 
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Add new foreign key constraint to reference products_in_stock
ALTER TABLE order_items 
ADD CONSTRAINT order_items_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products_in_stock(id) ON DELETE CASCADE;

-- Create subcategories table if it doesn't exist
CREATE TABLE IF NOT EXISTS subcategories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES subcategories(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Insert subcategories for Vestimenta
INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Medias', 'medias', c.id, 2, 1, true
FROM categories c WHERE c.name = 'Vestimenta' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Boxers', 'boxers', c.id, 2, 2, true
FROM categories c WHERE c.name = 'Vestimenta' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Blusas y camisas', 'blusas-y-camisas', c.id, 2, 3, true
FROM categories c WHERE c.name = 'Vestimenta' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Vestidos y faldas', 'vestidos-y-faldas', c.id, 2, 4, true
FROM categories c WHERE c.name = 'Vestimenta' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Shorts y monos', 'shorts-y-monos', c.id, 2, 5, true
FROM categories c WHERE c.name = 'Vestimenta' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Jeans', 'jeans', c.id, 2, 6, true
FROM categories c WHERE c.name = 'Vestimenta' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Pantalones', 'pantalones', c.id, 2, 7, true
FROM categories c WHERE c.name = 'Vestimenta' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Remeras y musculosas', 'remeras-y-musculosas', c.id, 2, 8, true
FROM categories c WHERE c.name = 'Vestimenta' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Polos', 'polos', c.id, 2, 9, true
FROM categories c WHERE c.name = 'Vestimenta' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Bermudas', 'bermudas', c.id, 2, 10, true
FROM categories c WHERE c.name = 'Vestimenta' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Mayas', 'mayas', c.id, 2, 11, true
FROM categories c WHERE c.name = 'Vestimenta' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Blazers y chaquetas', 'blazers-y-chaquetas', c.id, 2, 12, true
FROM categories c WHERE c.name = 'Vestimenta' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Sacos', 'sacos', c.id, 2, 13, true
FROM categories c WHERE c.name = 'Vestimenta' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Buzos y canguros', 'buzos-y-canguros', c.id, 2, 14, true
FROM categories c WHERE c.name = 'Vestimenta' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Camperas y abrigos', 'camperas-y-abrigos', c.id, 2, 15, true
FROM categories c WHERE c.name = 'Vestimenta' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Chalecos', 'chalecos', c.id, 2, 16, true
FROM categories c WHERE c.name = 'Vestimenta' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

-- Insert subcategories for Accesorios
INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Collares', 'collares', c.id, 2, 1, true
FROM categories c WHERE c.name = 'Accesorios' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Pañuelos', 'panuelos', c.id, 2, 2, true
FROM categories c WHERE c.name = 'Accesorios' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Carvanas', 'carvanas', c.id, 2, 3, true
FROM categories c WHERE c.name = 'Accesorios' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Billeteras', 'billeteras', c.id, 2, 4, true
FROM categories c WHERE c.name = 'Accesorios' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Riñoneras', 'rinoneras', c.id, 2, 5, true
FROM categories c WHERE c.name = 'Accesorios' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, category_id, level, sort_order, is_active) 
SELECT 'Mochilas', 'mochilas', c.id, 2, 6, true
FROM categories c WHERE c.name = 'Accesorios' AND c.level = 1
ON CONFLICT (slug) DO NOTHING;

-- Insert sub-subcategories for Pantalones
INSERT INTO subcategories (name, slug, parent_id, level, sort_order, is_active) 
SELECT 'Deportivos', 'pantalones-deportivos', s.id, 3, 1, true
FROM subcategories s WHERE s.name = 'Pantalones' AND s.level = 2
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, parent_id, level, sort_order, is_active) 
SELECT 'Cargos', 'pantalones-cargos', s.id, 3, 2, true
FROM subcategories s WHERE s.name = 'Pantalones' AND s.level = 2
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subcategories (name, slug, parent_id, level, sort_order, is_active) 
SELECT 'Gabardina', 'pantalones-gabardina', s.id, 3, 3, true
FROM subcategories s WHERE s.name = 'Pantalones' AND s.level = 2
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS on subcategories
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for subcategories
CREATE POLICY "Allow all operations on subcategories" ON subcategories
FOR ALL USING (true) WITH CHECK (true);

-- Update categories table to add type column if it doesn't exist
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'category';

-- Update existing categories to have proper type
UPDATE categories SET type = 'category' WHERE type IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_parent_id ON subcategories(parent_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Update sync status
INSERT INTO sync_status (sync_type, status, total_records, last_sync_at, created_at, updated_at)
VALUES ('database_fix', 'completed', 0, NOW(), NOW(), NOW())
ON CONFLICT (sync_type) DO UPDATE SET
    status = 'completed',
    last_sync_at = NOW(),
    updated_at = NOW();

COMMIT;
