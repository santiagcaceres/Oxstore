-- Arreglando foreign key constraint de product_images para que referencie products_in_stock
-- Eliminar la foreign key constraint existente que probablemente apunta a products
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;

-- Crear nueva foreign key constraint que apunte a products_in_stock
ALTER TABLE product_images 
ADD CONSTRAINT product_images_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products_in_stock(id) ON DELETE CASCADE;

-- Asegurar que product_id sea del tipo correcto (integer)
ALTER TABLE product_images ALTER COLUMN product_id TYPE integer;

-- Verificar que no haya registros huérfanos
DELETE FROM product_images 
WHERE product_id NOT IN (SELECT id FROM products_in_stock);

-- Actualizar políticas RLS para product_images si es necesario
DROP POLICY IF EXISTS "Allow all operations on product_images" ON product_images;
CREATE POLICY "Allow all operations on product_images" ON product_images FOR ALL USING (true);
