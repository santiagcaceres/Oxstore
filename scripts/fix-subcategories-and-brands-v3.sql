-- Script corregido sin ON CONFLICT y sin is_active para brands
DO $$
DECLARE
    accesorios_id INTEGER;
    vostok_exists INTEGER;
BEGIN
    -- Obtener el ID de la categoría accesorios
    SELECT id INTO accesorios_id FROM categories WHERE slug = 'accesorios' LIMIT 1;
    
    IF accesorios_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró la categoría accesorios';
    END IF;
    
    -- Agregar subcategorías gorros y carteras para todos los géneros si no existen
    -- Para hombre
    IF NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'gorros' AND gender = 'hombre' AND category_id = accesorios_id) THEN
        INSERT INTO subcategories (name, slug, category_id, gender, is_active, sort_order, level, created_at, updated_at)
        VALUES ('Gorros', 'gorros', accesorios_id, 'hombre', true, 1, 2, NOW(), NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'carteras' AND gender = 'hombre' AND category_id = accesorios_id) THEN
        INSERT INTO subcategories (name, slug, category_id, gender, is_active, sort_order, level, created_at, updated_at)
        VALUES ('Carteras', 'carteras', accesorios_id, 'hombre', true, 2, 2, NOW(), NOW());
    END IF;
    
    -- Para mujer
    IF NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'gorros' AND gender = 'mujer' AND category_id = accesorios_id) THEN
        INSERT INTO subcategories (name, slug, category_id, gender, is_active, sort_order, level, created_at, updated_at)
        VALUES ('Gorros', 'gorros', accesorios_id, 'mujer', true, 1, 2, NOW(), NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'carteras' AND gender = 'mujer' AND category_id = accesorios_id) THEN
        INSERT INTO subcategories (name, slug, category_id, gender, is_active, sort_order, level, created_at, updated_at)
        VALUES ('Carteras', 'carteras', accesorios_id, 'mujer', true, 2, 2, NOW(), NOW());
    END IF;
    
    -- Para unisex
    IF NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'gorros' AND gender = 'unisex' AND category_id = accesorios_id) THEN
        INSERT INTO subcategories (name, slug, category_id, gender, is_active, sort_order, level, created_at, updated_at)
        VALUES ('Gorros', 'gorros', accesorios_id, 'unisex', true, 1, 2, NOW(), NOW());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'carteras' AND gender = 'unisex' AND category_id = accesorios_id) THEN
        INSERT INTO subcategories (name, slug, category_id, gender, is_active, sort_order, level, created_at, updated_at)
        VALUES ('Carteras', 'carteras', accesorios_id, 'unisex', true, 2, 2, NOW(), NOW());
    END IF;
    
    -- Corregir el nombre de "carvanas" a "caravanas"
    UPDATE subcategories 
    SET name = 'Caravanas', slug = 'caravanas', updated_at = NOW()
    WHERE name = 'Carvanas' OR slug = 'carvanas';
    
    -- Agregar la marca Vostok si no existe
    SELECT COUNT(*) INTO vostok_exists FROM brands WHERE LOWER(name) = 'vostok';
    
    IF vostok_exists = 0 THEN
        INSERT INTO brands (name, slug, created_at, updated_at)
        VALUES ('Vostok', 'vostok', NOW(), NOW());
    END IF;
    
    -- Crear tabla de configuración de precios si no existe
    CREATE TABLE IF NOT EXISTS price_settings (
        id SERIAL PRIMARY KEY,
        multiplier DECIMAL(10,2) DEFAULT 1.22,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Insertar configuración inicial si no existe
    IF NOT EXISTS (SELECT 1 FROM price_settings LIMIT 1) THEN
        INSERT INTO price_settings (multiplier) VALUES (1.22);
    END IF;
    
    RAISE NOTICE 'Script ejecutado correctamente: subcategorías agregadas, caravanas corregido, marca Vostok agregada';
END $$;
