-- Script para limpiar datos de prueba (ejecutar solo si quieres limpiar)

-- ADVERTENCIA: Este script eliminará las obras de prueba
-- Solo ejecutar si quieres limpiar los datos de prueba

-- Eliminar obras de prueba creadas durante las verificaciones
DELETE FROM artworks 
WHERE title IN (
  'Obra de Prueba - Múltiples Imágenes',
  'Prueba Final - Múltiples Imágenes'
);

-- Verificar que se eliminaron
SELECT 
  COUNT(*) as obras_de_prueba_restantes
FROM artworks 
WHERE title LIKE '%Prueba%' OR title LIKE '%prueba%';

-- Mostrar obras restantes
SELECT 
  id,
  title,
  category,
  status,
  created_at
FROM artworks 
ORDER BY created_at DESC;
