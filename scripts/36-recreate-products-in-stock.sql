-- Recrear tabla products_in_stock desde cero con estructura correcta
-- Este script elimina y recrea la tabla para asegurar que tenga la estructura correcta

-- Eliminar tabla existente
DROP TABLE IF EXISTS products_in_stock CASCADE;

-- Crear tabla con estructura correcta
CREATE TABLE products_in_stock (
  id BIGSERIAL PRIMARY KEY,
  zureo_id TEXT,
  zureo_code TEXT,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER,
  stock_quantity INTEGER DEFAULT 0,
  category TEXT,
  brand TEXT,
  color TEXT,
  size TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_products_in_stock_zureo_id ON products_in_stock(zureo_id);
CREATE INDEX idx_products_in_stock_zureo_code ON products_in_stock(zureo_code);
CREATE INDEX idx_products_in_stock_category ON products_in_stock(category);
CREATE INDEX idx_products_in_stock_brand ON products_in_stock(brand);
CREATE INDEX idx_products_in_stock_is_active ON products_in_stock(is_active);
CREATE INDEX idx_products_in_stock_price ON products_in_stock(price);
CREATE INDEX idx_products_in_stock_color ON products_in_stock(color);
CREATE INDEX idx_products_in_stock_size ON products_in_stock(size);

-- Deshabilitar RLS temporalmente para debugging
ALTER TABLE products_in_stock DISABLE ROW LEVEL SECURITY;

-- Dar permisos completos
GRANT ALL ON products_in_stock TO anon, authenticated, service_role;
GRANT ALL ON SEQUENCE products_in_stock_id_seq TO anon, authenticated, service_role;

-- Verificar que la tabla se creó correctamente
SELECT 
  'Tabla products_in_stock creada exitosamente' as mensaje,
  COUNT(*) as total_columnas
FROM information_schema.columns 
WHERE table_name = 'products_in_stock';

-- Mostrar todas las columnas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'products_in_stock'
ORDER BY ordinal_position;
