-- Verificar el estado actual de los precios en todas las tablas
SELECT 'products_in_stock' as tabla, 
       COUNT(*) as total_productos,
       COUNT(CASE WHEN price > 0 THEN 1 END) as productos_con_precio,
       AVG(price) as precio_promedio,
       MIN(price) as precio_minimo,
       MAX(price) as precio_maximo
FROM products_in_stock

UNION ALL

SELECT 'products' as tabla, 
       COUNT(*) as total_productos,
       COUNT(CASE WHEN price > 0 THEN 1 END) as productos_con_precio,
       AVG(price) as precio_promedio,
       MIN(price) as precio_minimo,
       MAX(price) as precio_maximo
FROM products

UNION ALL

SELECT 'product_variants' as tabla, 
       COUNT(*) as total_productos,
       COUNT(CASE WHEN price > 0 THEN 1 END) as productos_con_precio,
       AVG(price) as precio_promedio,
       MIN(price) as precio_minimo,
       MAX(price) as precio_maximo
FROM product_variants;

-- Mostrar algunos ejemplos de productos con zureo_data
SELECT 
    name,
    price,
    zureo_data->>'originalProduct'->>'precio' as precio_zureo_original,
    zureo_data->>'priceMultiplier' as multiplicador_usado,
    stock_quantity,
    created_at
FROM products_in_stock 
WHERE zureo_data IS NOT NULL 
LIMIT 5;

-- Verificar si hay productos con zureo_data pero sin precio
SELECT 
    COUNT(*) as productos_sin_precio_con_zureo_data
FROM products_in_stock 
WHERE zureo_data IS NOT NULL 
AND (price IS NULL OR price = 0);

-- Mostrar estructura de zureo_data de un producto
SELECT 
    name,
    jsonb_pretty(zureo_data) as zureo_data_estructura
FROM products_in_stock 
WHERE zureo_data IS NOT NULL 
LIMIT 1;
