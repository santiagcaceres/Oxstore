-- Insertar obra de prueba con las imágenes subidas
insert into "artworks" (
  title, 
  category, 
  subcategory, 
  price, 
  description, 
  detailed_description, 
  year, 
  dimensions, 
  technique, 
  status, 
  featured, 
  main_image_url
) values (
  'Bajo el Árbol Sagrado', 
  'acrilicos', 
  'espatula', 
  2800, 
  'Acrílico con espátula sobre lienzo, 60x80cm', 
  'Una obra que explora la conexión entre el ser humano y la naturaleza. Las figuras bajo el árbol representan momentos de contemplación y refugio espiritual. Ejecutada con técnica de espátula que aporta textura y profundidad emocional.', 
  2024, 
  '60 x 80 cm', 
  'Acrílico con espátula sobre lienzo', 
  'Disponible', 
  true, 
  '/images/bajo-arbol.jpeg'
);

-- Obtener el ID de la obra recién creada para agregar las imágenes adicionales
-- (Esto se ejecutará después de la inserción principal)
insert into "artwork_images" (artwork_id, image_url) 
select id, '/images/mujer-joven.jpeg' from artworks where title = 'Bajo el Árbol Sagrado'
union all
select id, '/images/retrato-acuarela.jpeg' from artworks where title = 'Bajo el Árbol Sagrado';
