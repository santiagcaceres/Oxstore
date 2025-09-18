-- Agregar campo zureo_price a la tabla products
ALTER TABLE products ADD COLUMN IF NOT EXISTS zureo_price NUMERIC DEFAULT 0;

-- Actualizar productos existentes con el precio de zureo_data si existe
UPDATE products 
SET zureo_price = CASE 
  WHEN zureo_data->>'precio' IS NOT NULL THEN (zureo_data->>'precio')::numeric
  WHEN zureo_data->'originalProduct'->>'precio' IS NOT NULL THEN (zureo_data->'originalProduct'->>'precio')::numeric
  ELSE 0
END
WHERE zureo_price = 0 OR zureo_price IS NULL;

-- Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_products_zureo_price ON products(zureo_price);

-- Verificar los cambios
SELECT 
  id, 
  name, 
  price, 
  zureo_price,
  CASE 
    WHEN zureo_price > 0 THEN ROUND(zureo_price * 1.22, 2)
    ELSE price
  END as calculated_price
FROM products 
LIMIT 10;
