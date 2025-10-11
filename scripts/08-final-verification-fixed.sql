-- Script final de verificación corregido (sin storage.policies)

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

-- 3. Verificar políticas de seguridad en tablas principales
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN ('artworks', 'artwork_images')
ORDER BY tablename, policyname;

-- 4. Verificar bucket de storage (sin políticas por ahora)
SELECT 
  name as bucket_name,
  public,
  created_at
FROM storage.buckets 
WHERE name = 'artworks';

-- 5. Verificar que existan objetos en el bucket (si hay imágenes subidas)
SELECT 
  COUNT(*) as total_files_in_bucket,
  COUNT(CASE WHEN metadata->>'size' IS NOT NULL THEN 1 END) as files_with_metadata
FROM storage.objects 
WHERE bucket_id = 'artworks';

-- 6. Limpiar datos inconsistentes si los hay
DELETE FROM artwork_images 
WHERE image_url IS NULL 
   OR image_url = '' 
   OR image_url = 'null' 
   OR image_url = 'undefined';

-- 7. Verificar integridad de datos
SELECT 
  'Obras sin imagen principal' as check_type,
  COUNT(*) as count
FROM artworks 
WHERE main_image_url IS NULL OR main_image_url = ''
UNION ALL
SELECT 
  'Imágenes de galería huérfanas' as check_type,
  COUNT(*) as count
FROM artwork_images ai
LEFT JOIN artworks a ON ai.artwork_id = a.id
WHERE a.id IS NULL
UNION ALL
SELECT 
  'Obras con imágenes de galería' as check_type,
  COUNT(DISTINCT ai.artwork_id) as count
FROM artwork_images ai
WHERE ai.artwork_id IS NOT NULL;

-- 8. Actualizar estadísticas
ANALYZE artworks;
ANALYZE artwork_images;

-- 9. Mostrar resumen final detallado
SELECT 
  'RESUMEN FINAL' as status,
  (SELECT COUNT(*) FROM artworks) as total_artworks,
  (SELECT COUNT(*) FROM artwork_images) as total_gallery_images,
  (SELECT COUNT(*) FROM artworks WHERE main_image_url IS NOT NULL AND main_image_url != '') as artworks_with_main_image,
  (SELECT COUNT(DISTINCT artwork_id) FROM artwork_images) as artworks_with_gallery,
  (SELECT COUNT(*) FROM artworks WHERE featured = true) as featured_artworks;

-- 10. Mostrar algunas obras de ejemplo con sus imágenes
SELECT 
  a.title,
  a.category,
  a.price,
  a.status,
  a.featured,
  CASE 
    WHEN a.main_image_url IS NOT NULL AND a.main_image_url != '' THEN 'SÍ'
    ELSE 'NO'
  END as tiene_imagen_principal,
  COUNT(ai.id) as imagenes_galeria
FROM artworks a
LEFT JOIN artwork_images ai ON a.id = ai.artwork_id
GROUP BY a.id, a.title, a.category, a.price, a.status, a.featured, a.main_image_url
ORDER BY a.created_at DESC
LIMIT 5;
