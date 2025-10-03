-- Verificar que las columnas existen
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products_in_stock' 
AND column_name IN ('color', 'size', 'price', 'precio_zureo');

-- Ver productos con color y talle
SELECT 
  id,
  zureo_code,
  name,
  price,
  precio_zureo,
  color,
  size,
  stock_quantity
FROM products_in_stock
WHERE color IS NOT NULL AND size IS NOT NULL
LIMIT 20;

-- Contar productos por color
SELECT 
  color,
  COUNT(*) as cantidad
FROM products_in_stock
WHERE color IS NOT NULL
GROUP BY color
ORDER BY cantidad DESC
LIMIT 10;

-- Contar productos por talle
SELECT 
  size,
  COUNT(*) as cantidad
FROM products_in_stock
WHERE size IS NOT NULL
GROUP BY size
ORDER BY cantidad DESC
LIMIT 10;

-- Ver estadísticas generales
SELECT 
  COUNT(*) as total_productos,
  COUNT(CASE WHEN color IS NOT NULL THEN 1 END) as con_color,
  COUNT(CASE WHEN size IS NOT NULL THEN 1 END) as con_talle,
  COUNT(CASE WHEN color IS NOT NULL AND size IS NOT NULL THEN 1 END) as con_ambos,
  AVG(price) as precio_promedio,
  SUM(stock_quantity) as stock_total
FROM products_in_stock;
