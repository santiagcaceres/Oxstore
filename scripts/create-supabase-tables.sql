-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Argentina',
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ARS',
  
  -- Información de envío
  shipping_first_name TEXT NOT NULL,
  shipping_last_name TEXT NOT NULL,
  shipping_email TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT DEFAULT 'Argentina',
  
  -- Información de facturación
  billing_first_name TEXT,
  billing_last_name TEXT,
  billing_email TEXT,
  billing_phone TEXT,
  billing_address TEXT,
  billing_city TEXT,
  billing_postal_code TEXT,
  billing_country TEXT DEFAULT 'Argentina',
  
  -- Información de pago
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_id TEXT,
  
  -- Metadatos
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para items de pedidos
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_brand TEXT,
  variant_name TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para imágenes de productos
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_code TEXT NOT NULL,
  image_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para imágenes de marcas
CREATE TABLE IF NOT EXISTS brand_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  brand_id TEXT NOT NULL UNIQUE,
  brand_name TEXT,
  image_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para banners
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para favoritos de usuarios
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_code)
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_images_code ON product_images(product_code);
CREATE INDEX IF NOT EXISTS idx_brand_images_brand_id ON brand_images(brand_id);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);

-- Función para generar número de pedido único
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'OX' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Crear secuencia para números de pedido
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para order_items
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Políticas para product_images (lectura pública)
CREATE POLICY "Allow public read access on product_images" ON product_images
  FOR SELECT USING (true);

-- Políticas para brand_images (lectura pública)
CREATE POLICY "Allow public read access on brand_images" ON brand_images
  FOR SELECT USING (true);

-- Políticas para banners (lectura pública)
CREATE POLICY "Allow public read access on banners" ON banners
  FOR SELECT USING (true);

-- Políticas para user_favorites
CREATE POLICY "Users can manage own favorites" ON user_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para admin (puedes ajustar según tus necesidades)
-- Estas políticas permiten operaciones completas para administradores
-- En producción, deberías crear roles específicos

CREATE POLICY "Allow admin operations on product_images" ON product_images
  FOR ALL USING (true);

CREATE POLICY "Allow admin operations on brand_images" ON brand_images
  FOR ALL USING (true);

CREATE POLICY "Allow admin operations on banners" ON banners
  FOR ALL USING (true);

CREATE POLICY "Allow admin read on all orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Allow admin update on orders" ON orders
  FOR UPDATE USING (true);

CREATE POLICY "Allow admin read on all order_items" ON order_items
  FOR SELECT USING (true);

CREATE POLICY "Allow admin read on all profiles" ON profiles
  FOR SELECT USING (true);
