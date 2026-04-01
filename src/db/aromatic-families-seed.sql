-- Seed: Aromatic Family Collections
-- Run this in the Supabase SQL editor to create a collection row for each
-- olfactory family. These collections group candles by scent profile and
-- are surfaced in the footer "Família Aromática" filter.

INSERT INTO collections (slug, name, description, is_active, sort_order, created_at)
VALUES
  (
    'citricos-e-frescos',
    'Cítricos e Frescos',
    'Aromas leves e energizantes com notas cítricas, herbais e aquáticas. Perfeitos para o dia a dia.',
    true,
    10,
    now()
  ),
  (
    'verdes-e-verbais',
    'Verdes e Verbais',
    'Composições que evocam a natureza — folhas, ervas, madeiras verdes e frescor botânico.',
    true,
    20,
    now()
  ),
  (
    'florais',
    'Florais',
    'Aromas florais expresivos e detalhados, de pétalas delicadas a buquês sofisticados.',
    true,
    30,
    now()
  ),
  (
    'amadeirados',
    'Amadeirados',
    'Madeiras nobres, resinas e notas terrosas que trazem profundidade e elegância ao ambiente.',
    true,
    40,
    now()
  ),
  (
    'especiados-e-quentes',
    'Especiados e Quentes',
    'Especiarias, resinas e notas orientais que criam atmosferas envolventes e memoráveis.',
    true,
    50,
    now()
  ),
  (
    'gourmand-e-conforto',
    'Gourmand e Conforto',
    'Aromas doces e aconchegantes — baunilha, caramelo e especiarias que reconfortam.',
    true,
    60,
    now()
  )
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active   = EXCLUDED.is_active,
  sort_order  = EXCLUDED.sort_order;
