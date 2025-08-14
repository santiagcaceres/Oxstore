-- Actualizar tabla de banners para soportar diferentes tipos y tamaños
ALTER TABLE banners ADD COLUMN IF NOT EXISTS banner_type VARCHAR(50) DEFAULT 'hero';
ALTER TABLE banners ADD COLUMN IF NOT EXISTS banner_size VARCHAR(50) DEFAULT 'large';
ALTER TABLE banners ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Comentarios para los tipos de banner:
-- banner_type: 'hero', 'category', 'promotional', 'product'
-- banner_size: 'large', 'medium', 'small', 'square'
