-- Script para actualizar TODOS los precios existentes con multiplicador 1.22
-- Actualizar todos los productos existentes con el precio de Zureo multiplicado por 1.22
UPDATE products_in_stock 
SET price = ROUND(CAST(zureo_price AS DECIMAL) * 1.22, 2)
WHERE zureo_price IS NOT NULL 
  AND zureo_price != '' 
  AND zureo_price != '0'
  AND CAST(zureo_price AS DECIMAL) > 0;

-- Verificar cuántos productos se actualizaron
SELECT 
  COUNT(*) as productos_actualizados,
  AVG(CAST(price AS DECIMAL)) as precio_promedio_nuevo,
  AVG(CAST(zureo_price AS DECIMAL)) as precio_promedio_zureo
FROM products_in_stock 
WHERE zureo_price IS NOT NULL 
  AND zureo_price != '' 
  AND zureo_price != '0'
  AND CAST(zureo_price AS DECIMAL) > 0;
