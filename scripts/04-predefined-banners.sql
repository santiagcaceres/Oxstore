-- Crear banners predefinidos con imágenes placeholder
-- Eliminar banners existentes y crear los predefinidos
DELETE FROM banners;

-- Banner principal hero
INSERT INTO banners (title, subtitle, image_url, link_url, position, sort_order, is_active, created_at, updated_at) VALUES
('Banner Principal', 'Nuevos Ingresos - Descubre la nueva colección', '/placeholder.svg?height=400&width=800&text=Banner+Principal', '/nuevo', 'hero', 1, true, NOW(), NOW());

-- Banner secundario horizontal
INSERT INTO banners (title, subtitle, image_url, link_url, position, sort_order, is_active, created_at, updated_at) VALUES
('Banner Secundario', 'Colección Especial - Ofertas limitadas', '/placeholder.svg?height=200&width=1200&text=Banner+Secundario', '/ofertas', 'secondary', 2, true, NOW(), NOW());

-- Banner categoría mujer
INSERT INTO banners (title, subtitle, image_url, link_url, position, sort_order, is_active, created_at, updated_at) VALUES
('MUJER', 'Descubre la moda femenina', '/placeholder.svg?height=300&width=600&text=MUJER', '/categoria/mujer/vestimenta', 'category', 3, true, NOW(), NOW());

-- Banner categoría hombre
INSERT INTO banners (title, subtitle, image_url, link_url, position, sort_order, is_active, created_at, updated_at) VALUES
('HOMBRE', 'Estilo masculino moderno', '/placeholder.svg?height=300&width=600&text=HOMBRE', '/categoria/hombre/vestimenta', 'category', 4, true, NOW(), NOW());

-- Banner de ofertas
INSERT INTO banners (title, subtitle, image_url, link_url, position, sort_order, is_active, created_at, updated_at) VALUES
('MEGA LIQUIDACIÓN', 'Hasta 50% OFF en productos seleccionados', '/placeholder.svg?height=250&width=1200&text=MEGA+LIQUIDACION', '/ofertas', 'offers', 5, true, NOW(), NOW());
