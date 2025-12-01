-- Script para eliminar manualmente todos los usuarios clientes
-- ADVERTENCIA: Esta acción NO se puede deshacer

-- Primero, verificar cuántos usuarios hay (excluyendo admin)
-- Ejecuta esta query primero para ver cuántos se eliminarán:
SELECT COUNT(*) as total_usuarios_a_eliminar 
FROM auth.users 
WHERE email NOT LIKE '%admin%';

-- Si estás seguro, descomenta y ejecuta las siguientes líneas:

-- 1. Eliminar todos los perfiles de usuarios (excepto admin)
DELETE FROM user_profiles 
WHERE email NOT LIKE '%admin%';

-- 2. Para eliminar usuarios de auth.users necesitas usar la función admin
-- Esto solo se puede hacer desde el código con SUPABASE_SERVICE_ROLE_KEY
-- O desde el dashboard de Supabase en: Authentication > Users > seleccionar y eliminar

-- NOTA: Es más seguro usar el botón "Eliminar usuarios clientes" en el admin
-- que ejecutar este script directamente
