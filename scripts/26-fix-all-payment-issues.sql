-- Agregando todas las columnas faltantes para order_items y arreglando problemas de pagos
-- Agregar columna product_name faltante en order_items
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_name VARCHAR(255);

-- Actualizar order_items existentes con nombres de productos
UPDATE order_items 
SET product_name = COALESCE(
  (SELECT name FROM products_in_stock WHERE id = order_items.product_id),
  (SELECT name FROM products WHERE id = order_items.product_id),
  'Producto sin nombre'
)
WHERE product_name IS NULL;

-- Asegurar que todas las políticas RLS estén correctas
DROP POLICY IF EXISTS "Allow all operations on order_items" ON order_items;
CREATE POLICY "Allow all operations on order_items" ON order_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on orders" ON orders;
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Asegurar que los valores por defecto estén correctos
ALTER TABLE orders ALTER COLUMN order_status SET DEFAULT 'pending';
ALTER TABLE orders ALTER COLUMN payment_status SET DEFAULT 'pending';
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending';
