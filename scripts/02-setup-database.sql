-- Habilitar la extensión para generar UUIDs
create extension if not exists "uuid-ossp";

-- Tabla principal para las obras de arte
create table if not exists "artworks" (
  "id" uuid primary key default uuid_generate_v4(),
  "title" text not null,
  "category" text not null,
  "subcategory" text,
  "price" integer not null,
  "description" text,
  "detailed_description" text,
  "year" integer,
  "dimensions" text,
  "technique" text,
  "status" text not null default 'Disponible',
  "featured" boolean default false,
  "main_image_url" text,
  "created_at" timestamptz default now()
);

-- Tabla para la galería de imágenes de cada obra (relación uno-a-muchos)
create table if not exists "artwork_images" (
  "id" uuid primary key default uuid_generate_v4(),
  "artwork_id" uuid references artworks(id) on delete cascade,
  "image_url" text not null,
  "created_at" timestamptz default now()
);

-- Políticas de seguridad (RLS)
alter table "artworks" enable row level security;
alter table "artwork_images" enable row level security;

-- Permitir lectura pública de obras
create policy "Allow public read access on artworks" 
on "artworks" for select 
using (true);

-- Permitir lectura pública de imágenes
create policy "Allow public read access on artwork_images" 
on "artwork_images" for select 
using (true);

-- Insertar algunas obras de ejemplo
insert into "artworks" (title, category, subcategory, price, description, detailed_description, year, dimensions, technique, status, featured, main_image_url) values
('Encuentro Dramático', 'acrilicos', 'espatula', 2500, 'Acrílico sobre lienzo, 50x70cm', 'Una obra que explora las tensiones humanas a través del color y la forma.', 2024, '50 x 70 cm', 'Acrílico sobre lienzo', 'Vendida', true, '/images/obra-dramatica.jpeg'),
('Retrato Expresivo', 'oleos', null, 1900, 'Óleo sobre lienzo, 45x60cm', 'Un retrato intenso que captura la vulnerabilidad humana a través de tonos púrpuras y rosados.', 2024, '45 x 60 cm', 'Óleo sobre lienzo', 'Disponible', true, '/images/retrato-expresivo.jpeg'),
('Acuarela Vibrante', 'acuarelas', null, 850, 'Acuarela sobre papel, 30x40cm', 'Una explosión de color y emoción capturada en acuarela.', 2024, '30 x 40 cm', 'Acuarela sobre papel', 'Disponible', true, '/images/acuarela-colorida.jpeg'),
('Conexiones Rojas', 'oleos', null, 2800, 'Óleo sobre lienzo, 60x80cm', 'Una obra compleja que explora las conexiones invisibles entre las personas.', 2024, '60 x 80 cm', 'Óleo sobre lienzo', 'Disponible', true, '/images/hilos-rojos.jpeg'),
('Mujer en Reposo', 'acrilicos', null, 1600, 'Acrílico sobre lienzo, 50x65cm', 'Una escena doméstica que trasciende lo cotidiano.', 2024, '50 x 65 cm', 'Acrílico sobre lienzo', 'Disponible', true, '/images/mujer-sillon.jpeg');
