-- Verificar productos con precios en products_in_stock
SELECT 
  id,
  zureo_code AS codigo,
  name AS nombre,
  price AS precio_final,
  precio_zureo AS precio_original,
  stock_quantity AS stock,
  brand AS marca,
  category AS categoria
FROM products_in_stock
ORDER BY id
LIMIT 20;

-- Verificar productos con precios en products
SELECT 
  id,
  zureo_code AS codigo,
  name AS nombre,
  price AS precio_final,
  zureo_price AS precio_original,
  stock_quantity AS stock,
  brand AS marca
FROM products
ORDER BY id
LIMIT 20;

-- Verificar variantes con colores y talles
SELECT 
  pv.id,
  p.zureo_code AS codigo_producto,
  p.name AS nombre_producto,
  pv.color,
  pv.size AS talle,
  pv.price AS precio,
  pv.stock_quantity AS stock,
  pv.variety_name AS nombre_variante
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
ORDER BY p.zureo_code, pv.color, pv.size
LIMIT 50;

-- Resumen de datos
SELECT 
  'products_in_stock' AS tabla,
  COUNT(*) AS total_productos,
  COUNT(CASE WHEN price > 0 THEN 1 END) AS con_precio,
  COUNT(CASE WHEN price = 0 OR price IS NULL THEN 1 END) AS sin_precio,
  AVG(price) AS precio_promedio,
  MIN(price) AS precio_minimo,
  MAX(price) AS precio_maximo
FROM products_in_stock

UNION ALL

SELECT 
  'products' AS tabla,
  COUNT(*) AS total_productos,
  COUNT(CASE WHEN price > 0 THEN 1 END) AS con_precio,
  COUNT(CASE WHEN price = 0 OR price IS NULL THEN 1 END) AS sin_precio,
  AVG(price) AS precio_promedio,
  MIN(price) AS precio_minimo,
  MAX(price) AS precio_maximo
FROM products

UNION ALL

SELECT 
  'product_variants' AS tabla,
  COUNT(*) AS total_variantes,
  COUNT(CASE WHEN price > 0 THEN 1 END) AS con_precio,
  COUNT(CASE WHEN price = 0 OR price IS NULL THEN 1 END) AS sin_precio,
  AVG(price) AS precio_promedio,
  MIN(price) AS precio_minimo,
  MAX(price) AS precio_maximo
FROM product_variants;

-- Verificar variantes por producto
SELECT 
  p.zureo_code AS codigo,
  p.name AS producto,
  COUNT(pv.id) AS total_variantes,
  STRING_AGG(DISTINCT pv.color, ', ') AS colores,
  STRING_AGG(DISTINCT pv.size, ', ') AS talles
FROM products p
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id, p.zureo_code, p.name
HAVING COUNT(pv.id) > 0
ORDER BY total_variantes DESC
LIMIT 20;
