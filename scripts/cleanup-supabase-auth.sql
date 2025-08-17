-- Script para limpiar las configuraciones de autenticación de Supabase
-- Ejecuta este script si quieres eliminar completamente las tablas relacionadas con autenticación

-- Eliminar tabla de usuarios admin
DROP TABLE IF EXISTS admin_users CASCADE;

-- Eliminar políticas de RLS si existen
DROP POLICY IF EXISTS "Allow public read access" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON products;

-- Eliminar políticas de product_images si existen
DROP POLICY IF EXISTS "Allow public read access" ON product_images;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON product_images;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON product_images;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON product_images;

-- Nota: Este script elimina las configuraciones de autenticación de Supabase
-- El sistema ahora usa autenticación simple basada en localStorage
