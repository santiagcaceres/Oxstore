-- Script completo para configurar base de datos, buckets y políticas
-- Eliminar tablas existentes si existen
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS banners CASCADE;

-- Crear tabla de categorías
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de subcategorías
CREATE TABLE subcategories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de productos
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  zureo_code VARCHAR(50) UNIQUE NOT NULL, -- Código único de Zureo
  title VARCHAR(255),
  description TEXT,
  gender VARCHAR(20) CHECK (gender IN ('hombre', 'mujer')),
  season VARCHAR(20) CHECK (season IN ('verano', 'invierno', 'todo_el_año')),
  category_id INTEGER REFERENCES categories(id),
  subcategory_id INTEGER REFERENCES subcategories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de imágenes de productos
CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de banners (arreglar columnas faltantes)
CREATE TABLE banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  banner_type VARCHAR(50) DEFAULT 'main', -- Columna que faltaba
  banner_size VARCHAR(50) DEFAULT 'large', -- Columna que faltaba
  is_active BOOLEAN DEFAULT true, -- Columna que faltaba
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar categorías iniciales
INSERT INTO categories (name) VALUES 
('Vestimenta'),
('Artículos'),
('Accesorios'),
('Calzado');

-- Insertar subcategorías iniciales
INSERT INTO subcategories (name, category_id) VALUES 
('Remeras', 1),
('Pantalones', 1),
('Vestidos', 1),
('Buzos', 1),
('Camperas', 1),
('Faldas', 1),
('Deportivos', 4),
('Formales', 4),
('Casuales', 4);

-- Insertar banners de ejemplo
INSERT INTO banners (title, image_url, banner_type, banner_size, is_active) VALUES 
('Banner Principal', '/placeholder.svg?height=400&width=1200', 'main', 'large', true),
('Banner Secundario', '/placeholder.svg?height=200&width=600', 'secondary', 'medium', true);

-- Crear buckets de storage
INSERT INTO storage.buckets (id, name, public) VALUES 
('banners', 'banners', true),
('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);

-- Políticas RLS para product_images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on product_images" ON product_images FOR ALL USING (true);

-- Políticas RLS para banners
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on banners" ON banners FOR ALL USING (true);

-- Políticas RLS para categories y subcategories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true);

ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on subcategories" ON subcategories FOR ALL USING (true);

-- Políticas para storage buckets
CREATE POLICY "Allow public read access on banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Allow authenticated upload on banners" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banners');
CREATE POLICY "Allow authenticated update on banners" ON storage.objects FOR UPDATE USING (bucket_id = 'banners');
CREATE POLICY "Allow authenticated delete on banners" ON storage.objects FOR DELETE USING (bucket_id = 'banners');

CREATE POLICY "Allow public read access on product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Allow authenticated upload on product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Allow authenticated update on product-images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
CREATE POLICY "Allow authenticated delete on product-images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
