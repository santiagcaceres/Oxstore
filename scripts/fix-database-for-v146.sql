-- Script para arreglar la base de datos para la versión v146
-- Basado en los errores encontrados en los logs de debug

-- 1. Arreglar tabla banners - agregar columna display_order que falta
ALTER TABLE banners 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 2. Actualizar display_order basado en la columna orden existente
UPDATE banners 
SET display_order = COALESCE(orden, 0) 
WHERE display_order IS NULL OR display_order = 0;

-- 3. Limpiar columnas duplicadas en banners (mantener las más recientes)
-- Eliminar columnas duplicadas si existen
ALTER TABLE banners DROP COLUMN IF EXISTS tamaño;
ALTER TABLE banners DROP COLUMN IF EXISTS tipo;

-- 4. Asegurar que la tabla banners tenga la estructura correcta
-- Renombrar 'orden' a 'display_order' si es necesario
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'banners' AND column_name = 'orden') THEN
        -- Si existe 'orden' y no existe 'display_order', renombrar
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'banners' AND column_name = 'display_order') THEN
            ALTER TABLE banners RENAME COLUMN orden TO display_order;
        END IF;
    END IF;
END $$;

-- 5. Asegurar que activo e is_active estén sincronizados
UPDATE banners 
SET is_active = activo 
WHERE is_active IS NULL;

-- 6. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_banners_display_order ON banners(display_order);
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_products_activo ON products(activo);
CREATE INDEX IF NOT EXISTS idx_products_codigo ON products(codigo);

-- 7. Asegurar que las tablas de categorías tengan datos básicos
INSERT INTO categories (name) VALUES 
    ('Vestimenta'),
    ('Accesorios'),
    ('Calzado')
ON CONFLICT DO NOTHING;

-- 8. Asegurar que las subcategorías tengan datos básicos
INSERT INTO subcategories (name, category_id) VALUES 
    ('Remeras', (SELECT id FROM categories WHERE name = 'Vestimenta' LIMIT 1)),
    ('Pantalones', (SELECT id FROM categories WHERE name = 'Vestimenta' LIMIT 1)),
    ('Buzos', (SELECT id FROM categories WHERE name = 'Vestimenta' LIMIT 1)),
    ('Camperas', (SELECT id FROM categories WHERE name = 'Vestimenta' LIMIT 1)),
    ('Vestidos', (SELECT id FROM categories WHERE name = 'Vestimenta' LIMIT 1)),
    ('Faldas', (SELECT id FROM categories WHERE name = 'Vestimenta' LIMIT 1)),
    ('Carteras', (SELECT id FROM categories WHERE name = 'Accesorios' LIMIT 1)),
    ('Cinturones', (SELECT id FROM categories WHERE name = 'Accesorios' LIMIT 1)),
    ('Zapatillas', (SELECT id FROM categories WHERE name = 'Calzado' LIMIT 1)),
    ('Zapatos', (SELECT id FROM categories WHERE name = 'Calzado' LIMIT 1))
ON CONFLICT DO NOTHING;

-- 9. Verificar que las políticas RLS estén habilitadas
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- 10. Crear políticas básicas para acceso público de lectura
DROP POLICY IF EXISTS "Allow public read access" ON banners;
CREATE POLICY "Allow public read access" ON banners
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON products;
CREATE POLICY "Allow public read access" ON products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON product_images;
CREATE POLICY "Allow public read access" ON product_images
    FOR SELECT USING (true);

-- 11. Crear políticas para inserción/actualización (para el admin)
DROP POLICY IF EXISTS "Allow admin write access" ON products;
CREATE POLICY "Allow admin write access" ON products
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow admin write access" ON product_images;
CREATE POLICY "Allow admin write access" ON product_images
    FOR ALL USING (true);

-- 12. Asegurar que los buckets de storage existan
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('banners', 'banners', true),
    ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 13. Crear políticas de storage para acceso público
DROP POLICY IF EXISTS "Allow public read access on banners" ON storage.objects;
CREATE POLICY "Allow public read access on banners" ON storage.objects
    FOR SELECT USING (bucket_id = 'banners');

DROP POLICY IF EXISTS "Allow public read access on product-images" ON storage.objects;
CREATE POLICY "Allow public read access on product-images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow admin upload on product-images" ON storage.objects;
CREATE POLICY "Allow admin upload on product-images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow admin delete on product-images" ON storage.objects;
CREATE POLICY "Allow admin delete on product-images" ON storage.objects
    FOR DELETE USING (bucket_id = 'product-images');

-- Mensaje de confirmación
SELECT 'Base de datos configurada correctamente para v146' as status;
