-- Reorganizar guías de talles por subcategoría en lugar de por marca

-- Eliminar políticas RLS existentes
DROP POLICY IF EXISTS "Allow public read access to size_guides" ON size_guides;
DROP POLICY IF EXISTS "Allow authenticated users to manage size_guides" ON size_guides;

-- Eliminar tabla existente
DROP TABLE IF EXISTS size_guides;

-- Crear nueva tabla para guías de talles por subcategoría
CREATE TABLE size_guides (
  id SERIAL PRIMARY KEY,
  subcategory VARCHAR(255) NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para búsquedas rápidas por subcategoría
CREATE INDEX idx_size_guides_subcategory ON size_guides(subcategory);

-- Habilitar RLS
ALTER TABLE size_guides ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública
CREATE POLICY "Allow public read access to size_guides"
  ON size_guides FOR SELECT
  TO public
  USING (true);

-- Política para admin (insertar, actualizar, eliminar)
CREATE POLICY "Allow authenticated users to manage size_guides"
  ON size_guides FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Comentario explicativo
COMMENT ON TABLE size_guides IS 'Guías de talles organizadas por subcategoría de producto';
COMMENT ON COLUMN size_guides.subcategory IS 'Subcategoría del producto (ej: remeras, pantalones, zapatillas)';
