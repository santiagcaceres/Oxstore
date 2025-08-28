-- Corregir políticas de RLS para Storage
-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload access" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access" ON storage.objects;

-- Crear políticas más permisivas para banners
CREATE POLICY "Public read banners" ON storage.objects 
FOR SELECT USING (bucket_id = 'banners');

CREATE POLICY "Public upload banners" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'banners');

CREATE POLICY "Public update banners" ON storage.objects 
FOR UPDATE USING (bucket_id = 'banners');

CREATE POLICY "Public delete banners" ON storage.objects 
FOR DELETE USING (bucket_id = 'banners');

-- Asegurar que el bucket existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true) 
ON CONFLICT (id) DO UPDATE SET public = true;
