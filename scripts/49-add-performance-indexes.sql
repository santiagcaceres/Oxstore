-- Script para agregar índices de rendimiento a las tablas más consultadas
-- Esto mejorará significativamente la velocidad de carga de productos

-- Índices para products_in_stock (tabla principal de productos)
CREATE INDEX IF NOT EXISTS idx_products_zureo_code ON products_in_stock(zureo_code);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products_in_stock(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products_in_stock(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_sale_price ON products_in_stock(sale_price) WHERE sale_price IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_discount ON products_in_stock(discount_percentage) WHERE discount_percentage > 0;
CREATE INDEX IF NOT EXISTS idx_products_stock ON products_in_stock(stock_quantity) WHERE stock_quantity > 0;
CREATE INDEX IF NOT EXISTS idx_products_active ON products_in_stock(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_category ON products_in_stock(category);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products_in_stock(subcategory);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products_in_stock(brand);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products_in_stock(categoria_genero);
CREATE INDEX IF NOT EXISTS idx_products_color ON products_in_stock(color);
CREATE INDEX IF NOT EXISTS idx_products_size ON products_in_stock(size);

-- Índice compuesto para consultas comunes (zureo_code + stock + active)
CREATE INDEX IF NOT EXISTS idx_products_code_stock_active 
ON products_in_stock(zureo_code, stock_quantity, is_active) 
WHERE stock_quantity > 0 AND is_active = true;

-- Índice compuesto para productos nuevos
CREATE INDEX IF NOT EXISTS idx_products_new 
ON products_in_stock(created_at DESC, is_active) 
WHERE is_active = true AND stock_quantity > 0;

-- Índice compuesto para productos en sale
CREATE INDEX IF NOT EXISTS idx_products_sale 
ON products_in_stock(sale_price, discount_percentage, is_active) 
WHERE sale_price IS NOT NULL AND discount_percentage > 0 AND is_active = true;

-- Índices para product_images
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_sort ON product_images(product_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(product_id, is_primary) WHERE is_primary = true;

-- Índices para discount_rules
CREATE INDEX IF NOT EXISTS idx_discount_brand ON discount_rules(brand_id) WHERE brand_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_discount_category ON discount_rules(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_discount_subcategory ON discount_rules(subcategory_id) WHERE subcategory_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_discount_active ON discount_rules(is_active) WHERE is_active = true;

-- Índices para orders (para mejorar el dashboard del admin)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);

-- Índices para order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Índices para user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created ON user_profiles(created_at DESC);

-- Analizar las tablas para actualizar las estadísticas del optimizador
ANALYZE products_in_stock;
ANALYZE product_images;
ANALYZE discount_rules;
ANALYZE orders;
ANALYZE order_items;
ANALYZE user_profiles;
