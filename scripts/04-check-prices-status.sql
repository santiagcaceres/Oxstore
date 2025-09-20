-- Verificar el estado actual de los precios en la base de datos
SELECT 
  'products_in_stock' as tabla,
  COUNT(*) as total_productos,
  COUNT(CASE WHEN price = 0 OR price IS NULL THEN 1 END) as productos_sin_precio,
  COUNT(CASE WHEN price > 0 THEN 1 END) as productos_con_precio,
  AVG(price) as precio_promedio,
  MIN(price) as precio_minimo,
  MAX(price) as precio_maximo
FROM products_in_stock
WHERE is_active = true

UNION ALL

SELECT 
  'products' as tabla,
  COUNT(*) as total_productos,
  COUNT(CASE WHEN price = 0 OR price IS NULL THEN 1 END) as productos_sin_precio,
  COUNT(CASE WHEN price > 0 THEN 1 END) as productos_con_precio,
  AVG(price) as precio_promedio,
  MIN(price) as precio_minimo,
  MAX(price) as precio_maximo
FROM products
WHERE is_active = true;

-- Mostrar algunos productos específicos para verificar
SELECT 
  id,
  name,
  zureo_code,
  price,
  zureo_price,
  stock_quantity,
  created_at
FROM products_in_stock 
WHERE is_active = true 
ORDER BY created_at DESC 
LIMIT 10;

-- Verificar si hay datos de zureo_data para extraer precios
SELECT 
  id,
  name,
  zureo_code,
  price,
  CASE 
    WHEN zureo_data IS NOT NULL THEN 'Tiene zureo_data'
    ELSE 'Sin zureo_data'
  END as tiene_zureo_data,
  LENGTH(zureo_data::text) as tamano_zureo_data
FROM products_in_stock 
WHERE is_active = true 
ORDER BY created_at DESC 
LIMIT 5;
