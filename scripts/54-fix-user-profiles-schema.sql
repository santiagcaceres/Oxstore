-- Asegurar que user_profiles no tenga columna email
-- El email se maneja en auth.users de Supabase Auth

-- Eliminar columna email si existe
ALTER TABLE user_profiles DROP COLUMN IF EXISTS email;

-- Eliminar índice de email si existe  
DROP INDEX IF EXISTS idx_user_profiles_email;

-- Actualizar comentario de la tabla
COMMENT ON TABLE user_profiles IS 'Perfiles de usuario - email se maneja en auth.users (2025-01-20)';

-- Asegurar que las foreign keys están correctas
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
