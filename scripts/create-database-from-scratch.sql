-- Script completo para crear la base de datos desde cero
-- Eliminar tablas existentes si existen
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.subcategories CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.banners CASCADE;

-- Eliminar buckets de storage si existen
DELETE FROM storage.buckets WHERE id IN ('banners', 'product-images');

-- Crear tabla de categorías
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de subcategorías
CREATE TABLE public.subcategories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INTEGER REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, category_id)
);

-- Crear tabla de productos
CREATE TABLE public.products (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE, -- Código de Zureo (único dato que viene de Zureo)
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    genero VARCHAR(20) CHECK (genero IN ('hombre', 'mujer')) NOT NULL,
    temporada VARCHAR(20) CHECK (temporada IN ('verano', 'invierno', 'todo_el_año')) NOT NULL,
    category_id INTEGER REFERENCES public.categories(id),
    subcategory_id INTEGER REFERENCES public.subcategories(id),
    precio DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de imágenes de productos
CREATE TABLE public.product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de banners (mantener la existente)
CREATE TABLE IF NOT EXISTS public.banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    tipo VARCHAR(50) DEFAULT 'carousel',
    tamaño VARCHAR(50) DEFAULT 'grande',
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar categorías predefinidas
INSERT INTO public.categories (name) VALUES 
('Vestimenta'),
('Artículos'),
('Accesorios'),
('Calzado');

-- Insertar subcategorías predefinidas
INSERT INTO public.subcategories (name, category_id) VALUES 
-- Vestimenta
('Remeras', 1),
('Buzos', 1),
('Pantalones', 1),
('Camperas', 1),
('Vestidos', 1),
('Faldas', 1),
-- Artículos
('Deportivos', 2),
('Hogar', 2),
('Tecnología', 2),
-- Accesorios
('Bolsos', 3),
('Cinturones', 3),
('Joyas', 3),
-- Calzado
('Zapatillas', 4),
('Zapatos', 4),
('Botas', 4);

-- Crear buckets de storage
INSERT INTO storage.buckets (id, name, public) VALUES 
('banners', 'banners', true),
('product-images', 'product-images', true);

-- Políticas RLS para productos (permitir todo por ahora)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Políticas RLS para imágenes de productos
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on product_images" ON public.product_images FOR ALL USING (true) WITH CHECK (true);

-- Políticas RLS para categorías y subcategorías
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on subcategories" ON public.subcategories FOR ALL USING (true) WITH CHECK (true);

-- Políticas de storage para banners
CREATE POLICY "Allow public read access on banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Allow authenticated upload on banners" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banners');
CREATE POLICY "Allow authenticated update on banners" ON storage.objects FOR UPDATE USING (bucket_id = 'banners');
CREATE POLICY "Allow authenticated delete on banners" ON storage.objects FOR DELETE USING (bucket_id = 'banners');

-- Políticas de storage para imágenes de productos
CREATE POLICY "Allow public read access on product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Allow authenticated upload on product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Allow authenticated update on product-images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
CREATE POLICY "Allow authenticated delete on product-images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en productos
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
