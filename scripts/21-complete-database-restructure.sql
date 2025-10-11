-- =====================================================
-- REESTRUCTURACIÓN COMPLETA DE LA BASE DE DATOS
-- =====================================================

-- Deshabilitar RLS temporalmente para hacer cambios
ALTER TABLE IF EXISTS categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products_in_stock DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 1. REESTRUCTURAR CATEGORÍAS COMPLETAMENTE
-- =====================================================

-- Eliminar tabla de categorías existente y recrear
DROP TABLE IF EXISTS categories CASCADE;

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar categorías principales
INSERT INTO categories (name, slug, level, sort_order) VALUES
('Vestimenta', 'vestimenta', 1, 1),
('Accesorios', 'accesorios', 1, 2),
('Calzado', 'calzado', 1, 3);

-- Obtener IDs de categorías principales
DO $$
DECLARE
    vestimenta_id INTEGER;
    accesorios_id INTEGER;
    calzado_id INTEGER;
    pantalones_id INTEGER;
BEGIN
    SELECT id INTO vestimenta_id FROM categories WHERE slug = 'vestimenta';
    SELECT id INTO accesorios_id FROM categories WHERE slug = 'accesorios';
    SELECT id INTO calzado_id FROM categories WHERE slug = 'calzado';

    -- Subcategorías de Vestimenta
    INSERT INTO categories (name, slug, parent_id, level, sort_order) VALUES
    ('Medias', 'medias', vestimenta_id, 2, 1),
    ('Boxers', 'boxers', vestimenta_id, 2, 2),
    ('Blusas y camisas', 'blusas-camisas', vestimenta_id, 2, 3),
    ('Vestidos y faldas', 'vestidos-faldas', vestimenta_id, 2, 4),
    ('Shorts y monos', 'shorts-monos', vestimenta_id, 2, 5),
    ('Jeans', 'jeans', vestimenta_id, 2, 6),
    ('Pantalones', 'pantalones', vestimenta_id, 2, 7),
    ('Remeras y musculosas', 'remeras-musculosas', vestimenta_id, 2, 8),
    ('Polos', 'polos', vestimenta_id, 2, 9),
    ('Bermudas', 'bermudas', vestimenta_id, 2, 10),
    ('Mayas', 'mayas', vestimenta_id, 2, 11),
    ('Blazers y chaquetas', 'blazers-chaquetas', vestimenta_id, 2, 12),
    ('Sacos', 'sacos', vestimenta_id, 2, 13),
    ('Buzos y canguros', 'buzos-canguros', vestimenta_id, 2, 14),
    ('Camperas y abrigos', 'camperas-abrigos', vestimenta_id, 2, 15);

    -- Obtener ID de pantalones para sub-subcategorías
    SELECT id INTO pantalones_id FROM categories WHERE slug = 'pantalones';

    -- Sub-subcategorías de Pantalones
    INSERT INTO categories (name, slug, parent_id, level, sort_order) VALUES
    ('Deportivos', 'pantalones-deportivos', pantalones_id, 3, 1),
    ('Cargos', 'pantalones-cargos', pantalones_id, 3, 2),
    ('Gabardina', 'pantalones-gabardina', pantalones_id, 3, 3);

    -- Subcategorías de Accesorios
    INSERT INTO categories (name, slug, parent_id, level, sort_order) VALUES
    ('Collares', 'collares', accesorios_id, 2, 1),
    ('Pañuelos', 'panuelos', accesorios_id, 2, 2),
    ('Carvanas', 'carvanas', accesorios_id, 2, 3),
    ('Billeteras', 'billeteras', accesorios_id, 2, 4),
    ('Riñoneras', 'rinoneras', accesorios_id, 2, 5),
    ('Mochilas', 'mochilas', accesorios_id, 2, 6);

    -- Calzado (sin subcategorías por ahora)
    -- Se puede agregar después si es necesario
END $$;

-- =====================================================
-- 2. ACTUALIZAR MARCAS ESPECÍFICAS
-- =====================================================

-- Limpiar marcas existentes
DELETE FROM brands;

