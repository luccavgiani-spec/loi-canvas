-- v2.1 — Hierarquia de coleções + cleanup Matéria/Atmosfera

-- a) Renomear coleção existente: slug 'borrifadores' -> 'materia'.
--    A coleção atual chamada "Matéria" tinha slug 'borrifadores' por anomalia
--    histórica. Preserva produto 'toca' (continua via collection_id).
UPDATE collections
SET slug = 'materia'
WHERE slug = 'borrifadores' AND name = 'Matéria';

-- b) Apagar produto 'Atmosfera' (vai virar coleção; já confirmado 0 deps em
--    order_items, product_images, reviews).
DELETE FROM products WHERE id = 'cab24905-b1bb-45ec-aacd-72a11d243a74';

-- c) Coluna de hierarquia
ALTER TABLE collections
  ADD COLUMN parent_collection_id UUID REFERENCES collections(id) ON DELETE SET NULL;
CREATE INDEX collections_parent_idx ON collections(parent_collection_id);

-- d) Coleções-pai
INSERT INTO collections (slug, name, sort_order, is_active) VALUES
  ('velas',        'Velas',        0, true),
  ('borrifadores', 'Borrifadores', 1, true),
  ('corpo',        'Corpo',        2, true)
ON CONFLICT (slug) DO NOTHING;

-- e) Coleção-filha 'atmosfera' (vazia inicialmente)
INSERT INTO collections (slug, name, sort_order, is_active) VALUES
  ('atmosfera', 'Atmosfera', 1, true)
ON CONFLICT (slug) DO NOTHING;

-- f) Backfill parent_collection_id
UPDATE collections
SET parent_collection_id = (SELECT id FROM collections WHERE slug = 'velas')
WHERE slug IN ('cotidianas', 'sala-ou-estar', 'refugio', 'botanicas-e-florais');

UPDATE collections
SET parent_collection_id = (SELECT id FROM collections WHERE slug = 'borrifadores')
WHERE slug IN ('materia', 'atmosfera');
