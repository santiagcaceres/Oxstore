-- Script para probar la funcionalidad de imágenes

-- 1. Crear una obra de prueba completa con múltiples imágenes
DO $$
DECLARE
  test_artwork_id UUID;
BEGIN
  -- Insertar obra principal
  INSERT INTO artworks (
    title, 
    category, 
    subcategory,
    price, 
    description, 
    detailed_description,
    year,
    dimensions,
    technique,
    status,
    featured,
    main_image_url
  ) VALUES (
    'Prueba Final - Múltiples Imágenes',
    'acrilicos',
    'espatula',
    2000,
    'Obra de prueba final para verificar múltiples imágenes',
    'Esta obra de prueba verifica que el sistema de múltiples imágenes funciona correctamente con navegación, edición y visualización.',
    2024,
    '50 x 70 cm',
    'Acrílico con espátula sobre lienzo',
    'Disponible',
    true,
    'https://placehold.co/800x600/FF6B6B/FFFFFF/jpeg?text=Imagen+Principal+Prueba'
  ) RETURNING id INTO test_artwork_id;

  -- Insertar imágenes de galería
  INSERT INTO artwork_images (artwork_id, image_url) VALUES
  (test_artwork_id, 'https://placehold.co/800x600/4ECDC4/FFFFFF/jpeg?text=Vista+Lateral'),
  (test_artwork_id, 'https://placehold.co/800x600/45B7D1/FFFFFF/jpeg?text=Detalle+Textura'),
  (test_artwork_id, 'https://placehold.co/800x600/96CEB4/FFFFFF/jpeg?text=Vista+Completa');

  RAISE NOTICE 'Obra de prueba creada con ID: % - Verifica en /obra/%', test_artwork_id, test_artwork_id;
END $$;

-- 2. Verificar que la obra se creó correctamente
SELECT 
  a.id,
  a.title,
  a.main_image_url,
  COUNT(ai.id) as total_images,
  array_agg(ai.image_url ORDER BY ai.created_at) as all_gallery_images
FROM artworks a
LEFT JOIN artwork_images ai ON a.id = ai.artwork_id
WHERE a.title = 'Prueba Final - Múltiples Imágenes'
GROUP BY a.id, a.title, a.main_image_url;

-- 3. Simular consulta que hace la aplicación para obtener una obra
SELECT 
  a.*,
  array_agg(ai.image_url ORDER BY ai.created_at) FILTER (WHERE ai.image_url IS NOT NULL) as gallery_images
FROM artworks a
LEFT JOIN artwork_images ai ON a.id = ai.artwork_id
WHERE a.title = 'Prueba Final - Múltiples Imágenes'
GROUP BY a.id;
