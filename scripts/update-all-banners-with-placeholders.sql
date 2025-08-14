-- Script para actualizar/insertar todos los banners con placeholders
-- Primero eliminamos banners existentes para evitar duplicados
DELETE FROM banners;

-- Insertamos todos los banners predefinidos con placeholders
INSERT INTO banners (title, description, image_url, link_url, banner_type, banner_size, display_order, is_active, file_path) VALUES
-- Banners principales (carousel)
('Colección Invierno 2025', 'Descubre las últimas tendencias en moda de invierno', '/placeholder.svg?height=600&width=1200&text=Colección+Invierno+2025', '/nuevo', 'hero', 'large', 1, true, 'placeholder-hero-1.svg'),
('Sale hasta 40% OFF', 'Aprovecha nuestras ofertas especiales en toda la tienda', '/placeholder.svg?height=600&width=1200&text=Sale+hasta+40%+OFF', '/sale', 'hero', 'large', 2, true, 'placeholder-hero-2.svg'),
('Nueva Colección Primavera', 'Renueva tu guardarropa con los últimos diseños', '/placeholder.svg?height=600&width=1200&text=Nueva+Colección+Primavera', '/nuevo', 'hero', 'large', 3, true, 'placeholder-hero-3.svg'),

-- Banners de categorías (4 cuadrados debajo del principal)
('Hombre', 'Descubre la moda masculina', '/placeholder.svg?height=500&width=400&text=Hombre', '/hombre', 'category', 'square', 1, true, 'placeholder-category-1.svg'),
('Mujer', 'Explora la moda femenina', '/placeholder.svg?height=500&width=400&text=Mujer', '/mujer', 'category', 'square', 2, true, 'placeholder-category-2.svg'),
('Accesorios', 'Complementa tu estilo', '/placeholder.svg?height=500&width=400&text=Accesorios', '/accesorios', 'category', 'square', 3, true, 'placeholder-category-3.svg'),
('Sale', 'Ofertas especiales', '/placeholder.svg?height=500&width=400&text=Sale', '/sale', 'category', 'square', 4, true, 'placeholder-category-4.svg'),

-- Banners promocionales (3 banners medianos)
('Envío Gratis', 'En compras superiores a $2000', '/placeholder.svg?height=400&width=600&text=Envío+Gratis', '/envios', 'promotional', 'medium', 1, true, 'placeholder-promo-1.svg'),
('Descuentos Especiales', 'Hasta 30% OFF en marcas seleccionadas', '/placeholder.svg?height=400&width=600&text=Descuentos+Especiales', '/sale', 'promotional', 'medium', 2, true, 'placeholder-promo-2.svg'),
('Nueva Temporada', 'Últimas tendencias disponibles', '/placeholder.svg?height=400&width=600&text=Nueva+Temporada', '/nuevo', 'promotional', 'medium', 3, true, 'placeholder-promo-3.svg'),

-- Banners de productos (2 banners)
('Calzado Premium', 'Descubre nuestra colección de calzado', '/placeholder.svg?height=400&width=800&text=Calzado+Premium', '/accesorios', 'product', 'medium', 1, true, 'placeholder-product-1.svg'),
('Ropa de Temporada', 'Las mejores prendas para esta temporada', '/placeholder.svg?height=400&width=800&text=Ropa+de+Temporada', '/nuevo', 'product', 'medium', 2, true, 'placeholder-product-2.svg'),

-- Banner del footer
('Suscríbete al Newsletter', 'Recibe las últimas novedades y ofertas exclusivas', '/placeholder.svg?height=300&width=1200&text=Suscríbete+al+Newsletter', '/newsletter', 'footer', 'large', 1, true, 'placeholder-footer.svg'),

-- Banner popup
('Oferta Especial', 'Descuento del 20% en tu primera compra', '/placeholder.svg?height=400&width=600&text=Oferta+Especial+20%', '/sale', 'popup', 'medium', 1, false, 'placeholder-popup.svg');
