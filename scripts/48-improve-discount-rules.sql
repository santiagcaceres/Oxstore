-- Mejorar tabla de descuentos para soportar filtros combinados
-- Agregar columnas opcionales para marca, categoría y subcategoría

ALTER TABLE discount_rules 
ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES brands(id),
ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id),
ADD COLUMN IF NOT EXISTS subcategory_id INTEGER REFERENCES subcategories(id);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_discount_rules_brand ON discount_rules(brand_id);
CREATE INDEX IF NOT EXISTS idx_discount_rules_category ON discount_rules(category_id);
CREATE INDEX IF NOT EXISTS idx_discount_rules_subcategory ON discount_rules(subcategory_id);

-- Comentarios para documentar la estructura
COMMENT ON COLUMN discount_rules.brand_id IS 'ID de la marca (opcional, para filtros combinados)';
COMMENT ON COLUMN discount_rules.category_id IS 'ID de la categoría (opcional, para filtros combinados)';
COMMENT ON COLUMN discount_rules.subcategory_id IS 'ID de la subcategoría (opcional, para filtros combinados)';
