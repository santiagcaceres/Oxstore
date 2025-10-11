-- Agregar subcategorías de accesorios y corregir nombre de caravanas
-- Primero obtener el ID de la categoría accesorios
DO $$
DECLARE
    accesorios_id INTEGER;
BEGIN
    -- Obtener ID de categoría accesorios
    SELECT id INTO accesorios_id FROM categories WHERE slug = 'accesorios' AND level = 1;
    
    IF accesorios_id IS NOT NULL THEN
        -- Agregar subcategorías de accesorios para hombre
        INSERT INTO subcategories (name, slug, category_id, gender, is_active, sort_order, level, created_at, updated_at)
        VALUES 
            ('Gorros', 'gorros', accesorios_id, 'hombre', true, 1, 2, NOW(), NOW()),
            ('Carteras', 'carteras', accesorios_id, 'hombre', true, 2, 2, NOW(), NOW())
        ON CONFLICT (slug, gender) DO NOTHING;
        
        -- Agregar subcategorías de accesorios para mujer
        INSERT INTO subcategories (name, slug, category_id, gender, is_active, sort_order, level, created_at, updated_at)
        VALUES 
            ('Gorros', 'gorros', accesorios_id, 'mujer', true, 1, 2, NOW(), NOW()),
            ('Carteras', 'carteras', accesorios_id, 'mujer', true, 2, 2, NOW(), NOW())
        ON CONFLICT (slug, gender) DO NOTHING;
        
        -- Agregar subcategorías de accesorios para unisex
        INSERT INTO subcategories (name, slug, category_id, gender, is_active, sort_order, level, created_at, updated_at)
        VALUES 
            ('Gorros', 'gorros', accesorios_id, 'unisex', true, 1, 2, NOW(), NOW()),
            ('Carteras', 'carteras', accesorios_id, 'unisex', true, 2, 2, NOW(), NOW())
        ON CONFLICT (slug, gender) DO NOTHING;
    END IF;
    
    -- Corregir el nombre de "caravanas" a "aros" (asumiendo que es lo correcto)
    UPDATE subcategories 
    SET name = 'Aros', slug = 'aros', updated_at = NOW()
    WHERE name ILIKE '%caravan%' OR slug ILIKE '%caravan%';
    
    RAISE NOTICE 'Subcategorías de accesorios agregadas y nombre de caravanas corregido';
END $$;
