import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_EMAIL = 'Loiê <noreply@loiecandles.com>';

function buildTrackingEmailHtml(customerName: string, trackingCode: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Seu pedido foi enviado</title>
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
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;font-size:15px;color:#5a4a3f;line-height:1.6;">Olá, ${customerName.split(' ')[0]},</p>
              <p style="margin:0 0 24px;font-size:15px;color:#5a4a3f;line-height:1.6;">
                Temos uma ótima notícia: seu pedido foi enviado e já está a caminho. ✨
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;border-radius:4px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.15em;color:#9c8677;text-transform:uppercase;">Código de rastreio</p>
                    <p style="margin:0;font-size:20px;letter-spacing:0.08em;color:#3a2e26;font-family:monospace;">${trackingCode}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 24px;font-size:14px;color:#7a6a60;line-height:1.6;">
                Use esse código para acompanhar a entrega diretamente no site dos Correios ou da transportadora responsável.
              </p>
              <p style="margin:0;font-size:14px;color:#7a6a60;line-height:1.6;">
                Qualquer dúvida, basta responder este e-mail. 🕯️
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px 40px;border-top:1px solid #e8dfd4;">
              <p style="margin:0;font-size:11px;color:#b0a090;letter-spacing:0.05em;">
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

  try {
    const { order_id, tracking_code } = await req.json();

    if (!order_id || !tracking_code) {
      return new Response(
        JSON.stringify({ error: 'order_id e tracking_code são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = getSupabaseAdmin();

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('customer_name, customer_email')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Pedido não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const sentAt = new Date().toISOString();

    // Save tracking code and sent_at
    const { error: updateError } = await supabase
      .from('orders')
      .update({ tracking_code, tracking_email_sent_at: sentAt })
      .eq('id', order_id);

    if (updateError) throw updateError;

    // Send email via Resend
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      console.warn('RESEND_API_KEY not set — e-mail not sent');
      return new Response(
        JSON.stringify({ sent_at: sentAt, warning: 'RESEND_API_KEY não configurado' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const emailRes = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [order.customer_email],
        subject: 'Seu pedido Loiê foi enviado 🕯️',
        html: buildTrackingEmailHtml(order.customer_name, tracking_code),
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      console.error('Resend error:', errBody);
      throw new Error(`Resend API error: ${emailRes.status}`);
    }

    return new Response(
      JSON.stringify({ sent_at: sentAt }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('send-tracking-email error:', err);
    return new Response(
      JSON.stringify({ error: 'Erro ao enviar e-mail de rastreio' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
