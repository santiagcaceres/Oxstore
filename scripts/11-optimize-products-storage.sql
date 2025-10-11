-- Optimizar almacenamiento de productos con stock para máxima velocidad
-- Crear tabla optimizada para productos con stock disponible

-- Tabla para productos con stock (optimizada para consultas rápidas)
CREATE TABLE IF NOT EXISTS products_in_stock (
  id SERIAL PRIMARY KEY,
  zureo_id VARCHAR(50) UNIQUE NOT NULL,
  zureo_code VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  category VARCHAR(100),
  brand VARCHAR(100),
  zureo_data JSONB, -- Datos completos de Zureo para referencia
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas ultra-rápidas
CREATE INDEX IF NOT EXISTS idx_products_in_stock_active ON products_in_stock(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_in_stock_stock ON products_in_stock(stock_quantity) WHERE stock_quantity > 0;
CREATE INDEX IF NOT EXISTS idx_products_in_stock_featured ON products_in_stock(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_in_stock_category ON products_in_stock(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock_brand ON products_in_stock(brand);
CREATE INDEX IF NOT EXISTS idx_products_in_stock_zureo_id ON products_in_stock(zureo_id);
CREATE INDEX IF NOT EXISTS idx_products_in_stock_sync ON products_in_stock(last_sync_at);

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_products_in_stock_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar timestamp
DROP TRIGGER IF EXISTS trigger_update_products_in_stock_updated_at ON products_in_stock;
CREATE TRIGGER trigger_update_products_in_stock_updated_at
  BEFORE UPDATE ON products_in_stock
  FOR EACH ROW
  EXECUTE FUNCTION update_products_in_stock_updated_at();

-- Vista optimizada para consultas del frontend
CREATE OR REPLACE VIEW products_available AS
SELECT 
  id,
  zureo_id,
  zureo_code,
  name,
  description,
  price,
  stock_quantity,
  image_url,
  category,
  brand,
  is_featured,
  created_at,
  updated_at
FROM products_in_stock 
WHERE is_active = true AND stock_quantity > 0;

-- Políticas RLS para la nueva tabla
ALTER TABLE products_in_stock ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública
CREATE POLICY "Allow public read access to products_in_stock" ON products_in_stock
  FOR SELECT USING (true);

-- Política para inserción/actualización (solo autenticados)
CREATE POLICY "Allow authenticated insert/update on products_in_stock" ON products_in_stock
  FOR ALL USING (true);
