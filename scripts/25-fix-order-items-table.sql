-- Agregar columna product_image faltante en order_items
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_image TEXT;

-- Actualizar registros existentes con imagen por defecto si es necesario
UPDATE order_items 
SET product_image = '/placeholder.svg?height=100&width=100'
WHERE product_image IS NULL;

-- Agregar comentario a la columna
COMMENT ON COLUMN order_items.product_image IS 'URL de la imagen del producto en el momento de la compra';
