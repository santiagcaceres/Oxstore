-- Seeding initial data for Oxstore
-- Insert categories
INSERT INTO categories (name, slug, description, image_url, sort_order) VALUES
('Mujer', 'mujer', 'Ropa y accesorios para mujer', '/placeholder.svg?height=300&width=300', 1),
('Hombre', 'hombre', 'Ropa y accesorios para hombre', '/placeholder.svg?height=300&width=300', 2),
('Niña', 'nina', 'Ropa para niñas', '/placeholder.svg?height=300&width=300', 3),
('Niño', 'nino', 'Ropa para niños', '/placeholder.svg?height=300&width=300', 4),
('Bebés', 'bebes', 'Ropa para bebés', '/placeholder.svg?height=300&width=300', 5);

-- Insert sample products
INSERT INTO products (name, slug, description, short_description, price, compare_price, sku, stock_quantity, category_id, brand, is_featured) VALUES
('Camiseta Básica Mujer', 'camiseta-basica-mujer', 'Camiseta de algodón 100% para mujer, perfecta para el día a día', 'Camiseta básica de algodón', 29.99, 39.99, 'CAM-MUJ-001', 50, 1, 'Oxstore', true),
('Jeans Slim Fit Hombre', 'jeans-slim-fit-hombre', 'Jeans de corte slim fit para hombre, cómodos y modernos', 'Jeans slim fit de alta calidad', 79.99, 99.99, 'JEA-HOM-001', 30, 2, 'Oxstore', true),
('Vestido Floral Niña', 'vestido-floral-nina', 'Hermoso vestido con estampado floral para niñas', 'Vestido floral cómodo y elegante', 45.99, 55.99, 'VES-NIN-001', 25, 3, 'Oxstore', false),
('Polo Deportivo Niño', 'polo-deportivo-nino', 'Polo deportivo transpirable para niños activos', 'Polo deportivo de alta calidad', 35.99, 45.99, 'POL-NIN-001', 40, 4, 'Oxstore', false),
('Body Bebé Algodón', 'body-bebe-algodon', 'Body suave de algodón orgánico para bebés', 'Body de algodón orgánico', 19.99, 24.99, 'BOD-BEB-001', 60, 5, 'Oxstore', true);

-- Insert product images
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES
(1, '/placeholder.svg?height=600&width=600', 'Camiseta básica mujer blanca', 0, true),
(1, '/placeholder.svg?height=600&width=600', 'Camiseta básica mujer negra', 1, false),
(2, '/placeholder.svg?height=600&width=600', 'Jeans slim fit hombre azul', 0, true),
(2, '/placeholder.svg?height=600&width=600', 'Jeans slim fit hombre negro', 1, false),
(3, '/placeholder.svg?height=600&width=600', 'Vestido floral niña rosa', 0, true),
(4, '/placeholder.svg?height=600&width=600', 'Polo deportivo niño azul', 0, true),
(5, '/placeholder.svg?height=600&width=600', 'Body bebé algodón blanco', 0, true);

-- Insert sample banners
INSERT INTO banners (title, subtitle, image_url, link_url, button_text, position, sort_order, is_active) VALUES
('Nueva Colección Primavera', 'Descubre las últimas tendencias en moda', '/placeholder.svg?height=600&width=1200', '/categoria/mujer', 'Ver Colección', 'hero', 1, true),
('Ofertas Especiales', '3x2 en toda la tienda - Por tiempo limitado', '/placeholder.svg?height=400&width=1200', '/ofertas', 'Ver Ofertas', 'secondary', 2, true),
('Moda Infantil', 'Lo mejor para los más pequeños de la casa', '/placeholder.svg?height=400&width=1200', '/categoria/nina', 'Explorar', 'secondary', 3, true);

-- Insert admin user
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@oxstore.com', '$2b$10$rQZ8kHWKtGkVQZ8kHWKtGOKtGkVQZ8kHWKtGOKtGkVQZ8kHWKtGO', 'Admin', 'Oxstore', 'admin');
