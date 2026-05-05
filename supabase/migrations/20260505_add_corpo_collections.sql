-- v2.1 hotfix — coleções-filhas de Corpo

INSERT INTO collections (slug, name, sort_order, is_active) VALUES
  ('barra-massagem', 'Barra para massagem', 0, true),
  ('oleo-corporal-massagem', 'Óleo Corporal para Massagem', 1, true)
ON CONFLICT (slug) DO NOTHING;

UPDATE collections
SET parent_collection_id = (SELECT id FROM collections WHERE slug = 'corpo')
WHERE slug IN ('barra-massagem', 'oleo-corporal-massagem');
