-- Create predefined banners for the store
-- This script creates 8 banners with the exact positions expected by the admin

-- First, clear any existing banners to avoid duplicates
DELETE FROM banners;

-- Insert predefined banners
INSERT INTO banners (
  title, 
  subtitle, 
  image_url, 
  link_url, 
  position, 
  is_active, 
  sort_order,
  created_at, 
  updated_at
) VALUES 
-- Banner Principal (Hero)
(
  'Banner Principal', 
  'Descubre nuestra nueva colección', 
  '/placeholder.svg?height=400&width=1200&text=Banner+Principal', 
  '/', 
  'hero', 
  true, 
  1,
  NOW(), 
  NOW()
),

-- Banners de Categorías (Los 4 medianos)
(
  'Jeans Collection', 
  'Los mejores jeans para ti', 
  '/placeholder.svg?height=300&width=600&text=Jeans', 
  '/categoria/jeans', 
  'category-jeans', 
  true, 
  2,
  NOW(), 
  NOW()
),
(
  'Canguros Urbanos', 
  'Comodidad y estilo', 
  '/placeholder.svg?height=300&width=600&text=Canguros', 
  '/categoria/canguros', 
  'category-canguros', 
  true, 
  3,
  NOW(), 
  NOW()
),
(
  'Remeras Casuales', 
  'Para todos los días', 
  '/placeholder.svg?height=300&width=600&text=Remeras', 
  '/categoria/remeras', 
  'category-remeras', 
  true, 
  4,
  NOW(), 
  NOW()
),
(
  'Buzos de Temporada', 
  'Abrígate con estilo', 
  '/placeholder.svg?height=300&width=600&text=Buzos', 
  '/categoria/buzos', 
  'category-buzos', 
  true, 
  5,
  NOW(), 
  NOW()
),

-- Banners de Género
(
  'Colección Mujer', 
  'Moda femenina exclusiva', 
  '/placeholder.svg?height=400&width=800&text=Mujer', 
  '/genero/mujer', 
  'gender-mujer', 
  true, 
  6,
  NOW(), 
  NOW()
),
(
  'Colección Hombre', 
  'Estilo masculino moderno', 
  '/placeholder.svg?height=400&width=800&text=Hombre', 
  '/genero/hombre', 
  'gender-hombre', 
  true, 
  7,
  NOW(), 
  NOW()
),

-- Banner Final
(
  'Banner Final', 
  'No te pierdas nuestras ofertas especiales', 
  '/placeholder.svg?height=300&width=1200&text=Ofertas+Especiales', 
  '/ofertas', 
  'final', 
  true, 
  8,
  NOW(), 
  NOW()
);

-- Ensure RLS is disabled for banners table to avoid permission issues
ALTER TABLE banners DISABLE ROW LEVEL SECURITY;

-- Create storage bucket for banners if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true) 
ON CONFLICT (id) DO NOTHING;

-- Allow public access to banners bucket
INSERT INTO storage.objects (bucket_id, name, owner, metadata) 
VALUES ('banners', '.emptyFolderPlaceholder', null, '{}') 
ON CONFLICT DO NOTHING;
