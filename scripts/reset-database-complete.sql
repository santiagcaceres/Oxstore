-- =====================================================
-- SCRIPT COMPLETO PARA RESETEAR BASE DE DATOS
-- Elimina todo y crea desde cero para v150
-- =====================================================

-- 1. ELIMINAR TODAS LAS POLÍTICAS RLS EXISTENTES
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Eliminar políticas de storage.objects
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
    END LOOP;
    
    -- Eliminar políticas de storage.buckets
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'buckets') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.buckets';
    END LOOP;
    
    -- Eliminar políticas de tablas públicas
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.' || r.tablename;
    END LOOP;
END $$;

-- 2. ELIMINAR TODOS LOS BUCKETS EXISTENTES
DELETE FROM storage.buckets WHERE id IN ('banners', 'product-images', 'brand-images');

-- 3. ELIMINAR TODAS LAS TABLAS EXISTENTES (en orden correcto para evitar errores de FK)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.user_favorites CASCADE;
DROP TABLE IF EXISTS public.user_addresses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.shipping_rates CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.product_subcategories CASCADE;
DROP TABLE IF EXISTS public.product_categories CASCADE;
DROP TABLE IF EXISTS public.subcategories CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.brand_images CASCADE;
DROP TABLE IF EXISTS public.banners CASCADE;

-- 4. CREAR TABLA BANNERS
CREATE TABLE public.banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    banner_type VARCHAR(50) DEFAULT 'main',
    size VARCHAR(50) DEFAULT 'large',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREAR TABLA CATEGORIES
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CREAR TABLA SUBCATEGORIES
CREATE TABLE public.subcategories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CREAR TABLA PRODUCTS
CREATE TABLE public.products (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(100) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    genero VARCHAR(20) CHECK (genero IN ('hombre', 'mujer')),
    temporada VARCHAR(20) CHECK (temporada IN ('verano', 'invierno', 'todo_el_año')),
    category_id INTEGER REFERENCES public.categories(id),
    subcategory_id INTEGER REFERENCES public.subcategories(id),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CREAR TABLA PRODUCT_IMAGES
CREATE TABLE public.product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INSERTAR CATEGORÍAS Y SUBCATEGORÍAS INICIALES
INSERT INTO public.categories (name) VALUES 
('Vestimenta'),
('Accesorios'),
('Calzado');

INSERT INTO public.subcategories (name, category_id) VALUES 
-- Vestimenta
('Remeras', 1),
('Pantalones', 1),
('Buzos', 1),
('Camperas', 1),
('Vestidos', 1),
('Faldas', 1),
-- Accesorios
('Gorras', 2),
('Carteras', 2),
('Cinturones', 2),
-- Calzado
('Zapatillas', 3),
('Zapatos', 3),
('Botas', 3);

-- 10. INSERTAR BANNERS DE EJEMPLO
INSERT INTO public.banners (title, image_url, link_url, banner_type, size, display_order) VALUES 
('Banner Principal', '/placeholder.svg?height=400&width=1200', '/', 'main', 'large', 1),
('Ofertas Especiales', '/placeholder.svg?height=200&width=600', '/sale', 'secondary', 'medium', 2),
('Nueva Colección', '/placeholder.svg?height=300&width=800', '/nuevo', 'featured', 'large', 3);

-- 11. CREAR BUCKETS DE STORAGE
INSERT INTO storage.buckets (id, name, public) VALUES 
('banners', 'banners', true),
('product-images', 'product-images', true);

-- 12. CONFIGURAR POLÍTICAS RLS PARA BANNERS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on banners" ON public.banners
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage banners" ON public.banners
    FOR ALL USING (auth.role() = 'authenticated');

-- 13. CONFIGURAR POLÍTICAS RLS PARA PRODUCTS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on products" ON public.products
    FOR SELECT USING (activo = true);

CREATE POLICY "Allow authenticated users to manage products" ON public.products
    FOR ALL USING (auth.role() = 'authenticated');

-- 14. CONFIGURAR POLÍTICAS RLS PARA PRODUCT_IMAGES
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on product_images" ON public.product_images
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage product_images" ON public.product_images
    FOR ALL USING (auth.role() = 'authenticated');

-- 15. CONFIGURAR POLÍTICAS RLS PARA CATEGORIES Y SUBCATEGORIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on subcategories" ON public.subcategories
    FOR SELECT USING (true);

-- 16. CONFIGURAR POLÍTICAS DE STORAGE PARA BUCKETS
CREATE POLICY "Allow public read access on banners bucket" ON storage.objects
    FOR SELECT USING (bucket_id = 'banners');

CREATE POLICY "Allow authenticated users to upload banners" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'banners' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update banners" ON storage.objects
    FOR UPDATE USING (bucket_id = 'banners' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete banners" ON storage.objects
    FOR DELETE USING (bucket_id = 'banners' AND auth.role() = 'authenticated');

CREATE POLICY "Allow public read access on product-images bucket" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated users to upload product images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update product images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete product images" ON storage.objects
    FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- 17. CREAR ÍNDICES PARA MEJOR PERFORMANCE
CREATE INDEX idx_banners_active ON public.banners(is_active);
CREATE INDEX idx_banners_type ON public.banners(banner_type);
CREATE INDEX idx_banners_order ON public.banners(display_order);
CREATE INDEX idx_products_active ON public.products(activo);
CREATE INDEX idx_products_codigo ON public.products(codigo);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_subcategory ON public.products(subcategory_id);
CREATE INDEX idx_product_images_product ON public.product_images(product_id);

-- 18. CREAR FUNCIÓN PARA ACTUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 19. CREAR TRIGGER PARA PRODUCTS
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SCRIPT COMPLETADO
-- Base de datos lista para v150
-- =====================================================
