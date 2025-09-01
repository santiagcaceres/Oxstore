-- Fixing RLS policies to allow product insertion and reading
-- Enable RLS on products_in_stock table
ALTER TABLE public.products_in_stock ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow authenticated insert/update on products_in_stock" ON public.products_in_stock;
DROP POLICY IF EXISTS "Allow public read access to products_in_stock" ON public.products_in_stock;

-- Create permissive policies for products_in_stock
CREATE POLICY "Allow all operations on products_in_stock" ON public.products_in_stock
FOR ALL USING (true) WITH CHECK (true);

-- Enable RLS on other tables and create permissive policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on products" ON public.products
FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on sync_status" ON public.sync_status
FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on banners" ON public.banners
FOR ALL USING (true) WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.products_in_stock TO authenticated;
GRANT ALL ON public.products_in_stock TO anon;
GRANT ALL ON public.sync_status TO authenticated;
GRANT ALL ON public.sync_status TO anon;
