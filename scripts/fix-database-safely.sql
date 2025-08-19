-- Arreglar tabla banners agregando columnas faltantes
DO $$ 
BEGIN
    -- Agregar columna banner_type si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'banners' AND column_name = 'banner_type') THEN
        ALTER TABLE banners ADD COLUMN banner_type VARCHAR(50) DEFAULT 'main';
    END IF;
    
    -- Agregar columna size si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'banners' AND column_name = 'size') THEN
        ALTER TABLE banners ADD COLUMN size VARCHAR(50) DEFAULT 'large';
    END IF;
END $$;

-- Crear bucket product-images si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Crear políticas para product-images bucket solo si no existen
DO $$ 
BEGIN
    -- Política de lectura pública
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow public read access on product-images'
    ) THEN
        CREATE POLICY "Allow public read access on product-images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'product-images');
    END IF;
    
    -- Política de subida autenticada
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow authenticated upload on product-images'
    ) THEN
        CREATE POLICY "Allow authenticated upload on product-images"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'product-images');
    END IF;
    
    -- Política de eliminación autenticada
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow authenticated delete on product-images'
    ) THEN
        CREATE POLICY "Allow authenticated delete on product-images"
        ON storage.objects FOR DELETE
        USING (bucket_id = 'product-images');
    END IF;
END $$;

-- Actualizar banners existentes con valores por defecto
UPDATE banners 
SET banner_type = 'main', size = 'large' 
WHERE banner_type IS NULL OR size IS NULL;
