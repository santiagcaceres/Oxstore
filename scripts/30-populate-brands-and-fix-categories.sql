-- Populate brands table with common brands
INSERT INTO brands (name, slug, created_at, updated_at) VALUES
('Nike', 'nike', NOW(), NOW()),
('Adidas', 'adidas', NOW(), NOW()),
('Puma', 'puma', NOW(), NOW()),
('Reebok', 'reebok', NOW(), NOW()),
('Converse', 'converse', NOW(), NOW()),
('Vans', 'vans', NOW(), NOW()),
('New Balance', 'new-balance', NOW(), NOW()),
('Under Armour', 'under-armour', NOW(), NOW()),
('Fila', 'fila', NOW(), NOW()),
('Kappa', 'kappa', NOW(), NOW()),
('Topper', 'topper', NOW(), NOW()),
('Umbro', 'umbro', NOW(), NOW()),
('Levi''s', 'levis', NOW(), NOW()),
('Wrangler', 'wrangler', NOW(), NOW()),
('Lee', 'lee', NOW(), NOW()),
('Diesel', 'diesel', NOW(), NOW()),
('Calvin Klein', 'calvin-klein', NOW(), NOW()),
('Tommy Hilfiger', 'tommy-hilfiger', NOW(), NOW()),
('Lacoste', 'lacoste', NOW(), NOW()),
('Polo Ralph Lauren', 'polo-ralph-lauren', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Ensure categories and subcategories are properly linked
-- First, let's make sure we have the main categories
INSERT INTO categories (name, slug, type, level, is_active, sort_order, created_at, updated_at) VALUES
('vestimenta', 'vestimenta', 'category', 1, true, 1, NOW(), NOW()),
('calzado', 'calzado', 'category', 1, true, 2, NOW(), NOW()),
('accesorios', 'accesorios', 'category', 1, true, 3, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  level = EXCLUDED.level,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Update subcategories to reference the correct category_id
-- Get category IDs
DO $$
DECLARE
    vestimenta_id INTEGER;
    calzado_id INTEGER;
    accesorios_id INTEGER;
BEGIN
    -- Get category IDs
    SELECT id INTO vestimenta_id FROM categories WHERE slug = 'vestimenta' AND level = 1;
    SELECT id INTO calzado_id FROM categories WHERE slug = 'calzado' AND level = 1;
    SELECT id INTO accesorios_id FROM categories WHERE slug = 'accesorios' AND level = 1;

    -- Update subcategories to reference correct category_id
    UPDATE subcategories SET category_id = vestimenta_id WHERE name IN (
        'Bermudas', 'Blazers y chaquetas', 'Blusas y camisas', 'Buzos y canguros', 
        'Camperas y abrigos', 'Chalecos', 'Jeans', 'Mayas', 'Medias', 'Pantalones', 
        'Polos', 'Remeras y musculosas', 'Sacos', 'Shorts y monos', 'Vestidos y faldas',
        'Boxers', 'Camisas', 'Chaquetas', 'Shorts'
    );

    UPDATE subcategories SET category_id = calzado_id WHERE name IN (
        'Zapatillas', 'Zapatos', 'Botas', 'Sandalias', 'Ojotas'
    );

    UPDATE subcategories SET category_id = accesorios_id WHERE name IN (
        'Gorros', 'Sombreros', 'Cinturones', 'Carteras', 'Mochilas', 'Billeteras', 
        'Relojes', 'Anteojos', 'Joyas', 'Bufandas'
    );
END $$;

-- Add some sample data to products_in_stock brands if they don't exist
UPDATE products_in_stock 
SET brand = 'Nike' 
WHERE brand IS NULL OR brand = '' 
AND id % 5 = 0;

UPDATE products_in_stock 
SET brand = 'Adidas' 
WHERE brand IS NULL OR brand = '' 
AND id % 5 = 1;

UPDATE products_in_stock 
SET brand = 'Puma' 
WHERE brand IS NULL OR brand = '' 
AND id % 5 = 2;

UPDATE products_in_stock 
SET brand = 'Reebok' 
WHERE brand IS NULL OR brand = '' 
AND id % 5 = 3;

UPDATE products_in_stock 
SET brand = 'Converse' 
WHERE brand IS NULL OR brand = '' 
AND id % 5 = 4;
