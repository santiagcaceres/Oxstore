-- Create test banners if they don't exist
INSERT INTO banners (title, subtitle, image_url, link_url, position, is_active, created_at, updated_at)
VALUES 
  ('Banner Principal', 'Descubre nuestra nueva colección', '/placeholder.svg?height=400&width=1200&text=Banner+Principal', '/', 'hero', true, NOW(), NOW()),
  ('Jeans Collection', 'Los mejores jeans para ti', '/placeholder.svg?height=300&width=600&text=Jeans', '/categoria/jeans', 'category-jeans', true, NOW(), NOW()),
  ('Canguros Urbanos', 'Comodidad y estilo', '/placeholder.svg?height=300&width=600&text=Canguros', '/categoria/canguros', 'category-canguros', true, NOW(), NOW()),
  ('Remeras Casuales', 'Para todos los días', '/placeholder.svg?height=300&width=600&text=Remeras', '/categoria/remeras', 'category-remeras', true, NOW(), NOW()),
  ('Buzos de Temporada', 'Abrígate con estilo', '/placeholder.svg?height=300&width=600&text=Buzos', '/categoria/buzos', 'category-buzos', true, NOW(), NOW()),
  ('Moda Femenina', 'Elegancia y comodidad', '/placeholder.svg?height=300&width=600&text=Mujer', '/genero/mujer', 'gender-mujer', true, NOW(), NOW()),
  ('Estilo Masculino', 'Para el hombre moderno', '/placeholder.svg?height=300&width=600&text=Hombre', '/genero/hombre', 'gender-hombre', true, NOW(), NOW()),
  ('Ofertas Especiales', 'No te pierdas nuestras promociones', '/placeholder.svg?height=400&width=1200&text=Ofertas+Especiales', '/ofertas', 'final', true, NOW(), NOW())
ON CONFLICT (position) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  image_url = EXCLUDED.image_url,
  link_url = EXCLUDED.link_url,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
