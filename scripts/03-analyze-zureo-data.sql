-- Analizar la estructura de zureo_data para entender las variantes
SELECT 
    zureo_code,
    name,
    jsonb_pretty(zureo_data) as zureo_data_formatted,
    jsonb_typeof(zureo_data->'atributos') as atributos_type,
    jsonb_typeof(zureo_data->'variantes') as variantes_type,
    jsonb_typeof(zureo_data->'varieties') as varieties_type
FROM products_in_stock 
WHERE zureo_data IS NOT NULL 
LIMIT 5;

-- Ver qué claves existen en zureo_data
SELECT DISTINCT jsonb_object_keys(zureo_data) as keys
FROM products_in_stock 
WHERE zureo_data IS NOT NULL;

-- Analizar atributos específicos
SELECT 
    zureo_code,
    name,
    zureo_data->'atributos' as atributos,
    zureo_data->'varieties' as varieties,
    zureo_data->'images' as images
FROM products_in_stock 
WHERE zureo_data IS NOT NULL 
AND (zureo_data ? 'atributos' OR zureo_data ? 'varieties')
LIMIT 3;
