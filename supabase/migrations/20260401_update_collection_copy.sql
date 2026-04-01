-- ============================================================
-- Add missing columns to collections (referenced in api.ts
-- but never added via migration)
-- ============================================================
ALTER TABLE public.collections
  ADD COLUMN IF NOT EXISTS numeral text,
  ADD COLUMN IF NOT EXISTS story text,
  ADD COLUMN IF NOT EXISTS detail text,
  ADD COLUMN IF NOT EXISTS price_label text;

-- ============================================================
-- Upsert vela collections with approved copy
-- ============================================================
INSERT INTO public.collections (slug, name, story, is_active, sort_order)
VALUES
  (
    'cotidianas',
    'Cotidianas',
    'velas pensadas para o uso contínuo. aromas diretos, equilibrados, que acompanham o ritmo da casa com naturalidade.',
    true,
    0
  ),
  (
    'sala-ou-estar',
    'Sala',
    'a coleção central da loiê. composições autorais marcantes que provam que somos amantes de rituais discretos.',
    true,
    1
  ),
  (
    'refugio',
    'Refúgio',
    'aromas mais densos e envolventes. velas que convidam ao recolhimento e à permanência.',
    true,
    2
  ),
  (
    'botanicas-e-florais',
    'Botânicas e Florais',
    'composições mais expressivas e detalhadas. um estudo sobre flores, folhas e matérias-primas em sua forma mais evidente.',
    true,
    3
  )
ON CONFLICT (slug) DO UPDATE SET
  story = EXCLUDED.story,
  name  = EXCLUDED.name;

-- ============================================================
-- Upsert borrifadores collections (new)
-- ============================================================
INSERT INTO public.collections (slug, name, story, is_active, sort_order)
VALUES
  (
    'materia',
    'Matéria',
    'perfumaria autoral construída a partir de óleos essenciais. um estudo sobre matéria-prima e construção aromática.',
    true,
    10
  ),
  (
    'atmosfera',
    'Atmosfera',
    'aromas de difusão imediata. composições que transformam o espaço com presença e projeção.',
    true,
    11
  )
ON CONFLICT (slug) DO UPDATE SET
  story = EXCLUDED.story,
  name  = EXCLUDED.name;
