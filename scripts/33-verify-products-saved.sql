-- Verificar productos guardados en products_in_stock
SELECT 
  COUNT(*) as total_productos,
  COUNT(CASE WHEN price IS NOT NULL AND price > 0 THEN 1 END) as con_precio,
  COUNT(CASE WHEN color IS NOT NULL THEN 1 END) as con_color,
  COUNT(CASE WHEN size IS NOT NULL THEN 1 END) as con_talle,
  COUNT(CASE WHEN stock_quantity > 0 THEN 1 END) as con_stock
FROM products_in_stock;

-- Ver algunos productos de ejemplo
SELECT 
  id,
  zureo_code,
  name,
  price,
  precio_zureo,
  color,
  size,
  stock_quantity,
  brand,
  category
FROM products_in_stock
LIMIT 10;

-- Ver productos con precio, color y talle
SELECT 
  zureo_code,
  name,
  price,
  color,
  size,
  stock_quantity
FROM products_in_stock
WHERE price IS NOT NULL 
  AND price > 0
  AND color IS NOT NULL
  AND size IS NOT NULL
LIMIT 10;
