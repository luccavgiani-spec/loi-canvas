-- =========================================================================
-- Backfill: adiciona o campo posicao_frase ('direita' por default)
-- nos itens existentes de lembrancas.galeria_intercalada.blocos.
-- Novos itens criados pelo painel já vêm com esse campo no schema.
-- =========================================================================

UPDATE public.site_content_list_items
SET fields = fields || jsonb_build_object('posicao_frase', 'direita')
WHERE page_key = 'lembrancas'
  AND section_key = 'galeria_intercalada'
  AND list_key = 'blocos'
  AND NOT (fields ? 'posicao_frase');
