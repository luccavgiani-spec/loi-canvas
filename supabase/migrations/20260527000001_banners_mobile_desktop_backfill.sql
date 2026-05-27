-- =========================================================================
-- Backfill dos banners da home para o novo schema mobile/desktop.
--
-- Antes: cada item em site_content_list_items (home, hero, banners) tinha
-- apenas { "url": "<url>" }. O HeroSection renderizava a mesma imagem em
-- todos os viewports.
--
-- Agora: o schema do ListItemsEditor passa a expor url_desktop, url_mobile
-- e alt_text. Para que os banners atuais não desapareçam após o deploy,
-- copiamos fields.url para os dois novos campos (apenas quando o destino
-- ainda não existir — torna a migração idempotente).
-- =========================================================================

UPDATE public.site_content_list_items
SET fields = fields
  || jsonb_build_object(
       'url_desktop', COALESCE(fields->>'url_desktop', fields->>'url'),
       'url_mobile',  COALESCE(fields->>'url_mobile',  fields->>'url')
     )
WHERE page_key   = 'home'
  AND section_key = 'hero'
  AND list_key    = 'banners'
  AND fields ? 'url';
