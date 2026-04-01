-- ============================================================
-- Internal messaging system — mensagens table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mensagens (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       text        NOT NULL,
  assunto    text,       -- optional: 'dúvida' | 'elogio' | 'outro'
  mensagem   text        NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Visitors can INSERT, nobody reads without auth
CREATE POLICY "mensagens_anon_insert"
  ON public.mensagens
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "mensagens_admin_select"
  ON public.mensagens
  FOR SELECT
  TO authenticated
  USING (true);
