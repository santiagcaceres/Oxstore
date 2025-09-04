-- Crear buckets de Storage para imágenes de productos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Crear políticas RLS para el bucket de imágenes de productos
-- Permitir a todos ver las imágenes (público)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- Permitir subir imágenes (sin autenticación para simplificar)
CREATE POLICY "Allow uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Permitir actualizar imágenes
CREATE POLICY "Allow updates" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');

-- Permitir eliminar imágenes
CREATE POLICY "Allow deletes" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

-- Asegurar que la tabla product_images tenga las políticas correctas
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Crear políticas permisivas para product_images (sin autenticación para simplificar)
DROP POLICY IF EXISTS "Allow all operations on product_images" ON product_images;
CREATE POLICY "Allow all operations on product_images" ON product_images FOR ALL USING (true) WITH CHECK (true);

-- Asegurar que products_in_stock tenga políticas permisivas
DROP POLICY IF EXISTS "Allow all operations on products_in_stock" ON products_in_stock;
CREATE POLICY "Allow all operations on products_in_stock" ON products_in_stock FOR ALL USING (true) WITH CHECK (true);
