-- Actualizar estructura completa de categorías y géneros
-- Eliminar categorías existentes y crear la nueva estructura

-- Limpiar tablas existentes
DELETE FROM categories;
DELETE FROM subcategories WHERE subcategories.id IS NOT NULL;

-- Crear tabla de subcategorías si no existe
CREATE TABLE IF NOT EXISTS subcategories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    parent_subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar géneros actualizados
INSERT INTO categories (name, slug, type) VALUES 
('Hombre', 'hombre', 'gender'),
('Mujer', 'mujer', 'gender'),
('Unisex', 'unisex', 'gender');

-- Insertar categorías principales
INSERT INTO categories (name, slug, type) VALUES 
('Vestimenta', 'vestimenta', 'category'),
('Accesorios', 'accesorios', 'category'),
('Calzado', 'calzado', 'category');

-- Insertar subcategorías de Vestimenta
INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Medias', 'medias', id FROM categories WHERE slug = 'vestimenta';

INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Boxers', 'boxers', id FROM categories WHERE slug = 'vestimenta';

INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Blusas y camisas', 'blusas-camisas', id FROM categories WHERE slug = 'vestimenta';

INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Vestidos y faldas', 'vestidos-faldas', id FROM categories WHERE slug = 'vestimenta';

INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Shorts y monos', 'shorts-monos', id FROM categories WHERE slug = 'vestimenta';

INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Jeans', 'jeans', id FROM categories WHERE slug = 'vestimenta';

INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Pantalones', 'pantalones', id FROM categories WHERE slug = 'vestimenta';

INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Remeras y musculosas', 'remeras-musculosas', id FROM categories WHERE slug = 'vestimenta';

INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Polos', 'polos', id FROM categories WHERE slug = 'vestimenta';

INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Bermudas', 'bermudas', id FROM categories WHERE slug = 'vestimenta';

INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Mayas', 'mayas', id FROM categories WHERE slug = 'vestimenta';

INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Blazers y chaquetas', 'blazers-chaquetas', id FROM categories WHERE slug = 'vestimenta';

INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Sacos', 'sacos', id FROM categories WHERE slug = 'vestimenta';

INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Buzos y canguros', 'buzos-canguros', id FROM categories WHERE slug = 'vestimenta';

INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Camperas y abrigos', 'camperas-abrigos', id FROM categories WHERE slug = 'vestimenta';

-- Insertar sub-subcategorías de Pantalones
INSERT INTO subcategories (name, slug, category_id, parent_subcategory_id) 
SELECT 'Deportivos', 'pantalones-deportivos', c.id, s.id 
FROM categories c, subcategories s 
WHERE c.slug = 'vestimenta' AND s.slug = 'pantalones';

INSERT INTO subcategories (name, slug, category_id, parent_subcategory_id) 
SELECT 'Cargos', 'pantalones-cargos', c.id, s.id 
FROM categories c, subcategories s 
WHERE c.slug = 'vestimenta' AND s.slug = 'pantalones';

INSERT INTO subcategories (name, slug, category_id, parent_subcategory_id) 
SELECT 'Gabardina', 'pantalones-gabardina', c.id, s.id 
FROM categories c, subcategories s 
WHERE c.slug = 'vestimenta' AND s.slug = 'pantalones';

-- Insertar subcategorías de Accesorios
INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Collares', 'collares', id FROM categories WHERE slug = 'accesorios';

INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Pañuelos', 'panuelos', id FROM categories WHERE slug = 'accesorios';

INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Carvanas', 'carvanas', id FROM categories WHERE slug = 'accesorios';

INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Billeteras', 'billeteras', id FROM categories WHERE slug = 'accesorios';

INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Riñoneras', 'rinoneras', id FROM categories WHERE slug = 'accesorios';

INSERT INTO subcategories (name, slug, category_id) 
SELECT 'Mochilas', 'mochilas', id FROM categories WHERE slug = 'accesorios';

-- Agregar campos faltantes a products_in_stock si no existen
ALTER TABLE products_in_stock 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20) DEFAULT 'unisex',
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100),
ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS color VARCHAR(50),
ADD COLUMN IF NOT EXISTS size VARCHAR(20);

-- Crear políticas RLS permisivas para todas las tablas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Políticas para categories
DROP POLICY IF EXISTS "Allow all operations on categories" ON categories;
CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Políticas para subcategories
DROP POLICY IF EXISTS "Allow all operations on subcategories" ON subcategories;
CREATE POLICY "Allow all operations on subcategories" ON subcategories FOR ALL USING (true) WITH CHECK (true);

-- Políticas para products_in_stock
DROP POLICY IF EXISTS "Allow all operations on products_in_stock" ON products_in_stock;
CREATE POLICY "Allow all operations on products_in_stock" ON products_in_stock FOR ALL USING (true) WITH CHECK (true);

-- Políticas para product_images
DROP POLICY IF EXISTS "Allow all operations on product_images" ON product_images;
CREATE POLICY "Allow all operations on product_images" ON product_images FOR ALL USING (true) WITH CHECK (true);

-- Políticas para orders
DROP POLICY IF EXISTS "Allow all operations on orders" ON orders;
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true) WITH CHECK (true);

-- Políticas para order_items
DROP POLICY IF EXISTS "Allow all operations on order_items" ON order_items;
CREATE POLICY "Allow all operations on order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- Políticas para banners
DROP POLICY IF EXISTS "Allow all operations on banners" ON banners;
CREATE POLICY "Allow all operations on banners" ON banners FOR ALL USING (true) WITH CHECK (true);

-- Políticas para brands
DROP POLICY IF EXISTS "Allow all operations on brands" ON brands;
CREATE POLICY "Allow all operations on brands" ON brands FOR ALL USING (true) WITH CHECK (true);

-- Políticas para popups
DROP POLICY IF EXISTS "Allow all operations on popups" ON popups;
CREATE POLICY "Allow all operations on popups" ON popups FOR ALL USING (true) WITH CHECK (true);

-- Crear usuario por defecto si no existe
INSERT INTO users (id, email, full_name, created_at) 
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@oxstore.com', 'Administrador', NOW())
ON CONFLICT (id) DO NOTHING;

COMMIT;
