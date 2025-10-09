-- Agregar campos faltantes a products_in_stock para permitir categorización completa

-- Agregar campo gender si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products_in_stock' AND column_name = 'gender'
  ) THEN
    ALTER TABLE products_in_stock ADD COLUMN gender TEXT;
    CREATE INDEX idx_products_in_stock_gender ON products_in_stock(gender);
  END IF;
END $$;

-- Agregar campo subcategory si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products_in_stock' AND column_name = 'subcategory'
  ) THEN
    ALTER TABLE products_in_stock ADD COLUMN subcategory TEXT;
    CREATE INDEX idx_products_in_stock_subcategory ON products_in_stock(subcategory);
  END IF;
END $$;

-- Agregar campo sale_price si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products_in_stock' AND column_name = 'sale_price'
  ) THEN
    ALTER TABLE products_in_stock ADD COLUMN sale_price INTEGER;
  END IF;
END $$;

-- Agregar campo discount_percentage si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products_in_stock' AND column_name = 'discount_percentage'
  ) THEN
    ALTER TABLE products_in_stock ADD COLUMN discount_percentage INTEGER;
  END IF;
END $$;

-- Agregar campo custom_name si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products_in_stock' AND column_name = 'custom_name'
  ) THEN
    ALTER TABLE products_in_stock ADD COLUMN custom_name TEXT;
  END IF;
END $$;

-- Agregar campo custom_description si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products_in_stock' AND column_name = 'custom_description'
  ) THEN
    ALTER TABLE products_in_stock ADD COLUMN custom_description TEXT;
  END IF;
END $$;

-- Agregar campo zureo_data si no existe (para almacenar datos originales de Zureo)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products_in_stock' AND column_name = 'zureo_data'
  ) THEN
    ALTER TABLE products_in_stock ADD COLUMN zureo_data JSONB;
  END IF;
END $$;

-- Verificar que todos los campos se agregaron correctamente
SELECT 
  'Campos agregados exitosamente' as mensaje,
  COUNT(*) as total_columnas
FROM information_schema.columns 
WHERE table_name = 'products_in_stock';

-- Mostrar todas las columnas de products_in_stock
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products_in_stock'
ORDER BY ordinal_position;
