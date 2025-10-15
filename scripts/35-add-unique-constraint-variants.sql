-- Agregar constraint única para evitar duplicados de variantes
-- Primero eliminar duplicados existentes
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY zureo_code, COALESCE(zureo_variety_id, 0)
      ORDER BY updated_at DESC
    ) as rn
  FROM products_in_stock
)
DELETE FROM products_in_stock
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Crear constraint única
ALTER TABLE products_in_stock
DROP CONSTRAINT IF EXISTS unique_zureo_variant;

ALTER TABLE products_in_stock
ADD CONSTRAINT unique_zureo_variant 
UNIQUE (zureo_code, zureo_variety_id);

-- Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_products_zureo_variant 
ON products_in_stock(zureo_code, zureo_variety_id);
