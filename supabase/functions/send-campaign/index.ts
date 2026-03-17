import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_EMAIL = 'Loiê <noreply@loiecandles.com>';

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
              <p style="margin:0;font-size:11px;color:#b0a090;">
                <a href="#" style="color:#9c8677;text-decoration:underline;">Descadastrar</a>
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

  try {
    const { subject, html_content } = await req.json();

    if (!subject || !html_content) {
      return new Response(
        JSON.stringify({ error: 'subject e html_content são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = getSupabaseAdmin();

    // Collect emails from orders (non-cancelled)
    const { data: orderRows } = await supabase
      .from('orders')
      .select('customer_email')
      .neq('status', 'cancelled');

    // Collect emails from newsletter
    const { data: newsletterRows } = await supabase
      .from('newsletter')
      .select('email');

    const emailSet = new Set<string>();
    for (const row of orderRows || []) {
      if (row.customer_email) emailSet.add(row.customer_email.toLowerCase().trim());
    }
    for (const row of newsletterRows || []) {
      if (row.email) emailSet.add(row.email.toLowerCase().trim());
    }

    const emails = Array.from(emailSet);
    if (emails.length === 0) {
      return new Response(
        JSON.stringify({ count: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      return new Response(
        JSON.stringify({ count: 0, warning: 'RESEND_API_KEY não configurado' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const html = buildCampaignHtml(subject, html_content);
    let sent = 0;

    // Send in batches of 50 (Resend batch limit)
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
          subject,
          html,
        }),
      });
      if (res.ok) {
        sent += batch.length;
      } else {
        console.error(`Resend batch error (${i}-${i + BATCH}):`, await res.text());
      }
    }

    return new Response(
      JSON.stringify({ count: sent }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('send-campaign error:', err);
    return new Response(
      JSON.stringify({ error: 'Erro ao enviar campanha' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
