-- Crear bucket para imágenes de productos y configurar políticas RLS
-- Crear bucket para imágenes de productos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Política para permitir subir imágenes (público)
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Política para permitir ver imágenes (público)
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Política para permitir eliminar imágenes (público)
CREATE POLICY "Allow public deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images');

-- Habilitar RLS en storage.objects si no está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Configurar políticas RLS para la tabla products
-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Allow public read access" ON products;
DROP POLICY IF EXISTS "Allow public insert access" ON products;
DROP POLICY IF EXISTS "Allow public update access" ON products;
DROP POLICY IF EXISTS "Allow public delete access" ON products;

-- Crear nuevas políticas que permitan acceso público
CREATE POLICY "Allow public read access" ON products
FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON products
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON products
FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON products
FOR DELETE USING (true);

-- Habilitar RLS en la tabla products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Configurar políticas similares para product_images
DROP POLICY IF EXISTS "Allow public read access" ON product_images;
DROP POLICY IF EXISTS "Allow public insert access" ON product_images;
DROP POLICY IF EXISTS "Allow public update access" ON product_images;
DROP POLICY IF EXISTS "Allow public delete access" ON product_images;

CREATE POLICY "Allow public read access" ON product_images
FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON product_images
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON product_images
FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON product_images
FOR DELETE USING (true);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
