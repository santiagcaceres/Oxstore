-- Verificar que las columnas color y size existan en products_in_stock
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'products_in_stock'
    AND column_name IN ('color', 'size', 'price', 'precio_zureo')
ORDER BY 
    column_name;

-- Si las columnas no existen, crearlas
DO $$ 
BEGIN
    -- Agregar columna color si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products_in_stock' AND column_name = 'color'
    ) THEN
        ALTER TABLE products_in_stock ADD COLUMN color TEXT;
        RAISE NOTICE 'Columna color agregada';
    ELSE
        RAISE NOTICE 'Columna color ya existe';
    END IF;

    -- Agregar columna size si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products_in_stock' AND column_name = 'size'
    ) THEN
        ALTER TABLE products_in_stock ADD COLUMN size TEXT;
        RAISE NOTICE 'Columna size agregada';
    ELSE
        RAISE NOTICE 'Columna size ya existe';
    END IF;
END $$;

-- Verificar productos con color y size
SELECT 
    COUNT(*) as total_productos,
    COUNT(CASE WHEN color IS NOT NULL THEN 1 END) as con_color,
    COUNT(CASE WHEN size IS NOT NULL THEN 1 END) as con_talle,
    COUNT(CASE WHEN color IS NOT NULL AND size IS NOT NULL THEN 1 END) as con_ambos,
    COUNT(CASE WHEN price > 0 THEN 1 END) as con_precio
FROM 
    products_in_stock;
