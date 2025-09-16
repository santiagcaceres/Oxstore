-- Agregar la marca Vostok
INSERT INTO brands (name, slug, is_active, created_at, updated_at)
VALUES ('Vostok', 'vostok', true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Crear tabla para configuración de precios si no existe
CREATE TABLE IF NOT EXISTS price_settings (
  id SERIAL PRIMARY KEY,
  multiplier DECIMAL(10,2) DEFAULT 1.22,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar configuración de precio por defecto
INSERT INTO price_settings (multiplier, created_at, updated_at)
VALUES (1.22, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Comentario: Configuración completada
-- La marca Vostok ha sido agregada
-- El multiplicador de precios se establece en 1.22 por defecto
