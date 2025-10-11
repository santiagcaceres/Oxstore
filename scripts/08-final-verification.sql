-- Script final de verificación para asegurar que todo funciona

-- 1. Verificar estructura de tablas
SELECT 
  'artworks' as table_name,
  COUNT(*) as total_records,
  COUNT(main_image_url) as records_with_main_image
FROM artworks
UNION ALL
SELECT 
  'artwork_images' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT artwork_id) as unique_artworks
FROM artwork_images;

-- 2. Verificar relaciones entre tablas
SELECT 
  a.id,
  a.title,
  a.main_image_url IS NOT NULL as has_main_image,
  COUNT(ai.id) as gallery_images_count,
  array_agg(ai.image_url ORDER BY ai.created_at) FILTER (WHERE ai.image_url IS NOT NULL) as gallery_urls
FROM artworks a
LEFT JOIN artwork_images ai ON a.id = ai.artwork_id
GROUP BY a.id, a.title, a.main_image_url
ORDER BY a.created_at DESC
LIMIT 10;

-- 3. Verificar políticas de seguridad
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN ('artworks', 'artwork_images')
ORDER BY tablename, policyname;

-- 4. Verificar bucket de storage y políticas
SELECT 
  b.name as bucket_name,
  b.public,
  COUNT(p.id) as policies_count
FROM storage.buckets b
LEFT JOIN storage.policies p ON b.id = p.bucket_id
WHERE b.name = 'artworks'
GROUP BY b.name, b.public;

-- 5. Limpiar datos inconsistentes si los hay
DELETE FROM artwork_images 
WHERE image_url IS NULL 
   OR image_url = '' 
   OR image_url = 'null' 
   OR image_url = 'undefined';

-- 6. Actualizar estadísticas
ANALYZE artworks;
ANALYZE artwork_images;

-- 7. Mostrar resumen final
SELECT 
  'RESUMEN FINAL' as status,
  (SELECT COUNT(*) FROM artworks) as total_artworks,
  (SELECT COUNT(*) FROM artwork_images) as total_gallery_images,
  (SELECT COUNT(*) FROM artworks WHERE main_image_url IS NOT NULL) as artworks_with_main_image,
  (SELECT COUNT(DISTINCT artwork_id) FROM artwork_images) as artworks_with_gallery;
