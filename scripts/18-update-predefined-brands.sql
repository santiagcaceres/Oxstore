-- Creando marcas predefinidas específicas solicitadas por el usuario
-- Eliminar marcas existentes y crear las nuevas marcas predefinidas
DELETE FROM brands;

-- Insertar las marcas predefinidas específicas
INSERT INTO brands (name, slug, created_at, updated_at) VALUES
('MISTRAL', 'mistral', NOW(), NOW()),
('UNIFORM', 'uniform', NOW(), NOW()),
('LEVI', 'levi', NOW(), NOW()),
('XKETZIA', 'xketzia', NOW(), NOW()),
('INDIANA', 'indiana', NOW(), NOW()),
('KABOA', 'kaboa', NOW(), NOW()),
('EMPATHIA', 'empathia', NOW(), NOW()),
('ROTUNDA', 'rotunda', NOW(), NOW()),
('LEMON', 'lemon', NOW(), NOW()),
('GATTO PARDO', 'gatto-pardo', NOW(), NOW()),
('MINOT', 'minot', NOW(), NOW()),
('MANDAL', 'mandal', NOW(), NOW()),
('SYMPHORI', 'symphori', NOW(), NOW()),
('NEUFO', 'neufo', NOW(), NOW()),
('BROOKSFIELD', 'brooksfield', NOW(), NOW()),
('PEGUIN', 'peguin', NOW(), NOW());

-- Crear categorías predefinidas
INSERT INTO categories (name, slug, created_at, updated_at) VALUES
('Camisetas', 'camisetas', NOW(), NOW()),
('Jeans', 'jeans', NOW(), NOW()),
('Buzos', 'buzos', NOW(), NOW()),
('Vestidos', 'vestidos', NOW(), NOW()),
('Camisas', 'camisas', NOW(), NOW()),
('Zapatillas', 'zapatillas', NOW(), NOW()),
('Accesorios', 'accesorios', NOW(), NOW()),
('Pantalones', 'pantalones', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
