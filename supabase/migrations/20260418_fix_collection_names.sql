-- ============================================================
-- Ajuste cosmético nos nomes de duas coleções.
-- Slugs e IDs permanecem inalterados — apenas o display name muda.
-- ============================================================
UPDATE public.collections
SET name = 'Botânicas & Florais'
WHERE id = 'fa7659f1-d811-4857-857f-8cd3c8724dd0';

UPDATE public.collections
SET name = 'Sala'
WHERE id = 'cb2419e0-5ae8-4a59-a8f4-89143ca81fba';
