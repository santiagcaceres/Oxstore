-- Agregar campo subcategory si no existe y crear índice
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='products_in_stock' AND column_name='subcategory') THEN
        ALTER TABLE products_in_stock ADD COLUMN subcategory TEXT;
    END IF;
END $$;

-- Crear índice para mejorar rendimiento de búsquedas
CREATE INDEX IF NOT EXISTS idx_products_in_stock_subcategory ON products_in_stock(subcategory);

-- Mostrar productos sin subcategoría
SELECT COUNT(*) as productos_sin_subcategoria 
FROM products_in_stock 
WHERE subcategory IS NULL;
