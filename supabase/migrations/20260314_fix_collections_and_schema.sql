-- =============================================
-- 1. Add UI columns to collections table
-- =============================================
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS numeral TEXT;
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS detail TEXT;
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS story TEXT;
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS price_label TEXT;

-- =============================================
-- 2. Upsert all 4 collections with full UI data
-- =============================================

-- I — Cotidianas
INSERT INTO public.collections (slug, name, description, numeral, detail, story, price_label, is_active, sort_order)
VALUES (
  'cotidianas',
  'Cotidianas',
  'Latinha de 160g, dois pavios. Aromas básicos muito bem feitos. Um presente perfeito como lembrança.',
  'I',
  'Latinha 160g · dois pavios',
  'Uma breve apresentação da marca com um básico muito bem feito numa latinha aesthetic. Os aromas mais essenciais para o dia a dia. Um presente muito bom como lembrança.',
  'a partir de R$ 72',
  true,
  0
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  numeral = EXCLUDED.numeral,
  detail = EXCLUDED.detail,
  story = EXCLUDED.story,
  price_label = EXCLUDED.price_label,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- II — Sala ou Estar
INSERT INTO public.collections (slug, name, description, numeral, detail, story, price_label, is_active, sort_order)
VALUES (
  'sala-ou-estar',
  'Sala ou Estar',
  'Copo transparente de 200g, um pavio. Criações autorais com óleos essenciais puros.',
  'II',
  'Copo 200g transparente · um pavio',
  'Criações autorais com óleos essenciais puros. Cada fragrância foi desenvolvida para transformar a sala em um ambiente de presença e acolhimento.',
  'a partir de R$ 172',
  true,
  1
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  numeral = EXCLUDED.numeral,
  detail = EXCLUDED.detail,
  story = EXCLUDED.story,
  price_label = EXCLUDED.price_label,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- III — Refúgio
INSERT INTO public.collections (slug, name, description, numeral, detail, story, price_label, is_active, sort_order)
VALUES (
  'refugio',
  'Refúgio',
  'Copo âmbar de 300g, um pavio. Composições aromáticas exclusivas com assinatura Loiê.',
  'III',
  'Copo âmbar 300g · um pavio',
  'Um copo com presença e composições aromáticas exclusivas. Algumas criações autorais e outras com fragrâncias encomendadas e modificadas para ter a assinatura Loiê.',
  'a partir de R$ 260',
  true,
  2
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  numeral = EXCLUDED.numeral,
  detail = EXCLUDED.detail,
  story = EXCLUDED.story,
  price_label = EXCLUDED.price_label,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- IV — Botânicas e Florais
INSERT INTO public.collections (slug, name, description, numeral, detail, story, price_label, is_active, sort_order)
VALUES (
  'botanicas-e-florais',
  'Botânicas e Florais',
  'Copo de 400g, dois pavios. Aromas exclusivos para queimas longas e envolventes.',
  'IV',
  'Copo 400g · dois pavios',
  'Aromas que consideramos exclusivos e ideais para queimas de dois pavios. Fragrâncias botânicas e florais que preenchem espaços maiores com sofisticação.',
  'a partir de R$ 332',
  true,
  3
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  numeral = EXCLUDED.numeral,
  detail = EXCLUDED.detail,
  story = EXCLUDED.story,
  price_label = EXCLUDED.price_label,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- =============================================
-- 3. Update test product "Vela Teste" to use
--    the correct collection_id (Cotidianas)
-- =============================================
UPDATE public.products
SET collection_id = (SELECT id FROM public.collections WHERE slug = 'cotidianas' LIMIT 1)
WHERE id = '00000000-0000-0000-0000-000000000001'
  AND collection_id IS NULL;

-- =============================================
-- 4. RLS: allow public read on collections
-- =============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='collections' AND policyname='collections_public_read') THEN
    CREATE POLICY "collections_public_read" ON public.collections FOR SELECT USING (true);
  END IF;
END $$;
