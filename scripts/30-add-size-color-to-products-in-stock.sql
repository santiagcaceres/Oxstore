-- =====================================================
-- AGREGAR COLUMNAS SIZE Y COLOR A PRODUCTS_IN_STOCK
-- =====================================================

-- Agregar columnas para talle y color
ALTER TABLE products_in_stock 
ADD COLUMN IF NOT EXISTS size VARCHAR(50),
ADD COLUMN IF NOT EXISTS color VARCHAR(100);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_products_in_stock_size ON products_in_stock(size);
CREATE INDEX IF NOT EXISTS idx_products_in_stock_color ON products_in_stock(color);

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Columnas size y color agregadas a products_in_stock';
    RAISE NOTICE 'Total productos: %', (SELECT COUNT(*) FROM products_in_stock);
END $$;
