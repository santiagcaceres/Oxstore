-- Script para crear un usuario administrador con contraseña conocida
-- Este usuario tendrá acceso al panel de administración

-- Nota: Este script solo prepara la estructura
-- El usuario admin debe crearse manualmente desde el panel de Supabase Auth
-- con las siguientes credenciales:
-- Email: admin@oxstore.com
-- Password: admin123 (cambiar después del primer inicio de sesión)

-- Crear perfil de admin si no existe
INSERT INTO user_profiles (
  id,
  email,
  first_name,
  last_name,
  phone,
  address,
  city,
  created_at
)
SELECT 
  id,
  'admin@oxstore.com',
  'Admin',
  'Oxstore',
  '092 152 947',
  'Santa Lucía',
  'Canelones',
  NOW()
FROM auth.users
WHERE email = 'admin@oxstore.com'
ON CONFLICT (id) DO NOTHING;

-- Agregar columna is_admin si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='user_profiles' AND column_name='is_admin'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Marcar al usuario admin
UPDATE user_profiles
SET is_admin = TRUE
WHERE email = 'admin@oxstore.com';

-- Crear índice para búsquedas rápidas de admin
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin) WHERE is_admin = TRUE;
