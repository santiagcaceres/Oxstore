-- Crear bucket para imágenes de productos
-- Crear bucket para imágenes de productos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images', 
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Políticas de acceso para el bucket de productos
-- Política para permitir lectura pública
CREATE POLICY "Public read access for product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Política para permitir subida de imágenes (sin autenticación por ahora)
CREATE POLICY "Allow upload for product images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Política para permitir actualización de imágenes
CREATE POLICY "Allow update for product images" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images');

-- Política para permitir eliminación de imágenes
CREATE POLICY "Allow delete for product images" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images');
