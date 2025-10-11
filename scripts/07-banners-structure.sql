-- Adding description column to banners table and fixing INSERT statements
-- Add description column to banners table if it doesn't exist
ALTER TABLE banners ADD COLUMN IF NOT EXISTS description TEXT;

-- Eliminar banners existentes y recrear estructura
TRUNCATE TABLE banners RESTART IDENTITY CASCADE;

-- Crear banners predefinidos
INSERT INTO banners (title, subtitle, description, image_url, link_url, position, is_active, created_at, updated_at) VALUES
-- Slides principales (posición 1-3)
('Nuevos Ingresos', 'Descubre lo último', 'Las últimas tendencias en moda', '/placeholder.svg?height=400&width=800&text=Slide+1', '/nuevo', 1, true, NOW(), NOW()),
('Ofertas Especiales', 'Hasta 50% OFF', 'No te pierdas estas increíbles ofertas', '/placeholder.svg?height=400&width=800&text=Slide+2', '/ofertas', 2, true, NOW(), NOW()),
('Nueva Colección', 'Temporada 2024', 'Renueva tu estilo con nuestra nueva colección', '/placeholder.svg?height=400&width=800&text=Slide+3', '/productos', 3, true, NOW(), NOW()),

-- Banners de categorías medianos (posición 10-13)
('Jeans', 'Encuentra tu fit perfecto', 'Jeans para todos los estilos', '/placeholder.svg?height=300&width=400&text=Jeans', '/categoria/mujer/jeans', 10, true, NOW(), NOW()),
('Canguros', 'Comodidad y estilo', 'Canguros para toda ocasión', '/placeholder.svg?height=300&width=400&text=Canguros', '/categoria/mujer/canguros', 11, true, NOW(), NOW()),
('Remeras', 'Básicos renovados', 'Remeras de calidad premium', '/placeholder.svg?height=300&width=400&text=Remeras', '/categoria/mujer/remeras', 12, true, NOW(), NOW()),
('Buzos', 'Abrigo con estilo', 'Buzos para el frío', '/placeholder.svg?height=300&width=400&text=Buzos', '/categoria/mujer/buzos', 13, true, NOW(), NOW()),

-- Banners de género (posición 20-21)
('Mujer', 'Moda femenina', 'Descubre nuestra colección para mujer', '/placeholder.svg?height=400&width=600&text=Mujer', '/categoria/mujer', 20, true, NOW(), NOW()),
('Hombre', 'Moda masculina', 'Descubre nuestra colección para hombre', '/placeholder.svg?height=400&width=600&text=Hombre', '/categoria/hombre', 21, true, NOW(), NOW()),

-- Banner final (posición 30)
('Mega Liquidación', 'Últimas unidades', 'Aprovecha estos precios únicos', '/placeholder.svg?height=200&width=1200&text=Liquidacion', '/ofertas', 30, true, NOW(), NOW());

-- Crear tabla para pop-ups
CREATE TABLE IF NOT EXISTS popups (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  image_url VARCHAR(500),
  link_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  show_delay INTEGER DEFAULT 3000,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar pop-up por defecto
INSERT INTO popups (title, content, image_url, link_url, is_active, show_delay) VALUES
('¡Bienvenido a Oxstore!', 'Descubre las últimas tendencias en moda. Suscríbete y obtén 10% de descuento en tu primera compra.', '/placeholder.svg?height=300&width=400&text=Popup', '/newsletter', true, 5000);
