-- Desactivar la confirmación automática de email en Supabase
-- NOTA: Este script configura las políticas pero la confirmación de email 
-- debe desactivarse en el Dashboard de Supabase en:
-- Authentication > Settings > Email Auth > "Enable email confirmations" = OFF

-- Asegurarnos de que los usuarios puedan iniciar sesión sin confirmar email
-- No hay SQL directo para esto, debe hacerse en el dashboard

-- Documentación para el administrador:
-- 1. Ir a: https://supabase.com/dashboard/project/[PROJECT_ID]/auth/providers
-- 2. En "Email" > "Confirm email" cambiar a OFF
-- 3. Guardar cambios

-- Mientras tanto, podemos actualizar las políticas RLS para permitir acceso inmediato
DO $$
BEGIN
  -- Las políticas ya permiten acceso con auth.uid(), no requieren confirmación
  RAISE NOTICE 'Para desactivar completamente la confirmación de email:';
  RAISE NOTICE '1. Ve al Dashboard de Supabase';
  RAISE NOTICE '2. Authentication > Providers > Email';
  RAISE NOTICE '3. Desactiva "Confirm email"';
  RAISE NOTICE '4. Esto permitirá que los usuarios inicien sesión inmediatamente después de registrarse';
END $$;
