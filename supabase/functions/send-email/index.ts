import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const FROM_ADDRESS = 'LOIÊ <contato@loie.com.br>';

/* ─── Brand layout wrapper ─── */
function wrapLayout(subject: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#fcf5e0;font-family:Georgia,'Cormorant Garamond',serif;color:#29241f;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#fcf5e0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background-color:#fcf5e0;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding:32px 0 24px;">
              <h1 style="margin:0;font-family:Georgia,'Cormorant Garamond',serif;font-size:28px;font-weight:400;letter-spacing:0.35em;color:#29241f;text-transform:uppercase;">LOIÊ</h1>
              <div style="width:40px;height:1px;background-color:#726f09;margin:10px auto 0;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 32px 40px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 32px 40px;border-top:1px solid #e8dfc8;">
              <p style="margin:0 0 4px;font-size:12px;color:#726f09;letter-spacing:0.15em;text-transform:uppercase;">com carinho,</p>
              <p style="margin:0;font-size:14px;color:#29241f;letter-spacing:0.1em;">a equipe Loiê</p>
              <p style="margin:12px 0 0;font-size:11px;color:#9a9280;">loie.com.br · contato@loie.com.br</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmt(n: number) {
  return `R$ ${n.toFixed(2).replace('.', ',')}`;
}

/* ─── Template: order_confirmed ─── */
interface OrderItem { name: string; qty: number; price: number }
interface OrderConfirmedPayload {
  customer_name: string;
  customer_email: string;
  order_id: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
}

function templateOrderConfirmed(p: OrderConfirmedPayload): { subject: string; html: string } {
  const subject = `Pedido #${p.order_id.slice(0, 8).toUpperCase()} recebido — obrigada, ${p.customer_name.split(' ')[0]}`;

  const itemRows = p.items.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e8dfc8;font-size:14px;color:#29241f;">${escHtml(i.name)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e8dfc8;font-size:14px;color:#9a9280;text-align:center;">${i.qty}×</td>
      <td style="padding:10px 0;border-bottom:1px solid #e8dfc8;font-size:14px;color:#29241f;text-align:right;">${fmt(i.price * i.qty)}</td>
    </tr>`).join('');

  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:400;color:#29241f;letter-spacing:0.05em;">seu pedido foi recebido</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#9a9280;letter-spacing:0.05em;">pedido #${p.order_id.slice(0, 8).toUpperCase()}</p>

    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#29241f;">
      Olá, ${escHtml(p.customer_name.split(' ')[0])}. Recebemos seu pedido com muito carinho e já estamos separando cada peça com atenção. Em breve você receberá uma notificação com o código de rastreio.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
      <thead>
        <tr>
          <th style="padding:10px 0;border-bottom:2px solid #726f09;font-size:11px;font-weight:400;color:#726f09;letter-spacing:0.15em;text-transform:uppercase;text-align:left;">Produto</th>
          <th style="padding:10px 8px;border-bottom:2px solid #726f09;font-size:11px;font-weight:400;color:#726f09;letter-spacing:0.15em;text-transform:uppercase;text-align:center;">Qtd</th>
          <th style="padding:10px 0;border-bottom:2px solid #726f09;font-size:11px;font-weight:400;color:#726f09;letter-spacing:0.15em;text-transform:uppercase;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:32px;">
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#9a9280;">Subtotal</td>
        <td style="padding:6px 0;font-size:13px;color:#29241f;text-align:right;">${fmt(p.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#9a9280;">Frete</td>
        <td style="padding:6px 0;font-size:13px;color:#29241f;text-align:right;">${p.shipping_cost === 0 ? 'Grátis' : fmt(p.shipping_cost)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0 0;font-size:15px;font-weight:600;color:#29241f;border-top:1px solid #e8dfc8;">Total</td>
        <td style="padding:10px 0 0;font-size:15px;font-weight:600;color:#726f09;text-align:right;border-top:1px solid #e8dfc8;">${fmt(p.total)}</td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;line-height:1.7;color:#9a9280;font-style:italic;">
      Cada vela Loiê é feita à mão, com tempo e intenção. Obrigada por confiar no nosso trabalho.
    </p>`;

  return { subject, html: wrapLayout(subject, body) };
}

/* ─── Template: tracking ─── */
interface TrackingPayload {
  customer_name: string;
  customer_email: string;
  order_id: string;
  tracking_code: string;
}

function templateTracking(p: TrackingPayload): { subject: string; html: string } {
  const subject = `Seu pedido está a caminho — rastreio disponível`;

  const body = `
    <h2 style="margin:0 0 24px;font-size:22px;font-weight:400;color:#29241f;letter-spacing:0.05em;">seu pedido foi postado</h2>

    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#29241f;">
      ${escHtml(p.customer_name.split(' ')[0])}, sua encomenda acaba de ser entregue aos Correios. Use o código abaixo para acompanhar a entrega:
    </p>

    <div style="background-color:#f5edd6;border:1px solid #e8dfc8;border-radius:6px;padding:24px;text-align:center;margin-bottom:32px;">
      <p style="margin:0 0 6px;font-size:11px;color:#726f09;letter-spacing:0.2em;text-transform:uppercase;">código de rastreio</p>
      <p style="margin:0;font-size:24px;font-weight:600;letter-spacing:0.2em;color:#29241f;">${escHtml(p.tracking_code)}</p>
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:32px;">
      <tr>
        <td align="center">
          <a href="https://rastreamento.correios.com.br/app/index.php?lang=pt_BR&ob=${encodeURIComponent(p.tracking_code)}"
             style="display:inline-block;padding:14px 32px;background-color:#726f09;color:#fcf5e0;text-decoration:none;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;border-radius:2px;">
            Rastrear pedido
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:14px;line-height:1.7;color:#9a9280;">
      Você também pode rastrear diretamente em <a href="https://rastreamento.correios.com.br" style="color:#726f09;">rastreamento.correios.com.br</a>.
    </p>

    <p style="margin:16px 0 0;font-size:14px;line-height:1.7;color:#29241f;font-style:italic;">
      Esperamos que sua vela chegue cheia de boa energia e que ilumine muitos momentos especiais.
    </p>`;

  return { subject, html: wrapLayout(subject, body) };
}

/* ─── Template: welcome ─── */
interface WelcomePayload {
  customer_name: string;
  customer_email: string;
}

function templateWelcome(p: WelcomePayload): { subject: string; html: string } {
  const subject = `Bem-vinda à família Loiê, ${p.customer_name.split(' ')[0]}`;

  const body = `
    <h2 style="margin:0 0 24px;font-size:22px;font-weight:400;color:#29241f;letter-spacing:0.05em;">bem-vinda à família Loiê</h2>

    <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#29241f;">
      ${escHtml(p.customer_name.split(' ')[0])}, que alegria ter você aqui. Cada vela que sai daqui carrega um pouco do nosso cuidado — e agora também um pouco da sua história.
    </p>

    <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#29241f;">
      Acreditamos que os rituais cotidianos têm o poder de transformar o ordinário em algo memorável. Seja ao acender uma vela antes de dormir, ao presentear alguém especial ou ao criar um ambiente que fale de quem você é — estamos aqui para fazer parte desses momentos.
    </p>

    <p style="margin:0 0 32px;font-size:15px;line-height:1.8;color:#29241f;">
      Fique à vontade para explorar nossas coleções sempre que quiser acrescentar um novo ritual à sua rotina.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:32px;">
      <tr>
        <td align="center">
          <a href="https://loie.com.br"
             style="display:inline-block;padding:14px 32px;background-color:#726f09;color:#fcf5e0;text-decoration:none;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;border-radius:2px;">
            Explorar coleções
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;line-height:1.7;color:#9a9280;font-style:italic;">
      Com carinho e gratidão pela sua confiança.
    </p>`;

  return { subject, html: wrapLayout(subject, body) };
}

/* ─── Template: campaign ─── */
interface CampaignPayload {
  subject: string;
  html_content: string;
  recipient_email: string;
}

function templateCampaign(p: CampaignPayload, supabaseUrl: string): { subject: string; html: string } {
  const unsubUrl = `${supabaseUrl}/functions/v1/unsubscribe?email=${encodeURIComponent(p.recipient_email)}`;

  const body = `
    <h2 style="margin:0 0 24px;font-size:22px;font-weight:400;color:#29241f;letter-spacing:0.05em;">${escHtml(p.subject)}</h2>

    <div style="font-size:15px;line-height:1.8;color:#29241f;">
      ${p.html_content}
    </div>

    <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e8dfc8;text-align:center;">
      <p style="margin:0;font-size:11px;color:#b0a898;">
        Você recebeu este e-mail porque está inscrito(a) na lista Loiê.<br />
        <a href="${unsubUrl}" style="color:#9a9280;text-decoration:underline;">Cancelar inscrição</a>
      </p>
    </div>`;

  return { subject: p.subject, html: wrapLayout(p.subject, body) };
}

/* ─── Main handler ─── */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const { type, payload } = await req.json();

    if (!type || !payload) {
      return new Response(
        JSON.stringify({ error: 'type e payload são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    let subject: string;
    let html: string;
    let to: string;

    switch (type) {
      case 'order_confirmed': {
        const p = payload as OrderConfirmedPayload;
        to = p.customer_email;
        ({ subject, html } = templateOrderConfirmed(p));
        break;
      }
      case 'tracking': {
        const p = payload as TrackingPayload;
        to = p.customer_email;
        ({ subject, html } = templateTracking(p));
        break;
      }
      case 'welcome': {
        const p = payload as WelcomePayload;
        to = p.customer_email;
        ({ subject, html } = templateWelcome(p));
        break;
      }
      case 'campaign': {
        const p = payload as CampaignPayload;
        to = p.recipient_email;
        ({ subject, html } = templateCampaign(p, SUPABASE_URL));
        break;
      }
      default:
        return new Response(
          JSON.stringify({ error: `Tipo de e-mail desconhecido: ${type}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.json().catch(() => ({}));
      console.error('Resend error:', resendRes.status, err);
      throw new Error(`Resend API error: ${resendRes.status}`);
    }

    const result = await resendRes.json();
    console.log(`Email [${type}] sent to ${to} — id: ${result.id}`);

    return new Response(
      JSON.stringify({ ok: true, id: result.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('send-email error:', err);
    return new Response(
      JSON.stringify({ error: 'Erro ao enviar e-mail' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
