-- Actualizar la estructura para manejar múltiples imágenes correctamente

-- 1. Verificar que las tablas existan y tengan la estructura correcta
-- Si ya tienes datos, esto no los afectará

-- Asegurar que la tabla artwork_images tenga índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_artwork_images_artwork_id ON artwork_images(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_images_created_at ON artwork_images(created_at);

-- 2. Actualizar las políticas de seguridad para artwork_images
DROP POLICY IF EXISTS "Allow public read access on artwork_images" ON artwork_images;
DROP POLICY IF EXISTS "Allow uploads" ON artwork_images;
DROP POLICY IF EXISTS "Allow deletes" ON artwork_images;

-- Política para lectura pública
CREATE POLICY "Public read access on artwork_images" 
ON artwork_images FOR SELECT 
USING (true);

-- Política para insertar (necesaria para el admin)
CREATE POLICY "Allow authenticated insert on artwork_images" 
ON artwork_images FOR INSERT 
WITH CHECK (true);

-- Política para actualizar (necesaria para el admin)
CREATE POLICY "Allow authenticated update on artwork_images" 
ON artwork_images FOR UPDATE 
USING (true);

-- Política para eliminar (necesaria para el admin)
CREATE POLICY "Allow authenticated delete on artwork_images" 
ON artwork_images FOR DELETE 
USING (true);

-- 3. Verificar que el bucket de storage exista y tenga las políticas correctas
-- Esto es importante para que las imágenes se puedan subir y ver

-- Política para ver imágenes públicamente
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public read access on artworks bucket" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'artworks');

-- Política para subir imágenes
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to artworks bucket" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'artworks');

-- Política para actualizar imágenes
CREATE POLICY "Allow authenticated updates to artworks bucket" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'artworks');

-- Política para eliminar imágenes
DROP POLICY IF EXISTS "Allow deletes" ON storage.objects;
CREATE POLICY "Allow authenticated deletes from artworks bucket" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'artworks');

-- 4. Función para limpiar imágenes huérfanas (opcional pero útil)
CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS void AS $$
BEGIN
  -- Eliminar registros de artwork_images que no tengan artwork asociado
  DELETE FROM artwork_images 
  WHERE artwork_id NOT IN (SELECT id FROM artworks);
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para mantener consistencia (opcional)
CREATE OR REPLACE FUNCTION update_artwork_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Agregar columna updated_at si no existe
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Crear trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS trigger_update_artwork_updated_at ON artworks;
CREATE TRIGGER trigger_update_artwork_updated_at
  BEFORE UPDATE ON artworks
  FOR EACH ROW
  EXECUTE FUNCTION update_artwork_updated_at();
