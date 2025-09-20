-- Script para forzar la actualización de precios desde zureo_data
-- Este script extrae los precios de zureo_data y los actualiza en la columna price

-- Actualizar precios en products_in_stock
UPDATE products_in_stock 
SET price = CASE 
    WHEN zureo_data IS NOT NULL AND zureo_data != '' THEN
        ROUND(
            COALESCE(
                (zureo_data::json->'originalProduct'->>'precio')::numeric,
                (zureo_data::json->'originalProduct'->>'price')::numeric,
                precio_zureo,
                0
            ) * 1.22
        )
    ELSE 
        ROUND(COALESCE(precio_zureo, 0) * 1.22)
END,
updated_at = NOW()
WHERE price = 0 OR price IS NULL;

-- Actualizar precios en products
UPDATE products 
SET price = CASE 
    WHEN zureo_data IS NOT NULL AND zureo_data != '' THEN
        ROUND(
            COALESCE(
                (zureo_data::json->'originalProduct'->>'precio')::numeric,
                (zureo_data::json->'originalProduct'->>'price')::numeric,
                zureo_price,
                0
            ) * 1.22
        )
    ELSE 
        ROUND(COALESCE(zureo_price, 0) * 1.22)
END,
updated_at = NOW()
WHERE price = 0 OR price IS NULL;

-- Actualizar precios en product_variants
UPDATE product_variants 
SET price = CASE 
    WHEN variety_data IS NOT NULL AND variety_data != '' THEN
        ROUND(
            COALESCE(
                (variety_data::json->>'originalPrice')::numeric,
                (variety_data::json->>'precio')::numeric,
                0
            ) * COALESCE((variety_data::json->>'priceMultiplier')::numeric, 1.22)
        )
    ELSE 
        ROUND(
            (SELECT COALESCE(precio_zureo, 0) * 1.22 
             FROM products_in_stock 
             WHERE id = product_variants.product_id)
        )
END,
updated_at = NOW()
WHERE price = 0 OR price IS NULL;

-- Mostrar estadísticas después de la actualización
SELECT 
    'products_in_stock' as tabla,
    COUNT(*) as total_productos,
    COUNT(CASE WHEN price > 0 THEN 1 END) as productos_con_precio,
    AVG(price) as precio_promedio,
    MIN(price) as precio_minimo,
    MAX(price) as precio_maximo
FROM products_in_stock

UNION ALL

SELECT 
    'products' as tabla,
    COUNT(*) as total_productos,
    COUNT(CASE WHEN price > 0 THEN 1 END) as productos_con_precio,
    AVG(price) as precio_promedio,
    MIN(price) as precio_minimo,
    MAX(price) as precio_maximo
FROM products

UNION ALL

SELECT 
    'product_variants' as tabla,
    COUNT(*) as total_variantes,
    COUNT(CASE WHEN price > 0 THEN 1 END) as variantes_con_precio,
    AVG(price) as precio_promedio,
    MIN(price) as precio_minimo,
    MAX(price) as precio_maximo
FROM product_variants;
