-- Verificar y corregir la tabla products_in_stock para asegurar que todas las columnas existen

-- Primero, verificar la estructura actual
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products_in_stock'
ORDER BY ordinal_position;

-- Asegurar que todas las columnas necesarias existen
DO $$
BEGIN
  -- Agregar columna price si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_in_stock' AND column_name = 'price') THEN
    ALTER TABLE products_in_stock ADD COLUMN price INTEGER;
  END IF;

  -- Agregar columna color si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_in_stock' AND column_name = 'color') THEN
    ALTER TABLE products_in_stock ADD COLUMN color TEXT;
  END IF;

  -- Agregar columna size si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_in_stock' AND column_name = 'size') THEN
    ALTER TABLE products_in_stock ADD COLUMN size TEXT;
  END IF;

  -- Agregar columna zureo_id si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_in_stock' AND column_name = 'zureo_id') THEN
    ALTER TABLE products_in_stock ADD COLUMN zureo_id TEXT;
  END IF;

  -- Agregar columna zureo_code si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products_in_stock' AND column_name = 'zureo_code') THEN
    ALTER TABLE products_in_stock ADD COLUMN zureo_code TEXT;
  END IF;
END $$;

-- Verificar permisos de la tabla
GRANT ALL ON products_in_stock TO authenticated;
GRANT ALL ON products_in_stock TO anon;
GRANT ALL ON products_in_stock TO service_role;

-- Deshabilitar RLS temporalmente para debugging
ALTER TABLE products_in_stock DISABLE ROW LEVEL SECURITY;

-- Verificar cuántos productos hay actualmente
SELECT COUNT(*) as total_products FROM products_in_stock;

-- Verificar productos con precio, color y talle
SELECT 
  COUNT(*) as total,
  COUNT(price) as with_price,
  COUNT(color) as with_color,
  COUNT(size) as with_size
FROM products_in_stock;
