-- Crear banners predefinidos con imágenes placeholder
-- Ejecutar este script en Supabase SQL Editor

-- Primero, agregar columnas si no existen
ALTER TABLE banners ADD COLUMN IF NOT EXISTS banner_type TEXT DEFAULT 'hero';
ALTER TABLE banners ADD COLUMN IF NOT EXISTS banner_size TEXT DEFAULT 'large';
ALTER TABLE banners ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Limpiar banners existentes (opcional)
-- DELETE FROM banners;

-- Insertar banners predefinidos
INSERT INTO banners (id, title, description, image_url, link_url, banner_type, banner_size, display_order, is_active, file_path) VALUES
-- Banners principales (carousel)
('hero-1', 'Colección Invierno 2025', 'Descubre las últimas tendencias en moda de invierno', '/placeholder.svg?height=600&width=1200&text=Colección+Invierno+2025', '/nuevo', 'hero', 'large', 1, true, 'placeholder-hero-1.svg'),
('hero-2', 'Sale hasta 50% OFF', 'Aprovecha nuestras ofertas especiales por tiempo limitado', '/placeholder.svg?height=600&width=1200&text=Sale+50%+OFF', '/sale', 'hero', 'large', 2, true, 'placeholder-hero-2.svg'),
('hero-3', 'Nueva Colección Primavera', 'Renueva tu guardarropa con los últimos diseños', '/placeholder.svg?height=600&width=1200&text=Nueva+Colección+Primavera', '/nuevo', 'hero', 'large', 3, true, 'placeholder-hero-3.svg'),

-- Banners de categorías (cuadrados)
('category-1', 'Hombre', 'Descubre la moda masculina', '/placeholder.svg?height=400&width=400&text=Hombre', '/hombre', 'category', 'square', 4, true, 'placeholder-category-1.svg'),
('category-2', 'Mujer', 'Encuentra tu estilo perfecto', '/placeholder.svg?height=400&width=400&text=Mujer', '/mujer', 'category', 'square', 5, true, 'placeholder-category-2.svg'),
('category-3', 'Accesorios', 'Complementa tu look', '/placeholder.svg?height=400&width=400&text=Accesorios', '/accesorios', 'category', 'square', 6, true, 'placeholder-category-3.svg'),
('category-4', 'Vestimenta', 'Toda la ropa que necesitas', '/placeholder.svg?height=400&width=400&text=Vestimenta', '/vestimenta', 'category', 'square', 7, true, 'placeholder-category-4.svg'),

-- Banners promocionales
('promo-1', 'Envío Gratis', 'En compras superiores a $2000', '/placeholder.svg?height=300&width=800&text=Envío+Gratis+$2000', '', 'promotional', 'medium', 8, true, 'placeholder-promo-1.svg'),
('promo-2', 'Black Friday', 'Descuentos increíbles en toda la tienda', '/placeholder.svg?height=300&width=800&text=Black+Friday', '/sale', 'promotional', 'medium', 9, false, 'placeholder-promo-2.svg'),

-- Banners de productos
('product-1', 'Calzado Deportivo', 'Nueva línea de zapatillas', '/placeholder.svg?height=250&width=600&text=Calzado+Deportivo', '/accesorios', 'product', 'small', 10, true, 'placeholder-product-1.svg'),
('product-2', 'Ropa de Invierno', 'Abrigos y camperas', '/placeholder.svg?height=250&width=600&text=Ropa+de+Invierno', '/vestimenta/camperas', 'product', 'small', 11, true, 'placeholder-product-2.svg'),

-- Banner popup
('popup-1', 'Bienvenido a OX Store', 'Suscríbete y obtén 10% de descuento en tu primera compra', '/placeholder.svg?height=400&width=600&text=Bienvenido+10%+OFF', '', 'popup', 'medium', 12, false, 'placeholder-popup-1.svg')

ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  link_url = EXCLUDED.link_url,
  banner_type = EXCLUDED.banner_type,
  banner_size = EXCLUDED.banner_size,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  file_path = EXCLUDED.file_path;
