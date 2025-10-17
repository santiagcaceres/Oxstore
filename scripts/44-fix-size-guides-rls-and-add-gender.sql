-- Corregir políticas RLS de guías de talles y agregar soporte para género

-- Eliminar políticas RLS existentes
DROP POLICY IF EXISTS "Allow public read access to size_guides" ON size_guides;
DROP POLICY IF EXISTS "Allow authenticated users to manage size_guides" ON size_guides;

-- Agregar columna de género si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'size_guides' AND column_name = 'gender') THEN
    ALTER TABLE size_guides ADD COLUMN gender VARCHAR(50);
  END IF;
END $$;

-- Actualizar constraint único para incluir género
ALTER TABLE size_guides DROP CONSTRAINT IF EXISTS size_guides_subcategory_key;
ALTER TABLE size_guides ADD CONSTRAINT size_guides_subcategory_gender_key UNIQUE (subcategory, gender);

-- Crear índice para búsquedas por subcategoría y género
DROP INDEX IF EXISTS idx_size_guides_subcategory;
CREATE INDEX idx_size_guides_subcategory_gender ON size_guides(subcategory, gender);

-- Política para lectura pública (sin cambios)
CREATE POLICY "Allow public read access to size_guides"
  ON size_guides FOR SELECT
  TO public
  USING (true);

-- Política más permisiva para INSERT - permite a cualquier usuario autenticado
CREATE POLICY "Allow authenticated users to insert size_guides"
  ON size_guides FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política más permisiva para UPDATE - permite a cualquier usuario autenticado
CREATE POLICY "Allow authenticated users to update size_guides"
  ON size_guides FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política más permisiva para DELETE - permite a cualquier usuario autenticado
CREATE POLICY "Allow authenticated users to delete size_guides"
  ON size_guides FOR DELETE
  TO authenticated
  USING (true);

-- Comentarios explicativos
COMMENT ON COLUMN size_guides.gender IS 'Género del producto: hombre, mujer, unisex, o NULL para todas las categorías';
