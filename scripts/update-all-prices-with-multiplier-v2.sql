-- Corregir script para usar precio_zureo en lugar de zureo_price
UPDATE products_in_stock 
SET price = ROUND(precio_zureo * 1.22)
WHERE precio_zureo IS NOT NULL 
  AND precio_zureo > 0;

-- También actualizar la tabla products si existe
UPDATE products 
SET price = ROUND((zureo_data->>'precio')::numeric * 1.22)
WHERE zureo_data IS NOT NULL 
  AND zureo_data->>'precio' IS NOT NULL
  AND (zureo_data->>'precio')::numeric > 0;

-- Mensaje de confirmación
SELECT 
    'Precios actualizados correctamente' as mensaje,
    COUNT(*) as productos_actualizados
FROM products_in_stock 
WHERE precio_zureo IS NOT NULL AND precio_zureo > 0;
