-- Crear tabla de usuarios admin
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar usuarios admin específicos con sus emails
INSERT INTO admin_users (email) 
VALUES 
  ('mariela@oxstore.com'),
  ('alison@oxstore.com'),
  ('lorenzo@oxstore.com'),
  ('patricia@oxstore.com')
ON CONFLICT (email) DO NOTHING;

-- Crear política RLS para admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Política para que solo usuarios autenticados puedan ver admin_users
CREATE POLICY "Admin users can view admin_users" ON admin_users
  FOR SELECT USING (auth.uid() IS NOT NULL);
