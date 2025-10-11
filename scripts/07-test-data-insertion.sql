-- Script de prueba para verificar que todo funciona

-- 1. Insertar una obra de prueba con múltiples imágenes
DO $$
DECLARE
  artwork_id UUID;
BEGIN
  -- Insertar obra principal
  INSERT INTO artworks (
    title, 
    category, 
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
    'Obra de Prueba - Múltiples Imágenes',
    'acrilicos',
    1500,
    'Obra de prueba para verificar múltiples imágenes',
    'Esta es una obra de prueba creada para verificar que el sistema de múltiples imágenes funciona correctamente.',
    2024,
    '40 x 50 cm',
    'Acrílico sobre lienzo',
    'Disponible',
    false,
    'https://placehold.co/800x600/FF6B6B/FFFFFF/jpeg?text=Imagen+Principal'
  ) RETURNING id INTO artwork_id;

  -- Insertar imágenes de galería
  INSERT INTO artwork_images (artwork_id, image_url) VALUES
  (artwork_id, 'https://placehold.co/800x600/FF6B6B/FFFFFF/jpeg?text=Imagen+Principal'),
  (artwork_id, 'https://placehold.co/800x600/4ECDC4/FFFFFF/jpeg?text=Imagen+2'),
  (artwork_id, 'https://placehold.co/800x600/45B7D1/FFFFFF/jpeg?text=Imagen+3');

  RAISE NOTICE 'Obra de prueba creada con ID: %', artwork_id;
END $$;

-- 2. Verificar que la obra se creó correctamente
SELECT 
  a.id,
  a.title,
  a.main_image_url,
  array_agg(ai.image_url ORDER BY ai.created_at) as all_images
FROM artworks a
LEFT JOIN artwork_images ai ON a.id = ai.artwork_id
WHERE a.title = 'Obra de Prueba - Múltiples Imágenes'
GROUP BY a.id, a.title, a.main_image_url;
