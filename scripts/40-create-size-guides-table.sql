-- Crear tabla para guías de talles por marca
CREATE TABLE IF NOT EXISTS size_guides (
  id SERIAL PRIMARY KEY,
  brand VARCHAR(255) NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para búsquedas rápidas por marca
CREATE INDEX IF NOT EXISTS idx_size_guides_brand ON size_guides(brand);

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
