-- Agregar columna categoria_genero a products_in_stock
ALTER TABLE products_in_stock
ADD COLUMN IF NOT EXISTS categoria_genero TEXT;

-- Crear índice para mejorar el rendimiento de las consultas por género
CREATE INDEX IF NOT EXISTS idx_products_in_stock_categoria_genero 
ON products_in_stock(categoria_genero);

-- Verificar la estructura de la tabla
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products_in_stock' 
ORDER BY ordinal_position;
