-- Adding sync status table and updating products table structure
-- Add Zureo-specific columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS zureo_id INTEGER,
ADD COLUMN IF NOT EXISTS zureo_code VARCHAR(100),
ADD COLUMN IF NOT EXISTS zureo_data JSONB,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP;

-- Create index for Zureo ID for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_zureo_id ON products(zureo_id);
CREATE INDEX IF NOT EXISTS idx_products_zureo_code ON products(zureo_code);
CREATE INDEX IF NOT EXISTS idx_products_last_sync ON products(last_sync_at);

-- Create sync status table to track synchronization
CREATE TABLE IF NOT EXISTS sync_status (
  id SERIAL PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL,
  last_sync_at TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  total_records INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create unique index for sync_type
CREATE UNIQUE INDEX IF NOT EXISTS idx_sync_status_type ON sync_status(sync_type);
