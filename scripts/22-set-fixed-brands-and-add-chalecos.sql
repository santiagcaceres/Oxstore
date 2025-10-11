-- Script para establecer marcas fijas (no actualizables desde Zureo) y agregar chalecos a vestimenta
-- Ejecutar este script para finalizar la configuración de marcas y categorías

-- Limpiar marcas existentes y establecer las marcas fijas
DELETE FROM brands;

-- Insertar las marcas fijas que no se actualizarán desde Zureo
INSERT INTO brands (name, slug, created_at, updated_at) VALUES
('MISTRAL', 'mistral', NOW(), NOW()),
('UNIFORM', 'uniform', NOW(), NOW()),
('LEVIS', 'levis', NOW(), NOW()),
('KETZIA', 'ketzia', NOW(), NOW()),
('INDIANKA', 'indianka', NOW(), NOW()),
('BOA', 'boa', NOW(), NOW()),
('EMPATHIA', 'empathia', NOW(), NOW()),
('ROTUNDA', 'rotunda', NOW(), NOW()),
('LEMONGATTO', 'lemongatto', NOW(), NOW()),
('PARDO', 'pardo', NOW(), NOW()),
('MINOT', 'minot', NOW(), NOW()),
('MANDAL', 'mandal', NOW(), NOW()),
('SYMPHORI', 'symphori', NOW(), NOW()),
('NEUFO', 'neufo', NOW(), NOW()),
('BROOKSFIELD', 'brooksfield', NOW(), NOW()),
('PENGUIN', 'penguin', NOW(), NOW());

-- Agregar chalecos a la categoría vestimenta
INSERT INTO categories (name, slug, parent_id, level, created_at, updated_at)
SELECT 'Chalecos', 'chalecos', id, 2, NOW(), NOW()
FROM categories 
WHERE name = 'Vestimenta' AND level = 1;

-- Actualizar sync_status para indicar que las marcas están completas y no deben actualizarse
INSERT INTO sync_status (sync_type, last_sync, status, created_at, updated_at)
VALUES ('brands_fixed', NOW(), 'completed', NOW(), NOW())
ON CONFLICT (sync_type) 
DO UPDATE SET 
  last_sync = NOW(),
  status = 'completed',
  updated_at = NOW();

-- Comentario: Las marcas ahora están fijas y no se actualizarán desde Zureo
-- Comentario: Se agregó la categoría "Chalecos" a Vestimenta
