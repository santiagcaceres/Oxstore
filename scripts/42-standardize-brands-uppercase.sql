-- Convertir todas las marcas a mayúsculas para estandarización
-- Esto optimiza la velocidad al no tener que convertir en cada consulta

-- Actualizar marcas en la tabla brands
UPDATE brands
SET name = UPPER(name)
WHERE name != UPPER(name);

-- Actualizar marcas en products_in_stock
UPDATE products_in_stock
SET brand = UPPER(brand)
WHERE brand != UPPER(brand);

-- Crear índice para optimizar búsquedas por marca
CREATE INDEX IF NOT EXISTS idx_products_in_stock_brand ON products_in_stock(brand);
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);

-- Verificar resultados
SELECT 'Marcas actualizadas:' as status, COUNT(*) as total FROM brands;
SELECT 'Productos actualizados:' as status, COUNT(*) as total FROM products_in_stock WHERE brand IS NOT NULL;
SELECT 'Marcas únicas en productos:' as status, COUNT(DISTINCT brand) as total FROM products_in_stock;
