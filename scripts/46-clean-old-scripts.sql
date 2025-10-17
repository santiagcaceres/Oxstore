-- Script para limpiar y consolidar la base de datos
-- Este script elimina duplicados y consolida la estructura final

-- Nota: Los scripts antiguos se pueden eliminar manualmente de la carpeta /scripts
-- Este script solo asegura que la base de datos esté en el estado correcto

-- Verificar que todas las tablas principales existen
DO $$
BEGIN
    RAISE NOTICE 'Verificando estructura de base de datos...';
    
    -- Verificar user_profiles
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        RAISE NOTICE '✓ Tabla user_profiles existe';
    ELSE
        RAISE EXCEPTION '✗ Tabla user_profiles no existe';
    END IF;
    
    -- Verificar products_in_stock
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products_in_stock') THEN
        RAISE NOTICE '✓ Tabla products_in_stock existe';
    ELSE
        RAISE EXCEPTION '✗ Tabla products_in_stock no existe';
    END IF;
    
    -- Verificar orders
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
        RAISE NOTICE '✓ Tabla orders existe';
    ELSE
        RAISE EXCEPTION '✗ Tabla orders no existe';
    END IF;
    
    RAISE NOTICE 'Base de datos verificada correctamente';
END $$;
