-- Script para verificar y arreglar datos existentes

-- 1. Verificar estructura actual
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('artworks', 'artwork_images')
ORDER BY table_name, ordinal_position;

-- 2. Verificar datos existentes
SELECT 
  a.id,
  a.title,
  a.main_image_url,
  COUNT(ai.id) as gallery_images_count
FROM artworks a
LEFT JOIN artwork_images ai ON a.id = ai.artwork_id
GROUP BY a.id, a.title, a.main_image_url
ORDER BY a.created_at DESC;

-- 3. Verificar políticas de seguridad
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('artworks', 'artwork_images')
ORDER BY tablename, policyname;

-- 4. Verificar bucket de storage
SELECT 
  id,
  name,
  public
FROM storage.buckets 
WHERE name = 'artworks';

-- 5. Verificar políticas de storage
SELECT 
  id,
  name,
  definition
FROM storage.policies 
WHERE bucket_id = 'artworks';

-- 6. Si necesitas migrar datos existentes (solo si tienes obras sin imágenes en artwork_images)
-- EJECUTAR SOLO SI ES NECESARIO:
/*
INSERT INTO artwork_images (artwork_id, image_url)
SELECT id, main_image_url 
FROM artworks 
WHERE main_image_url IS NOT NULL 
AND id NOT IN (
  SELECT DISTINCT artwork_id 
  FROM artwork_images 
  WHERE artwork_id IS NOT NULL
);
*/
