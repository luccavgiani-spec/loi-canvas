-- =========================================================================
-- site_content + site_content_list_items
-- Tabelas que alimentam a aba "Configurações Gerais" do painel admin.
-- =========================================================================

-- ---- site_content -------------------------------------------------------
CREATE TABLE public.site_content (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key                 text NOT NULL,
  section_key              text NOT NULL,
  block_key                text NOT NULL,
  content_type             text NOT NULL CHECK (content_type IN ('text','rich_text','image','video','product_ref','collection_ref','url')),
  value_text               text,
  value_image_url          text,
  value_video_url          text,
  value_ref_id             uuid,
  value_url                text,
  presentation_overrides   jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_visible               boolean NOT NULL DEFAULT true,
  updated_at               timestamptz NOT NULL DEFAULT now(),
  updated_by               uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (page_key, section_key, block_key)
);

CREATE INDEX site_content_page_section_idx
  ON public.site_content (page_key, section_key);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can read site_content"
  ON public.site_content
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "admin can insert site_content"
  ON public.site_content
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "admin can update site_content"
  ON public.site_content
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "admin can delete site_content"
  ON public.site_content
  FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));


-- ---- site_content_list_items -------------------------------------------
CREATE TABLE public.site_content_list_items (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key                 text NOT NULL,
  section_key              text NOT NULL,
  list_key                 text NOT NULL,
  item_index               int NOT NULL,
  fields                   jsonb NOT NULL DEFAULT '{}'::jsonb,
  presentation_overrides   jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_visible               boolean NOT NULL DEFAULT true,
  updated_at               timestamptz NOT NULL DEFAULT now(),
  updated_by               uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX site_content_list_items_page_section_list_idx
  ON public.site_content_list_items (page_key, section_key, list_key, item_index);

ALTER TABLE public.site_content_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can read site_content_list_items"
  ON public.site_content_list_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "admin can insert site_content_list_items"
  ON public.site_content_list_items
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "admin can update site_content_list_items"
  ON public.site_content_list_items
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "admin can delete site_content_list_items"
  ON public.site_content_list_items
  FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));


-- ---- Trigger genérico de updated_at -----------------------------------
CREATE OR REPLACE FUNCTION public.touch_site_content_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER site_content_touch_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.touch_site_content_updated_at();

CREATE TRIGGER site_content_list_items_touch_updated_at
  BEFORE UPDATE ON public.site_content_list_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_site_content_updated_at();
