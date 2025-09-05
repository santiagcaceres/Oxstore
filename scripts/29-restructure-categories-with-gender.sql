-- Reestructurar categorías con género específico
-- Eliminar categorías existentes y crear nuevas con género

-- Limpiar categorías existentes
DELETE FROM categories;
DELETE FROM subcategories;

-- Eliminando referencia a columna description que no existe en categories
-- Insertar categorías principales
INSERT INTO categories (name, slug, is_active) VALUES
('vestimenta', 'vestimenta', true),
('accesorios', 'accesorios', true),
('calzado', 'calzado', true);

-- Agregando columna gender a subcategories si no existe
ALTER TABLE subcategories 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20) DEFAULT 'unisex';

-- Insertar subcategorías de HOMBRE
INSERT INTO subcategories (name, slug, category_id, gender, is_active) VALUES
-- Vestimenta Hombre
('Bermudas', 'bermudas', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', true),
('Chaquetas', 'chaquetas', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', true),
('Camisas', 'camisas', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', true),
('Boxers', 'boxers', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', true),
('Buzos y canguros', 'buzos-canguros', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', true),
('Camperas y abrigos', 'camperas-abrigos', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', true),
('Chalecos', 'chalecos', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', true),
('Jeans', 'jeans', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', true),
('Medias', 'medias', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', true),
('Pantalones', 'pantalones', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', true),
('Polos', 'polos', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', true),
('Remeras y musculosas', 'remeras-musculosas', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', true),
('Shorts', 'shorts', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', true);

-- Insertar subcategorías de MUJER
INSERT INTO subcategories (name, slug, category_id, gender, is_active) VALUES
-- Vestimenta Mujer
('Bermudas', 'bermudas-mujer', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', true),
('Blazers y chaquetas', 'blazers-chaquetas', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', true),
('Blusas y camisas', 'blusas-camisas', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', true),
('Buzos y canguros', 'buzos-canguros-mujer', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', true),
('Camperas y abrigos', 'camperas-abrigos-mujer', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', true),
('Chalecos', 'chalecos-mujer', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', true),
('Jeans', 'jeans-mujer', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', true),
('Mayas', 'mayas', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', true),
('Medias', 'medias-mujer', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', true),
('Pantalones', 'pantalones-mujer', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', true),
('Polos', 'polos-mujer', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', true),
('Remeras y musculosas', 'remeras-musculosas-mujer', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', true),
('Sacos', 'sacos', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', true),
('Shorts y monos', 'shorts-monos', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', true),
('Vestidos y faldas', 'vestidos-faldas', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', true);

-- Insertar subcategorías UNISEX para accesorios
INSERT INTO subcategories (name, slug, category_id, gender, is_active) VALUES
('Collares', 'collares', (SELECT id FROM categories WHERE slug = 'accesorios'), 'unisex', true),
('Pañuelos', 'panuelos', (SELECT id FROM categories WHERE slug = 'accesorios'), 'unisex', true),
('Carvanas', 'carvanas', (SELECT id FROM categories WHERE slug = 'accesorios'), 'unisex', true),
('Billeteras', 'billeteras', (SELECT id FROM categories WHERE slug = 'accesorios'), 'unisex', true),
('Riñoneras', 'rinoneras', (SELECT id FROM categories WHERE slug = 'accesorios'), 'unisex', true),
('Mochilas', 'mochilas', (SELECT id FROM categories WHERE slug = 'accesorios'), 'unisex', true);

-- Insertar subcategorías UNISEX para calzado
INSERT INTO subcategories (name, slug, category_id, gender, is_active) VALUES
('Zapatillas', 'zapatillas', (SELECT id FROM categories WHERE slug = 'calzado'), 'unisex', true),
('Zapatos', 'zapatos', (SELECT id FROM categories WHERE slug = 'calzado'), 'unisex', true),
('Botas', 'botas', (SELECT id FROM categories WHERE slug = 'calzado'), 'unisex', true),
('Sandalias', 'sandalias', (SELECT id FROM categories WHERE slug = 'calzado'), 'unisex', true);

-- Creando tabla para gestión de descuentos
CREATE TABLE IF NOT EXISTS discount_rules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('brand', 'category', 'subcategory')),
  target_id INTEGER NOT NULL,
  target_name VARCHAR(255) NOT NULL,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar columnas faltantes a products_in_stock si no existen
ALTER TABLE products_in_stock 
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(255),
ADD COLUMN IF NOT EXISTS color VARCHAR(100),
ADD COLUMN IF NOT EXISTS size VARCHAR(50);

-- Limpiar compare_price incorrectos que causan cocardas de descuento falsas
UPDATE products_in_stock 
SET sale_price = NULL, discount_percentage = NULL 
WHERE sale_price = price OR discount_percentage = 0;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_products_gender ON products_in_stock(gender);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products_in_stock(subcategory);
CREATE INDEX IF NOT EXISTS idx_products_color ON products_in_stock(color);
CREATE INDEX IF NOT EXISTS idx_products_size ON products_in_stock(size);
CREATE INDEX IF NOT EXISTS idx_subcategories_gender ON subcategories(gender);
CREATE INDEX IF NOT EXISTS idx_discount_rules_type_target ON discount_rules(type, target_id);
