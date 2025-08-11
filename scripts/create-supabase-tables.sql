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
  country TEXT DEFAULT 'Uruguay',
  department TEXT, -- Departamento de Uruguay (Montevideo, Canelones, etc.)
  date_of_birth DATE,
  document_type TEXT DEFAULT 'CI' CHECK (document_type IN ('CI', 'Pasaporte')),
  document_number TEXT,
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
  currency TEXT DEFAULT 'UYU',
  
  -- Información de envío
  shipping_first_name TEXT NOT NULL,
  shipping_last_name TEXT NOT NULL,
  shipping_email TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_department TEXT NOT NULL, -- Departamento de Uruguay
  shipping_postal_code TEXT,
  shipping_country TEXT DEFAULT 'Uruguay',
  
  -- Información de facturación
  billing_first_name TEXT,
  billing_last_name TEXT,
  billing_email TEXT,
  billing_phone TEXT,
  billing_address TEXT,
  billing_city TEXT,
  billing_department TEXT,
  billing_postal_code TEXT,
  billing_country TEXT DEFAULT 'Uruguay',
  billing_document_type TEXT DEFAULT 'CI',
  billing_document_number TEXT,
  
  -- Información de pago
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_id TEXT,
  
  -- Costos de envío
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  shipping_method TEXT DEFAULT 'standard',
  
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

-- Crear tabla para direcciones de usuarios (múltiples direcciones)
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Nombre para la dirección (Casa, Trabajo, etc.)
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  department TEXT NOT NULL,
  postal_code TEXT,
  country TEXT DEFAULT 'Uruguay',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para configuración de envíos por departamento
CREATE TABLE IF NOT EXISTS shipping_rates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  department TEXT NOT NULL UNIQUE,
  standard_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  express_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  free_shipping_threshold DECIMAL(10,2) DEFAULT 2000, -- Envío gratis sobre $2000 UYU
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar tarifas de envío para departamentos de Uruguay
INSERT INTO shipping_rates (department, standard_rate, express_rate, free_shipping_threshold) VALUES
('Montevideo', 150, 300, 2000),
('Canelones', 200, 400, 2000),
('San José', 250, 500, 2000),
('Colonia', 300, 600, 2000),
('Soriano', 350, 700, 2000),
('Río Negro', 350, 700, 2000),
('Paysandú', 400, 800, 2000),
('Salto', 450, 900, 2000),
('Artigas', 500, 1000, 2000),
('Rivera', 450, 900, 2000),
('Tacuarembó', 400, 800, 2000),
('Durazno', 300, 600, 2000),
('Flores', 350, 700, 2000),
('Florida', 250, 500, 2000),
('Lavalleja', 300, 600, 2000),
('Treinta y Tres', 350, 700, 2000),
('Cerro Largo', 400, 800, 2000),
('Rocha', 350, 700, 2000),
('Maldonado', 250, 500, 2000)
ON CONFLICT (department) DO NOTHING;

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_document ON profiles(document_type, document_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_images_code ON product_images(product_code);
CREATE INDEX IF NOT EXISTS idx_brand_images_brand_id ON brand_images(brand_id);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_department ON shipping_rates(department);

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

CREATE TRIGGER update_user_addresses_updated_at 
  BEFORE UPDATE ON user_addresses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, country)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'Uruguay'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para asegurar que solo una dirección sea default por usuario
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE user_addresses 
    SET is_default = false 
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para dirección default única
CREATE TRIGGER ensure_single_default_address_trigger
  BEFORE INSERT OR UPDATE ON user_addresses
  FOR EACH ROW EXECUTE FUNCTION ensure_single_default_address();

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;

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

-- Políticas para user_addresses
CREATE POLICY "Users can manage own addresses" ON user_addresses
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para shipping_rates (lectura pública)
CREATE POLICY "Allow public read access on shipping_rates" ON shipping_rates
  FOR SELECT USING (true);

-- Políticas para admin (operaciones completas)
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

CREATE POLICY "Allow admin operations on shipping_rates" ON shipping_rates
  FOR ALL USING (true);
