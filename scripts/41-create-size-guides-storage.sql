-- Crear bucket de storage para guías de talles si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('size-guides', 'size-guides', true)
ON CONFLICT (id) DO NOTHING;

-- Permitir acceso público a las guías de talles
CREATE POLICY IF NOT EXISTS "Public Access to Size Guides"
ON storage.objects FOR SELECT
USING (bucket_id = 'size-guides');

-- Permitir a usuarios autenticados subir guías de talles
CREATE POLICY IF NOT EXISTS "Authenticated users can upload size guides"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'size-guides' AND auth.role() = 'authenticated');

-- Permitir a usuarios autenticados actualizar guías de talles
CREATE POLICY IF NOT EXISTS "Authenticated users can update size guides"
ON storage.objects FOR UPDATE
USING (bucket_id = 'size-guides' AND auth.role() = 'authenticated');

-- Permitir a usuarios autenticados eliminar guías de talles
CREATE POLICY IF NOT EXISTS "Authenticated users can delete size guides"
ON storage.objects FOR DELETE
USING (bucket_id = 'size-guides' AND auth.role() = 'authenticated');
