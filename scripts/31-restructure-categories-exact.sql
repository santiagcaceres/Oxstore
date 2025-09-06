-- Reestructurar categorías según especificación exacta del usuario
-- 3 tipos principales: Vestimenta, Accesorios, Calzado
-- Solo mostrar categorías que tengan productos asignados

-- Limpiar estructura existente
DELETE FROM subcategories;
DELETE FROM categories;

-- Crear categorías principales
INSERT INTO categories (name, slug, parent_id, level, sort_order, is_active, type) VALUES
('vestimenta', 'vestimenta', NULL, 1, 1, true, 'category'),
('accesorios', 'accesorios', NULL, 1, 2, true, 'category'),
('calzado', 'calzado', NULL, 1, 3, true, 'category');

-- Obtener IDs de las categorías principales
DO $$
DECLARE
    vestimenta_id INTEGER;
    accesorios_id INTEGER;
    calzado_id INTEGER;
BEGIN
    SELECT id INTO vestimenta_id FROM categories WHERE slug = 'vestimenta';
    SELECT id INTO accesorios_id FROM categories WHERE slug = 'accesorios';
    SELECT id INTO calzado_id FROM categories WHERE slug = 'calzado';

    -- Subcategorías de ACCESORIOS (unisex)
    INSERT INTO subcategories (name, slug, category_id, gender, is_active, sort_order) VALUES
    ('Billeteras', 'billeteras', accesorios_id, 'unisex', true, 1),
    ('Carvanas', 'carvanas', accesorios_id, 'unisex', true, 2),
    ('Collares', 'collares', accesorios_id, 'unisex', true, 3),
    ('Mochilas', 'mochilas', accesorios_id, 'unisex', true, 4),
    ('Pañuelos', 'panuelos', accesorios_id, 'unisex', true, 5),
    ('Riñoneras', 'rinoneras', accesorios_id, 'unisex', true, 6);

    -- Subcategorías de VESTIMENTA - HOMBRE
    INSERT INTO subcategories (name, slug, category_id, gender, is_active, sort_order) VALUES
    ('Bermudas', 'bermudas-hombre', vestimenta_id, 'hombre', true, 1),
    ('Chaquetas', 'chaquetas-hombre', vestimenta_id, 'hombre', true, 2),
    ('Camisas', 'camisas-hombre', vestimenta_id, 'hombre', true, 3),
    ('Boxers', 'boxers', vestimenta_id, 'hombre', true, 4),
    ('Buzos y canguros', 'buzos-canguros-hombre', vestimenta_id, 'hombre', true, 5),
    ('Camperas y abrigos', 'camperas-abrigos-hombre', vestimenta_id, 'hombre', true, 6),
    ('Chalecos', 'chalecos-hombre', vestimenta_id, 'hombre', true, 7),
    ('Jeans', 'jeans-hombre', vestimenta_id, 'hombre', true, 8),
    ('Medias', 'medias-hombre', vestimenta_id, 'hombre', true, 9),
    ('Pantalones', 'pantalones-hombre', vestimenta_id, 'hombre', true, 10),
    ('Polos', 'polos-hombre', vestimenta_id, 'hombre', true, 11),
    ('Remeras y musculosas', 'remeras-musculosas-hombre', vestimenta_id, 'hombre', true, 12),
    ('Shorts', 'shorts-hombre', vestimenta_id, 'hombre', true, 13);

    -- Subcategorías de VESTIMENTA - MUJER
    INSERT INTO subcategories (name, slug, category_id, gender, is_active, sort_order) VALUES
    ('Bermudas', 'bermudas-mujer', vestimenta_id, 'mujer', true, 14),
    ('Blazers y chaquetas', 'blazers-chaquetas-mujer', vestimenta_id, 'mujer', true, 15),
    ('Blusas y camisas', 'blusas-camisas-mujer', vestimenta_id, 'mujer', true, 16),
    ('Buzos y canguros', 'buzos-canguros-mujer', vestimenta_id, 'mujer', true, 17),
    ('Camperas y abrigos', 'camperas-abrigos-mujer', vestimenta_id, 'mujer', true, 18),
    ('Chalecos', 'chalecos-mujer', vestimenta_id, 'mujer', true, 19),
    ('Jeans', 'jeans-mujer', vestimenta_id, 'mujer', true, 20),
    ('Mayas', 'mayas', vestimenta_id, 'mujer', true, 21),
    ('Medias', 'medias-mujer', vestimenta_id, 'mujer', true, 22),
    ('Pantalones', 'pantalones-mujer', vestimenta_id, 'mujer', true, 23),
    ('Polos', 'polos-mujer', vestimenta_id, 'mujer', true, 24),
    ('Remeras y musculosas', 'remeras-musculosas-mujer', vestimenta_id, 'mujer', true, 25),
    ('Sacos', 'sacos', vestimenta_id, 'mujer', true, 26),
    ('Shorts y monos', 'shorts-monos', vestimenta_id, 'mujer', true, 27),
    ('Vestidos y faldas', 'vestidos-faldas', vestimenta_id, 'mujer', true, 28);

    -- CALZADO no tiene subcategorías según especificación del usuario
    -- Se maneja como categoría general
END $$;

-- Crear función para verificar si una categoría tiene productos
CREATE OR REPLACE FUNCTION category_has_products(cat_slug TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    product_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count
    FROM products_in_stock p
    WHERE p.category ILIKE '%' || cat_slug || '%' 
       OR p.subcategory ILIKE '%' || cat_slug || '%';
    
    RETURN product_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Crear función para verificar si una subcategoría tiene productos
CREATE OR REPLACE FUNCTION subcategory_has_products(subcat_slug TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    product_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count
    FROM products_in_stock p
    WHERE p.subcategory ILIKE '%' || subcat_slug || '%';
    
    RETURN product_count > 0;
END;
$$ LANGUAGE plpgsql;
