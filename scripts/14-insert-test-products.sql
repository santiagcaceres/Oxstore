-- Script para insertar productos de prueba en la base de datos
-- Esto permite hacer pruebas y edición mientras se resuelve el problema de rate limiting con Zureo

-- Limpiar productos de prueba existentes
DELETE FROM products_in_stock WHERE zureo_id LIKE 'TEST%';

-- Insertar productos de prueba en la tabla products_in_stock
INSERT INTO products_in_stock (
    zureo_id, 
    zureo_code, 
    name, 
    description, 
    price, 
    stock_quantity, 
    category, 
    brand, 
    image_url, 
    is_active, 
    is_featured,
    zureo_data,
    created_at,
    updated_at,
    last_sync_at
) VALUES 
(
    'TEST001',
    'CAMISETA-BASICA-001',
    'Camiseta Básica Mujer',
    'Camiseta básica de algodón 100% para mujer. Disponible en varios colores. Perfecta para uso diario y combinaciones casuales.',
    25.99,
    15,
    'mujer',
    'BasicWear',
    '/placeholder.svg?height=400&width=400&text=Camiseta+Básica+Mujer',
    true,
    true,
    '{"codigo": "CAMISETA-BASICA-001", "stock": 15, "categoria": "mujer", "marca": "BasicWear", "precio": 25.99}',
    NOW(),
    NOW(),
    NOW()
),
(
    'TEST002',
    'JEAN-CLASICO-002',
    'Jean Clásico Hombre',
    'Jean clásico de corte recto para hombre. Tela denim de alta calidad, resistente y cómodo para uso diario.',
    45.99,
    8,
    'hombre',
    'DenimCo',
    '/placeholder.svg?height=400&width=400&text=Jean+Clásico+Hombre',
    true,
    false,
    '{"codigo": "JEAN-CLASICO-002", "stock": 8, "categoria": "hombre", "marca": "DenimCo", "precio": 45.99}',
    NOW(),
    NOW(),
    NOW()
),
(
    'TEST003',
    'BUZO-DEPORTIVO-003',
    'Buzo Deportivo Unisex',
    'Buzo deportivo con capucha, ideal para entrenamientos y uso casual. Material transpirable y cómodo.',
    35.99,
    12,
    'deportivo',
    'SportLine',
    '/placeholder.svg?height=400&width=400&text=Buzo+Deportivo+Unisex',
    true,
    true,
    '{"codigo": "BUZO-DEPORTIVO-003", "stock": 12, "categoria": "deportivo", "marca": "SportLine", "precio": 35.99}',
    NOW(),
    NOW(),
    NOW()
),
(
    'TEST004',
    'REMERA-ESTAMPADA-004',
    'Remera Estampada Mujer',
    'Remera con estampado moderno, perfecta para looks casuales. Tela suave y diseño contemporáneo.',
    22.99,
    20,
    'mujer',
    'TrendyStyle',
    '/placeholder.svg?height=400&width=400&text=Remera+Estampada+Mujer',
    true,
    false,
    '{"codigo": "REMERA-ESTAMPADA-004", "stock": 20, "categoria": "mujer", "marca": "TrendyStyle", "precio": 22.99}',
    NOW(),
    NOW(),
    NOW()
),
(
    'TEST005',
    'CANGURO-URBANO-005',
    'Canguro Urbano Hombre',
    'Canguro con diseño urbano moderno, cómodo y versátil. Ideal para el día a día y actividades casuales.',
    42.99,
    6,
    'hombre',
    'UrbanWear',
    '/placeholder.svg?height=400&width=400&text=Canguro+Urbano+Hombre',
    true,
    true,
    '{"codigo": "CANGURO-URBANO-005", "stock": 6, "categoria": "hombre", "marca": "UrbanWear", "precio": 42.99}',
    NOW(),
    NOW(),
    NOW()
),
(
    'TEST006',
    'VESTIDO-CASUAL-006',
    'Vestido Casual Mujer',
    'Vestido casual elegante para mujer. Perfecto para ocasiones especiales y uso diario. Diseño moderno y cómodo.',
    55.99,
    10,
    'mujer',
    'ElegantWear',
    '/placeholder.svg?height=400&width=400&text=Vestido+Casual+Mujer',
    true,
    true,
    '{"codigo": "VESTIDO-CASUAL-006", "stock": 10, "categoria": "mujer", "marca": "ElegantWear", "precio": 55.99}',
    NOW(),
    NOW(),
    NOW()
),
(
    'TEST007',
    'CAMISA-FORMAL-007',
    'Camisa Formal Hombre',
    'Camisa formal de vestir para hombre. Ideal para oficina y eventos formales. Corte clásico y elegante.',
    38.99,
    14,
    'hombre',
    'FormalStyle',
    '/placeholder.svg?height=400&width=400&text=Camisa+Formal+Hombre',
    true,
    false,
    '{"codigo": "CAMISA-FORMAL-007", "stock": 14, "categoria": "hombre", "marca": "FormalStyle", "precio": 38.99}',
    NOW(),
    NOW(),
    NOW()
),
(
    'TEST008',
    'ZAPATILLAS-DEPORTIVAS-008',
    'Zapatillas Deportivas Unisex',
    'Zapatillas deportivas cómodas para running y actividades físicas. Suela antideslizante y diseño ergonómico.',
    75.99,
    18,
    'calzado',
    'RunFast',
    '/placeholder.svg?height=400&width=400&text=Zapatillas+Deportivas',
    true,
    true,
    '{"codigo": "ZAPATILLAS-DEPORTIVAS-008", "stock": 18, "categoria": "calzado", "marca": "RunFast", "precio": 75.99}',
    NOW(),
    NOW(),
    NOW()
),
-- Agregando producto gratuito para pruebas sin pago
(
    'TEST009',
    'MUESTRA-GRATIS-009',
    'Muestra Gratuita - Sticker Pack',
    'Pack de stickers promocionales gratuitos. Perfecto para probar el proceso de compra sin costo. Incluye 5 stickers de diferentes diseños.',
    0.00,
    100,
    'promocional',
    'OxStore',
    '/placeholder.svg?height=400&width=400&text=Muestra+Gratuita',
    true,
    true,
    '{"codigo": "MUESTRA-GRATIS-009", "stock": 100, "categoria": "promocional", "marca": "OxStore", "precio": 0.00}',
    NOW(),
    NOW(),
    NOW()
);

-- Actualizar el estado de sincronización
INSERT INTO sync_status (
    sync_type,
    status,
    total_records,
    last_sync_at,
    created_at,
    updated_at
) VALUES (
    'products_test',
    'completed',
    9, -- Actualizado de 8 a 9 productos
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (sync_type) DO UPDATE SET
    status = EXCLUDED.status,
    total_records = EXCLUDED.total_records,
    last_sync_at = EXCLUDED.last_sync_at,
    updated_at = EXCLUDED.updated_at;

-- Verificar que los productos se insertaron correctamente
SELECT 
    COUNT(*) as total_productos,
    SUM(stock_quantity) as stock_total,
    COUNT(CASE WHEN is_featured = true THEN 1 END) as productos_destacados
FROM products_in_stock 
WHERE zureo_id LIKE 'TEST%';
