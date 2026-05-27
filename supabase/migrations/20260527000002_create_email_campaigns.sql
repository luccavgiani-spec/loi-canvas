-- =========================================================================
-- email_campaigns: persistência das campanhas de e-mail do painel admin.
--
-- A aba /admin > Campanhas era um formulário ephemeral: o admin escrevia
-- assunto + conteúdo e a Edge Function send-campaign disparava direto pro
-- Resend sem deixar rastro. Esta tabela passa a guardar rascunhos, registra
-- quando a campanha entrou em envio e quantos destinatários receberam.
--
-- RLS segue o padrão das demais tabelas admin (site_content, products):
-- leitura/escrita gated por membership em public.admin_users.
-- =========================================================================

CREATE TABLE public.email_campaigns (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject           text NOT NULL,
  html_content      text NOT NULL,
  status            text NOT NULL DEFAULT 'draft',
  recipients_count  integer NOT NULL DEFAULT 0,
  sent_at           timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_campaigns_status_check
    CHECK (status IN ('draft', 'sending', 'sent', 'failed'))
);

CREATE INDEX email_campaigns_created_at_idx
  ON public.email_campaigns (created_at DESC);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin can read email_campaigns"
  ON public.email_campaigns
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "admin can insert email_campaigns"
  ON public.email_campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "admin can update email_campaigns"
  ON public.email_campaigns
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

CREATE POLICY "admin can delete email_campaigns"
  ON public.email_campaigns
  FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE admin_users.user_id = auth.uid()));

-- Reaproveita o trigger genérico de updated_at já criado em
-- 20260513000001_create_site_content_tables.sql.
CREATE TRIGGER email_campaigns_touch_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.touch_site_content_updated_at();