-- Insertar marcas específicas
INSERT INTO brands (name, slug, zureo_id) VALUES
('MISTRAL', 'mistral', 1),
('UNIFORM', 'uniform', 2),
('LEVIS', 'levis', 3),
('KETZIA', 'ketzia', 4),
('INDIANKA', 'indianka', 5),
('BOA', 'boa', 6),
('EMPATHIA', 'empathia', 7),
('ROTUNDA', 'rotunda', 8),
('LEMONGATTO', 'lemongatto', 9),
('PARDO', 'pardo', 10),
('MINOT', 'minot', 11),
('MANDAL', 'mandal', 12),
('SYMPHORI', 'symphori', 13),
('NEUFO', 'neufo', 14),
('BROOKSFIELD', 'brooksfield', 15);

-- =====================================================
-- 3. ACTUALIZAR TABLA DE PRODUCTOS
-- =====================================================

-- Agregar campos faltantes a products_in_stock
ALTER TABLE products_in_stock 
ADD COLUMN IF NOT EXISTS precio_zureo NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS categoria_zureo VARCHAR(255),
ADD COLUMN IF NOT EXISTS sale_price NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gender VARCHAR(50),
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(255),
ADD COLUMN IF NOT EXISTS custom_name TEXT,
ADD COLUMN IF NOT EXISTS custom_description TEXT,
ADD COLUMN IF NOT EXISTS sku VARCHAR(255),
ADD COLUMN IF NOT EXISTS weight NUMERIC(8,2),
ADD COLUMN IF NOT EXISTS dimensions VARCHAR(255);

-- Actualizar productos existentes con datos de zureo
UPDATE products_in_stock 
SET 
    precio_zureo = price,
    categoria_zureo = category
WHERE precio_zureo IS NULL OR categoria_zureo IS NULL;

-- =====================================================
-- 4. MEJORAR TABLA DE ÓRDENES
-- =====================================================

-- Agregar campos faltantes a orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(100) DEFAULT 'pickup',
ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS customer_dni VARCHAR(50);

-- =====================================================
-- 5. CREAR USUARIO POR DEFECTO SI NO EXISTE
-- =====================================================

INSERT INTO users (first_name, last_name, email, role)
SELECT 'Cliente', 'Anónimo', 'anonimo@oxstore.com', 'customer'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'anonimo@oxstore.com');

-- =====================================================
-- 6. CONFIGURAR POLÍTICAS RLS PERMISIVAS
-- =====================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow all operations" ON categories;
DROP POLICY IF EXISTS "Allow all operations" ON brands;
DROP POLICY IF EXISTS "Allow all operations" ON products_in_stock;
DROP POLICY IF EXISTS "Allow all operations" ON product_images;
DROP POLICY IF EXISTS "Allow all operations" ON orders;
DROP POLICY IF EXISTS "Allow all operations" ON order_items;
DROP POLICY IF EXISTS "Allow all operations" ON cart_items;
DROP POLICY IF EXISTS "Allow all operations" ON users;

-- Crear políticas permisivas para todas las tablas
CREATE POLICY "Allow all operations" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON brands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON products_in_stock FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON product_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON cart_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true) WITH CHECK (true);

-- Habilitar RLS en todas las tablas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_in_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products_in_stock(brand);
CREATE INDEX IF NOT EXISTS idx_products_category ON products_in_stock(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products_in_stock(is_active);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- =====================================================
-- 8. ACTUALIZAR TIMESTAMPS
-- =====================================================

-- Función para actualizar timestamps automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a tablas relevantes
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products_in_stock;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products_in_stock 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FINALIZACIÓN
-- =====================================================

-- Actualizar sync_status
INSERT INTO sync_status (sync_type, status, last_sync_at, total_records)
VALUES ('database_restructure', 'completed', NOW(), 0)
ON CONFLICT (sync_type) DO UPDATE SET
    status = 'completed',
    last_sync_at = NOW(),
    updated_at = NOW();

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos reestructurada completamente:';
    RAISE NOTICE '- Categorías: % registros', (SELECT COUNT(*) FROM categories);
    RAISE NOTICE '- Marcas: % registros', (SELECT COUNT(*) FROM brands);
    RAISE NOTICE '- Productos: % registros', (SELECT COUNT(*) FROM products_in_stock);
    RAISE NOTICE '- Banners mantenidos: % registros', (SELECT COUNT(*) FROM banners);
END $$;
