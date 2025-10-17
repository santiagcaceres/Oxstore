-- Eliminar todas las políticas RLS existentes de size_guides
DROP POLICY IF EXISTS "Allow authenticated users to insert size guides" ON size_guides;
DROP POLICY IF EXISTS "Allow authenticated users to update size guides" ON size_guides;
DROP POLICY IF EXISTS "Allow authenticated users to delete size guides" ON size_guides;
DROP POLICY IF EXISTS "Allow public to read size guides" ON size_guides;
DROP POLICY IF EXISTS "Enable read access for all users" ON size_guides;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON size_guides;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON size_guides;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON size_guides;

-- Deshabilitar RLS temporalmente para limpiar
ALTER TABLE size_guides DISABLE ROW LEVEL SECURITY;

-- Habilitar RLS nuevamente
ALTER TABLE size_guides ENABLE ROW LEVEL SECURITY;

-- Crear políticas simples y permisivas
CREATE POLICY "Allow all operations for authenticated users"
ON size_guides
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow read for everyone"
ON size_guides
FOR SELECT
TO public
USING (true);

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'size_guides';
