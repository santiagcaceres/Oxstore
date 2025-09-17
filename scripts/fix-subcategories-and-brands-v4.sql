-- Corregir script para evitar errores de constraint y columna faltante
DO $$
DECLARE
    vestimenta_id INTEGER;
    accesorios_id INTEGER;
    calzado_id INTEGER;
BEGIN
    -- Obtener IDs de categorías principales
    SELECT id INTO vestimenta_id FROM categories WHERE slug = 'vestimenta' AND level = 1;
    SELECT id INTO accesorios_id FROM categories WHERE slug = 'accesorios' AND level = 1;
    SELECT id INTO calzado_id FROM categories WHERE slug = 'calzado' AND level = 1;

    -- Agregar subcategorías solo si no existen (evitar duplicados)
    -- Gorros para mujer en accesorios
    INSERT INTO subcategories (name, slug, category_id, gender, is_active, sort_order, level, created_at, updated_at)
    SELECT 'Gorros', 'gorros-mujer', accesorios_id, 'mujer', true, 1, 2, NOW(), NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM subcategories 
        WHERE slug = 'gorros-mujer' AND gender = 'mujer' AND category_id = accesorios_id
    );

    -- Carteras para mujer en accesorios
    INSERT INTO subcategories (name, slug, category_id, gender, is_active, sort_order, level, created_at, updated_at)
    SELECT 'Carteras', 'carteras', accesorios_id, 'mujer', true, 2, 2, NOW(), NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM subcategories 
        WHERE slug = 'carteras' AND gender = 'mujer' AND category_id = accesorios_id
    );

    -- Corregir "carvanas" a "caravanas" si existe
    UPDATE subcategories 
    SET name = 'Caravanas', slug = 'caravanas'
    WHERE name = 'Carvanas' OR slug = 'carvanas';

    -- Agregar marca Vostok sin columna is_active (no existe en la tabla)
    INSERT INTO brands (name, slug, created_at, updated_at)
    SELECT 'Vostok', 'vostok', NOW(), NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM brands WHERE slug = 'vostok'
    );

    -- Configurar multiplicador de precios por defecto
    INSERT INTO price_settings (multiplier, created_at, updated_at)
    SELECT 1.22, NOW(), NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM price_settings WHERE id = 1
    );

    RAISE NOTICE 'Script ejecutado correctamente: subcategorías y marca agregadas';
END $$;
