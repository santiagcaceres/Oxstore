-- Políticas para el bucket de imágenes
-- Ejecutar después de crear el bucket 'images'

-- Política para permitir subida de imágenes
CREATE POLICY "Allow public uploads" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'images');

-- Política para permitir acceso público a imágenes
CREATE POLICY "Allow public access" ON storage.objects 
FOR SELECT USING (bucket_id = 'images');

-- Política para permitir eliminación de imágenes
CREATE POLICY "Allow public deletes" ON storage.objects 
FOR DELETE USING (bucket_id = 'images');

-- Política para permitir actualización de imágenes
CREATE POLICY "Allow public updates" ON storage.objects 
FOR UPDATE USING (bucket_id = 'images');
