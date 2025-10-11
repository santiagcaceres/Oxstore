-- Add columns for featured products and discounts
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS custom_name TEXT,
ADD COLUMN IF NOT EXISTS custom_description TEXT,
ADD COLUMN IF NOT EXISTS custom_images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS zureo_id INTEGER UNIQUE;

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  zureo_id INTEGER UNIQUE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_discount ON products(discount_percentage);
CREATE INDEX IF NOT EXISTS idx_products_zureo_id ON products(zureo_id);
CREATE INDEX IF NOT EXISTS idx_brands_zureo_id ON brands(zureo_id);

-- Enable RLS on brands table
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Create policies for brands
CREATE POLICY "Brands are viewable by everyone" ON brands FOR SELECT USING (true);
CREATE POLICY "Brands are editable by admins" ON brands FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Update existing products to have zureo_id if they don't have it
-- This will be populated during sync

-- Create function to automatically update sale_price when discount changes
CREATE OR REPLACE FUNCTION update_sale_price()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.discount_percentage > 0 THEN
    NEW.sale_price = NEW.price * (1 - NEW.discount_percentage / 100.0);
  ELSE
    NEW.sale_price = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate sale_price
DROP TRIGGER IF EXISTS trigger_update_sale_price ON products;
CREATE TRIGGER trigger_update_sale_price
  BEFORE UPDATE OF discount_percentage, price ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_sale_price();
