-- Crear tabla para controlar el cache de sincronización
CREATE TABLE IF NOT EXISTS sync_status (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) UNIQUE NOT NULL,
  last_sync TIMESTAMP WITH TIME ZONE NOT NULL,
  total_synced INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar columna codigo a la tabla products si no existe
ALTER TABLE products ADD COLUMN IF NOT EXISTS codigo VARCHAR(100);

-- Agregar columna zureo_data para guardar datos completos de Zureo
ALTER TABLE products ADD COLUMN IF NOT EXISTS zureo_data JSONB;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_codigo ON products(codigo);
CREATE INDEX IF NOT EXISTS idx_sync_status_type ON sync_status(type);
