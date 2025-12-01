-- Script para eliminar todos los usuarios clientes (no admin)
-- Este script mantiene los usuarios admin y elimina todos los clientes

-- Primero, mostrar cuántos usuarios hay
DO $$
DECLARE
  total_users INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM auth.users;
  RAISE NOTICE 'Total de usuarios antes de la limpieza: %', total_users;
END $$;

-- Eliminar los perfiles de usuario de clientes (no admin)
DELETE FROM user_profiles 
WHERE email NOT LIKE '%admin%'
  AND email NOT IN ('admin@oxstore.com');

-- Nota: Los usuarios de auth.users solo pueden ser eliminados por el Supabase Admin API
-- Este script limpia la tabla user_profiles, pero los registros en auth.users 
-- deben eliminarse manualmente desde el panel de Supabase o mediante la Admin API

RAISE NOTICE 'Perfiles de usuario eliminados correctamente';
RAISE NOTICE 'IMPORTANTE: Debes eliminar los usuarios de auth.users manualmente desde el panel de Supabase';
