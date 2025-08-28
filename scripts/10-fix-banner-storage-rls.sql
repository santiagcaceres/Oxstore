-- Corregir políticas de Row Level Security para subida de banners
-- Este script permite la subida de imágenes sin restricciones complejas

-- Eliminar políticas existentes que pueden estar causando problemas
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;

-- Crear políticas más permisivas para el bucket de banners
CREATE POLICY "Allow banner uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'banners'
);

CREATE POLICY "Allow banner updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'banners'
);

CREATE POLICY "Allow banner reads" ON storage.objects
FOR SELECT USING (
  bucket_id = 'banners'
);

CREATE POLICY "Allow banner deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'banners'
);

-- Asegurar que el bucket existe y es público
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO UPDATE SET
  public = true;

-- Verificar que las políticas se aplicaron correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
