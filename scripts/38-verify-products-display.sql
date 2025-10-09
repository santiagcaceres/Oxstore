-- Verificar productos en products_in_stock y su visibilidad

-- 1. Contar productos totales
SELECT 
  'Total productos' as descripcion,
  COUNT(*) as cantidad
FROM products_in_stock;

-- 2. Productos activos con stock
SELECT 
  'Productos activos con stock' as descripcion,
  COUNT(*) as cantidad
FROM products_in_stock
WHERE is_active = true AND stock_quantity > 0;

-- 3. Productos por categoría
SELECT 
  category as categoria,
  COUNT(*) as cantidad,
  SUM(stock_quantity) as stock_total
FROM products_in_stock
WHERE is_active = true AND stock_quantity > 0
GROUP BY category
ORDER BY cantidad DESC;

-- 4. Productos por marca
SELECT 
  brand as marca,
  COUNT(*) as cantidad
FROM products_in_stock
WHERE is_active = true AND stock_quantity > 0
GROUP BY brand
ORDER BY cantidad DESC
LIMIT 20;

-- 5. Verificar productos con precios
SELECT 
  'Productos con precio' as descripcion,
  COUNT(*) as cantidad,
  AVG(price) as precio_promedio,
  MIN(price) as precio_minimo,
  MAX(price) as precio_maximo
FROM products_in_stock
WHERE is_active = true AND stock_quantity > 0 AND price > 0;

-- 6. Productos con colores y talles
SELECT 
  'Productos con color' as descripcion,
  COUNT(*) as cantidad
FROM products_in_stock
WHERE is_active = true AND stock_quantity > 0 AND color IS NOT NULL
UNION ALL
SELECT 
  'Productos con talle' as descripcion,
  COUNT(*) as cantidad
FROM products_in_stock
WHERE is_active = true AND stock_quantity > 0 AND size IS NOT NULL;

-- 7. Muestra de productos para verificar
SELECT 
  id,
  name,
  category,
  brand,
  price,
  stock_quantity,
  color,
  size,
  is_active,
  is_featured
FROM products_in_stock
WHERE is_active = true AND stock_quantity > 0
ORDER BY created_at DESC
LIMIT 10;

-- 8. Verificar si hay productos sin categoría o marca
SELECT 
  'Productos sin categoría' as problema,
  COUNT(*) as cantidad
FROM products_in_stock
WHERE is_active = true AND stock_quantity > 0 AND (category IS NULL OR category = '')
UNION ALL
SELECT 
  'Productos sin marca' as problema,
  COUNT(*) as cantidad
FROM products_in_stock
WHERE is_active = true AND stock_quantity > 0 AND (brand IS NULL OR brand = '');
