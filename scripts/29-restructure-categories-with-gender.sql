-- Reestructurar categorías con género específico
-- Eliminar categorías existentes y crear nuevas con género

-- Limpiar categorías existentes
DELETE FROM categories;
DELETE FROM subcategories;

-- Insertar categorías principales
INSERT INTO categories (name, slug, description, is_active) VALUES
('vestimenta', 'vestimenta', 'Ropa y vestimenta', true),
('accesorios', 'accesorios', 'Accesorios y complementos', true),
('calzado', 'calzado', 'Zapatos y calzado', true);

-- Insertar subcategorías de HOMBRE
INSERT INTO subcategories (name, slug, category_id, gender, description, is_active) VALUES
-- Vestimenta Hombre
('Bermudas', 'bermudas', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', 'Bermudas para hombre', true),
('Chaquetas', 'chaquetas', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', 'Chaquetas para hombre', true),
('Camisas', 'camisas', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', 'Camisas para hombre', true),
('Boxers', 'boxers', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', 'Boxers para hombre', true),
('Buzos y canguros', 'buzos-canguros', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', 'Buzos y canguros para hombre', true),
('Camperas y abrigos', 'camperas-abrigos', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', 'Camperas y abrigos para hombre', true),
('Chalecos', 'chalecos', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', 'Chalecos para hombre', true),
('Jeans', 'jeans', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', 'Jeans para hombre', true),
('Medias', 'medias', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', 'Medias para hombre', true),
('Pantalones', 'pantalones', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', 'Pantalones para hombre', true),
('Polos', 'polos', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', 'Polos para hombre', true),
('Remeras y musculosas', 'remeras-musculosas', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', 'Remeras y musculosas para hombre', true),
('Shorts', 'shorts', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'hombre', 'Shorts para hombre', true);

-- Insertar subcategorías de MUJER
INSERT INTO subcategories (name, slug, category_id, gender, description, is_active) VALUES
-- Vestimenta Mujer
('Bermudas', 'bermudas-mujer', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', 'Bermudas para mujer', true),
('Blazers y chaquetas', 'blazers-chaquetas', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', 'Blazers y chaquetas para mujer', true),
('Blusas y camisas', 'blusas-camisas', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', 'Blusas y camisas para mujer', true),
('Buzos y canguros', 'buzos-canguros-mujer', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', 'Buzos y canguros para mujer', true),
('Camperas y abrigos', 'camperas-abrigos-mujer', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', 'Camperas y abrigos para mujer', true),
('Chalecos', 'chalecos-mujer', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', 'Chalecos para mujer', true),
('Jeans', 'jeans-mujer', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', 'Jeans para mujer', true),
('Mayas', 'mayas', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', 'Mayas para mujer', true),
('Medias', 'medias-mujer', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', 'Medias para mujer', true),
('Pantalones', 'pantalones-mujer', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', 'Pantalones para mujer', true),
('Polos', 'polos-mujer', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', 'Polos para mujer', true),
('Remeras y musculosas', 'remeras-musculosas-mujer', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', 'Remeras y musculosas para mujer', true),
('Sacos', 'sacos', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', 'Sacos para mujer', true),
('Shorts y monos', 'shorts-monos', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', 'Shorts y monos para mujer', true),
('Vestidos y faldas', 'vestidos-faldas', (SELECT id FROM categories WHERE slug = 'vestimenta'), 'mujer', 'Vestidos y faldas para mujer', true);

-- Insertar subcategorías UNISEX para accesorios
INSERT INTO subcategories (name, slug, category_id, gender, description, is_active) VALUES
('Collares', 'collares', (SELECT id FROM categories WHERE slug = 'accesorios'), 'unisex', 'Collares', true),
('Pañuelos', 'panuelos', (SELECT id FROM categories WHERE slug = 'accesorios'), 'unisex', 'Pañuelos', true),
('Carvanas', 'carvanas', (SELECT id FROM categories WHERE slug = 'accesorios'), 'unisex', 'Carvanas', true),
('Billeteras', 'billeteras', (SELECT id FROM categories WHERE slug = 'accesorios'), 'unisex', 'Billeteras', true),
('Riñoneras', 'rinoneras', (SELECT id FROM categories WHERE slug = 'accesorios'), 'unisex', 'Riñoneras', true),
('Mochilas', 'mochilas', (SELECT id FROM categories WHERE slug = 'accesorios'), 'unisex', 'Mochilas', true);

-- Insertar subcategorías UNISEX para calzado
INSERT INTO subcategories (name, slug, category_id, gender, description, is_active) VALUES
('Zapatillas', 'zapatillas', (SELECT id FROM categories WHERE slug = 'calzado'), 'unisex', 'Zapatillas', true),
('Zapatos', 'zapatos', (SELECT id FROM categories WHERE slug = 'calzado'), 'unisex', 'Zapatos', true),
('Botas', 'botas', (SELECT id FROM categories WHERE slug = 'calzado'), 'unisex', 'Botas', true),
('Sandalias', 'sandalias', (SELECT id FROM categories WHERE slug = 'calzado'), 'unisex', 'Sandalias', true);

-- Agregar columnas faltantes a products_in_stock si no existen
ALTER TABLE products_in_stock 
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(255),
ADD COLUMN IF NOT EXISTS color VARCHAR(100),
ADD COLUMN IF NOT EXISTS size VARCHAR(50);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_products_gender ON products_in_stock(gender);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products_in_stock(subcategory);
CREATE INDEX IF NOT EXISTS idx_products_color ON products_in_stock(color);
CREATE INDEX IF NOT EXISTS idx_products_size ON products_in_stock(size);
CREATE INDEX IF NOT EXISTS idx_subcategories_gender ON subcategories(gender);
