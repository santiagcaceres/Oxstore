-- Script completo para debuggear precios en todas las tablas

-- 1. Verificar productos en products_in_stock
SELECT 
    'products_in_stock' as tabla,
    COUNT(*) as total_productos,
    COUNT(CASE WHEN price > 0 THEN 1 END) as productos_con_precio,
    COUNT(CASE WHEN precio_zureo > 0 THEN 1 END) as productos_con_precio_zureo,
    AVG(price) as precio_promedio,
    AVG(precio_zureo) as precio_zureo_promedio
FROM products_in_stock;

-- 2. Verificar productos en products
SELECT 
    'products' as tabla,
    COUNT(*) as total_productos,
    COUNT(CASE WHEN price > 0 THEN 1 END) as productos_con_precio,
    COUNT(CASE WHEN zureo_price > 0 THEN 1 END) as productos_con_zureo_price,
    AVG(price) as precio_promedio,
    AVG(zureo_price) as zureo_price_promedio
FROM products;

-- 3. Verificar variantes
SELECT 
    'product_variants' as tabla,
    COUNT(*) as total_variantes,
    COUNT(CASE WHEN price > 0 THEN 1 END) as variantes_con_precio,
    AVG(price) as precio_promedio_variantes
FROM product_variants;

-- 4. Mostrar ejemplos de productos con precios
SELECT 
    'Ejemplos products_in_stock' as tipo,
    id,
    zureo_code,
    name,
    price,
    precio_zureo,
    stock_quantity,
    created_at
FROM products_in_stock 
WHERE price > 0 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Mostrar ejemplos de productos principales
SELECT 
    'Ejemplos products' as tipo,
    id,
    zureo_code,
    name,
    price,
    zureo_price,
    stock_quantity,
    created_at
FROM products 
WHERE price > 0 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Mostrar ejemplos de variantes con precios
SELECT 
    'Ejemplos product_variants' as tipo,
    pv.id,
    p.name as producto_nombre,
    pv.variety_name,
    pv.color,
    pv.size,
    pv.price,
    pv.stock_quantity
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
WHERE pv.price > 0
ORDER BY pv.created_at DESC
LIMIT 5;

-- 7. Verificar datos de zureo_data para entender la estructura
SELECT 
    'Estructura zureo_data' as tipo,
    zureo_code,
    name,
    price,
    precio_zureo,
    zureo_data::jsonb->'originalProduct'->>'precio' as precio_en_json,
    zureo_data::jsonb->'originalProduct'->>'impuesto' as impuesto_en_json,
    zureo_data::jsonb->>'priceMultiplier' as multiplicador_usado
FROM products_in_stock 
WHERE zureo_data IS NOT NULL 
LIMIT 3;

-- 8. Verificar última sincronización
SELECT 
    sync_type,
    last_sync_at,
    total_records,
    status,
    created_at
FROM sync_status 
WHERE sync_type = 'products'
ORDER BY created_at DESC 
LIMIT 1;
