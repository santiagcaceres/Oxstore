-- Agregar columna zureo_variety_id a products_in_stock
ALTER TABLE products_in_stock
ADD COLUMN IF NOT EXISTS zureo_variety_id INTEGER;

-- Crear índice para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_products_in_stock_zureo_variety_id 
ON products_in_stock(zureo_variety_id);

-- Verificar estructura de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products_in_stock'
ORDER BY ordinal_position;
