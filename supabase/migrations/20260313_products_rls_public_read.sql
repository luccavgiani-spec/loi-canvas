-- Ensure RLS is enabled on products and allow public (anon) reads
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'products_public_read'
  ) THEN
    CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (true);
  END IF;
END
$$;
