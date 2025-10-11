-- Crear bucket para las imágenes de las obras
insert into storage.buckets (id, name, public) values ('artworks', 'artworks', true);

-- Política para permitir lectura pública de las imágenes
create policy "Public Access" on storage.objects for select using (bucket_id = 'artworks');

-- Política para permitir subida de imágenes (solo para usuarios autenticados en el futuro)
create policy "Allow uploads" on storage.objects for insert with check (bucket_id = 'artworks');

-- Política para permitir eliminación de imágenes
create policy "Allow deletes" on storage.objects for delete using (bucket_id = 'artworks');
