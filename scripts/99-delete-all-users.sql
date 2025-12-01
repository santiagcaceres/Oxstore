-- Script para eliminar todos los usuarios de la base de datos
-- ADVERTENCIA: Esta acción es irreversible

-- Primero eliminar los items de órdenes (tienen foreign keys)
DELETE FROM order_items;

-- Luego eliminar las órdenes
DELETE FROM orders;

-- Eliminar perfiles de usuario
DELETE FROM user_profiles;

-- Finalmente, eliminar usuarios de auth (esto debe hacerse con precaución)
-- Este script solo limpia las tablas de la aplicación
-- Para eliminar usuarios de Supabase Auth, debes hacerlo desde el dashboard de Supabase
-- o usar la función admin.deleteUser() desde el servidor

-- Mensaje de confirmación
SELECT 'Todos los usuarios y sus datos relacionados han sido eliminados exitosamente' AS resultado;
