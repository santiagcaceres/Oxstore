-- Script para eliminar todas las imágenes de productos y comenzar desde cero
-- ADVERTENCIA: Este script eliminará TODAS las imágenes de la tabla product_images

-- Eliminar todas las imágenes de productos
DELETE FROM product_images;

-- Reiniciar el contador de IDs (opcional)
ALTER SEQUENCE product_images_id_seq RESTART WITH 1;

-- Verificar que la tabla esté vacía
SELECT COUNT(*) as total_images FROM product_images;

-- Mensaje de confirmación
SELECT 'Todas las imágenes han sido eliminadas. La tabla product_images está vacía.' as message;
