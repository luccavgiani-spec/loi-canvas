-- =============================================
-- 1. Produto de teste para validar checkout (R$ 1,00)
-- =============================================
INSERT INTO public.products (id, slug, name, description, short_description, price, images, collection, tags, is_active, stock)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'vela-teste',
  'Vela Teste',
  'Produto de teste para validação do checkout. Não é um produto real.',
  'Produto de teste — R$ 1,00',
  1.00,
  '["https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/produtos/loie_vela_campos_principal.JPG"]'::jsonb,
  'Cotidianas',
  ARRAY['teste'],
  true,
  999
)
ON CONFLICT (id) DO UPDATE SET price = 1.00, is_active = true;

-- =============================================
-- 2. RLS policies para tabelas sensíveis
-- =============================================

-- ORDERS: service_role pode tudo, anon não lê
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='orders_service_insert') THEN
    CREATE POLICY "orders_service_insert" ON public.orders FOR INSERT TO service_role WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='orders_service_update') THEN
    CREATE POLICY "orders_service_update" ON public.orders FOR UPDATE TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='orders' AND policyname='orders_service_select') THEN
    CREATE POLICY "orders_service_select" ON public.orders FOR SELECT TO service_role USING (true);
  END IF;
END $$;

-- ORDER_ITEMS: service_role pode tudo, anon não lê
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='order_items' AND policyname='order_items_service_insert') THEN
    CREATE POLICY "order_items_service_insert" ON public.order_items FOR INSERT TO service_role WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='order_items' AND policyname='order_items_service_select') THEN
    CREATE POLICY "order_items_service_select" ON public.order_items FOR SELECT TO service_role USING (true);
  END IF;
END $$;

-- CUSTOMERS: service_role pode tudo, anon não lê
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='customers' AND policyname='customers_service_insert') THEN
    CREATE POLICY "customers_service_insert" ON public.customers FOR INSERT TO service_role WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='customers' AND policyname='customers_service_update') THEN
    CREATE POLICY "customers_service_update" ON public.customers FOR UPDATE TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='customers' AND policyname='customers_service_select') THEN
    CREATE POLICY "customers_service_select" ON public.customers FOR SELECT TO service_role USING (true);
  END IF;
END $$;

-- REVIEWS: leitura pública
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reviews' AND policyname='reviews_public_read') THEN
    CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT USING (true);
  END IF;
END $$;
