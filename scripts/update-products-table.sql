-- Adding new columns for simplified product management
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS season VARCHAR(20),
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(50);

-- Removing SEO and tags columns as requested
ALTER TABLE products 
DROP COLUMN IF EXISTS seo_title,
DROP COLUMN IF EXISTS seo_description,
DROP COLUMN IF EXISTS tags;

-- Adding check constraints for data validation
ALTER TABLE products 
ADD CONSTRAINT check_gender CHECK (gender IN ('hombre', 'mujer')),
ADD CONSTRAINT check_season CHECK (season IN ('verano', 'invierno', 'todo_el_año'));

-- Creating categories reference data
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, name)
);

-- Inserting default categories and subcategories
INSERT INTO product_categories (name) VALUES 
('vestimenta'),
('articulos')
ON CONFLICT (name) DO NOTHING;

-- Getting category IDs for subcategories
DO $$
DECLARE
    vestimenta_id UUID;
    articulos_id UUID;
BEGIN
    SELECT id INTO vestimenta_id FROM product_categories WHERE name = 'vestimenta';
    SELECT id INTO articulos_id FROM product_categories WHERE name = 'articulos';
    
    -- Vestimenta subcategories
    INSERT INTO product_subcategories (category_id, name) VALUES 
    (vestimenta_id, 'remeras'),
    (vestimenta_id, 'pantalones'),
    (vestimenta_id, 'buzos'),
    (vestimenta_id, 'camperas'),
    (vestimenta_id, 'vestidos'),
    (vestimenta_id, 'faldas')
    ON CONFLICT (category_id, name) DO NOTHING;
    
    -- Articulos subcategories
    INSERT INTO product_subcategories (category_id, name) VALUES 
    (articulos_id, 'accesorios'),
    (articulos_id, 'calzado'),
    (articulos_id, 'bolsos'),
    (articulos_id, 'joyeria')
    ON CONFLICT (category_id, name) DO NOTHING;
END $$;
