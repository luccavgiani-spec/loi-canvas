import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_EMAIL = 'Loiê <noreply@loiecandles.com>';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function buildCampaignHtml(subject: string, htmlContent: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#fffdf9;border:1px solid #e8dfd4;border-radius:4px;overflow:hidden;max-width:580px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding:36px 40px 24px;border-bottom:1px solid #e8dfd4;">
              <p style="margin:0;font-size:26px;letter-spacing:0.15em;color:#3a2e26;font-weight:400;text-transform:uppercase;">L O I Ê</p>
              <p style="margin:6px 0 0;font-size:11px;letter-spacing:0.2em;color:#9c8677;text-transform:uppercase;">Velas artesanais</p>
            </td>
          </tr>
          <!-- Subject -->
          <tr>
            <td style="padding:32px 40px 0;">
              <h1 style="margin:0;font-size:22px;font-weight:400;color:#3a2e26;line-height:1.4;">${subject}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:20px 40px 36px;">
              <div style="font-size:15px;color:#5a4a3f;line-height:1.8;">${htmlContent.replace(/\n/g, '<br />')}</div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px 40px;border-top:1px solid #e8dfd4;">
              <p style="margin:0 0 6px;font-size:11px;color:#b0a090;letter-spacing:0.05em;">
                © ${new Date().getFullYear()} Loiê · Velas artesanais feitas com intenção
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = getSupabaseAdmin();

  // ── Gate: o painel ainda não tem login obrigatório front-end, então a função
  // verifica o JWT do chamador e exige membership em admin_users antes de mexer
  // em destinatários e Resend. verify_jwt=true no config.toml impede chamadas
  // sem token; a verificação de admin é feita aqui.
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Missing authorization' }, 401);

  const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !user) return json({ error: 'Unauthorized' }, 401);

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!adminRow) return json({ error: 'Forbidden' }, 403);

  try {
    const { campaign_id } = await req.json().catch(() => ({}));
    if (!campaign_id) return json({ error: 'campaign_id é obrigatório' }, 400);

    const { data: campaign, error: cErr } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaign_id)
      .single();
    if (cErr || !campaign) return json({ error: 'Campanha não encontrada' }, 404);

    if (campaign.status === 'sending') {
      return json({ error: 'Campanha já está em envio' }, 409);
    }

    // Marca como "sending" antes de qualquer chamada externa, pra UI refletir o
    // estado real e bloquear cliques duplicados.
    await supabase
      .from('email_campaigns')
      .update({ status: 'sending' })
      .eq('id', campaign_id);

    // Coleta destinatários: orders.customer_email ∪ customers.email ∪ newsletter.email,
    // com deduplicação case-insensitive.
    const [ordersRes, customersRes, newsletterRes] = await Promise.all([
      supabase.from('orders').select('customer_email').neq('status', 'cancelled'),
      supabase.from('customers').select('email'),
      supabase.from('newsletter').select('email'),
    ]);

    const emailSet = new Set<string>();
    for (const row of ordersRes.data ?? []) {
      if (row.customer_email) emailSet.add(String(row.customer_email).toLowerCase().trim());
    }
    for (const row of customersRes.data ?? []) {
      if (row.email) emailSet.add(String(row.email).toLowerCase().trim());
    }
    for (const row of newsletterRes.data ?? []) {
      if (row.email) emailSet.add(String(row.email).toLowerCase().trim());
    }
    const emails = Array.from(emailSet);

    if (emails.length === 0) {
      await supabase
        .from('email_campaigns')
        .update({ status: 'sent', recipients_count: 0, sent_at: new Date().toISOString() })
        .eq('id', campaign_id);
      return json({ count: 0, status: 'sent' });
    }

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      await supabase
        .from('email_campaigns')
        .update({ status: 'failed' })
        .eq('id', campaign_id);
      return json({ error: 'RESEND_API_KEY não configurado' }, 500);
    }

    const html = buildCampaignHtml(campaign.subject, campaign.html_content);
    let sent = 0;
    let failedBatches = 0;
    const BATCH = 50;

    for (let i = 0; i < emails.length; i += BATCH) {
      const batch = emails.slice(i, i + BATCH);
      const res = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: batch,
          subject: campaign.subject,
          html,
        }),
      });
      if (res.ok) {
        sent += batch.length;
      } else {
        failedBatches += 1;
        console.error(`Resend batch error (${i}-${i + BATCH}):`, await res.text());
      }
    }

    // Tudo falhou → 'failed'; ao menos um lote saiu → 'sent' (com a contagem real).
    const allFailed = sent === 0 && failedBatches > 0;
    const finalStatus = allFailed ? 'failed' : 'sent';
    await supabase
      .from('email_campaigns')
      .update({
        status: finalStatus,
        recipients_count: sent,
        sent_at: allFailed ? null : new Date().toISOString(),
      })
      .eq('id', campaign_id);

    return json({ count: sent, status: finalStatus });
  } catch (err) {
    console.error('send-campaign error:', err);
    return json({ error: 'Erro ao enviar campanha' }, 500);
  }
});
