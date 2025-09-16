-- Script corregido sin ON CONFLICT y con corrección de ortografía
-- Primero corregir el nombre mal escrito de "carvanas" a "caravanas"
UPDATE subcategories 
SET name = 'Caravanas', slug = 'caravanas'
WHERE name = 'Carvanas' OR slug = 'carvanas';

-- Obtener el ID de la categoría accesorios
DO $$
DECLARE
    accesorios_id INTEGER;
BEGIN
    -- Buscar la categoría accesorios
    SELECT id INTO accesorios_id 
    FROM categories 
    WHERE slug = 'accesorios' AND level = 1;
    
    IF accesorios_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró la categoría accesorios';
    END IF;
    
    -- Insertar subcategorías de accesorios para hombre si no existen
    INSERT INTO subcategories (name, slug, category_id, gender, is_active, sort_order, level, created_at, updated_at)
    SELECT 'Gorros', 'gorros', accesorios_id, 'hombre', true, 1, 2, NOW(), NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM subcategories 
        WHERE slug = 'gorros' AND gender = 'hombre' AND category_id = accesorios_id
    );
    
    INSERT INTO subcategories (name, slug, category_id, gender, is_active, sort_order, level, created_at, updated_at)
    SELECT 'Carteras', 'carteras', accesorios_id, 'hombre', true, 2, 2, NOW(), NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM subcategories 
        WHERE slug = 'carteras' AND gender = 'hombre' AND category_id = accesorios_id
    );
    
    -- Insertar subcategorías de accesorios para mujer si no existen
    INSERT INTO subcategories (name, slug, category_id, gender, is_active, sort_order, level, created_at, updated_at)
    SELECT 'Gorros', 'gorros', accesorios_id, 'mujer', true, 1, 2, NOW(), NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM subcategories 
        WHERE slug = 'gorros' AND gender = 'mujer' AND category_id = accesorios_id
    );
    
    INSERT INTO subcategories (name, slug, category_id, gender, is_active, sort_order, level, created_at, updated_at)
    SELECT 'Carteras', 'carteras', accesorios_id, 'mujer', true, 2, 2, NOW(), NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM subcategories 
        WHERE slug = 'carteras' AND gender = 'mujer' AND category_id = accesorios_id
    );
    
    -- Insertar subcategorías de accesorios para unisex si no existen
    INSERT INTO subcategories (name, slug, category_id, gender, is_active, sort_order, level, created_at, updated_at)
    SELECT 'Gorros', 'gorros', accesorios_id, 'unisex', true, 1, 2, NOW(), NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM subcategories 
        WHERE slug = 'gorros' AND gender = 'unisex' AND category_id = accesorios_id
    );
    
    INSERT INTO subcategories (name, slug, category_id, gender, is_active, sort_order, level, created_at, updated_at)
    SELECT 'Carteras', 'carteras', accesorios_id, 'unisex', true, 2, 2, NOW(), NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM subcategories 
        WHERE slug = 'carteras' AND gender = 'unisex' AND category_id = accesorios_id
    );
    
    RAISE NOTICE 'Subcategorías de accesorios agregadas correctamente';
END $$;
