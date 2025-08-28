-- Crear bucket para imágenes de banners
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banner-images', 'banner-images', true);

-- Política para permitir subida de archivos autenticados
CREATE POLICY "Authenticated users can upload banner images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'banner-images' AND auth.role() = 'authenticated');

-- Política para permitir lectura pública
CREATE POLICY "Public can view banner images" ON storage.objects
  FOR SELECT USING (bucket_id = 'banner-images');

-- Política para permitir que usuarios eliminen archivos de banners
CREATE POLICY "Authenticated users can delete banner images" ON storage.objects
  FOR DELETE USING (bucket_id = 'banner-images' AND auth.role() = 'authenticated');

-- Actualizar banners con imágenes placeholder grises
UPDATE banners SET 
  image_url = '/placeholder.svg?height=400&width=800&text=' || title,
  mobile_image_url = '/placeholder.svg?height=300&width=600&text=' || title
WHERE position IN ('hero', 'secondary', 'category-jeans', 'category-canguros', 'category-remeras', 'category-buzos', 'gender-mujer', 'gender-hombre', 'offers');
