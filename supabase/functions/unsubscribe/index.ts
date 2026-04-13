import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';

const confirmationPage = (email: string) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Descadastro — LOIÊ</title>
</head>
<body style="margin:0;padding:0;background-color:#fcf5e0;font-family:Georgia,serif;color:#29241f;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="max-width:480px;margin:60px auto;padding:40px 32px;text-align:center;">
    <h1 style="font-size:24px;font-weight:400;letter-spacing:0.35em;text-transform:uppercase;margin:0 0 8px;">LOIÊ</h1>
    <div style="width:32px;height:1px;background-color:#726f09;margin:0 auto 32px;"></div>
    <h2 style="font-size:18px;font-weight:400;margin:0 0 16px;color:#29241f;">descadastro realizado</h2>
    <p style="font-size:14px;line-height:1.8;color:#9a9280;margin:0 0 12px;">
      O endereço <strong style="color:#29241f;">${email.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</strong> foi removido da nossa lista de comunicação.
    </p>
    <p style="font-size:14px;line-height:1.8;color:#9a9280;margin:0;">
      Se mudar de ideia, você pode se inscrever novamente a qualquer momento em nosso site.
    </p>
    <div style="margin-top:32px;font-size:11px;color:#b0a898;letter-spacing:0.1em;">loie.com.br</div>
  </div>
</body>
</html>`;

const errorPage = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Descadastro — LOIÊ</title>
</head>
<body style="margin:0;padding:0;background-color:#fcf5e0;font-family:Georgia,serif;color:#29241f;">
  <div style="max-width:480px;margin:60px auto;padding:40px 32px;text-align:center;">
    <h1 style="font-size:24px;font-weight:400;letter-spacing:0.35em;text-transform:uppercase;margin:0 0 32px;">LOIÊ</h1>
    <p style="font-size:14px;color:#9a9280;">Não foi possível processar o descadastro. Tente novamente ou entre em contato: contato@loie.com.br</p>
  </div>
</body>
</html>`;

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return new Response(errorPage, {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const supabase = getSupabaseAdmin();
    await supabase.from('newsletter').delete().eq('email', email);

    console.log(`Unsubscribed: ${email}`);

    return new Response(confirmationPage(email), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err) {
    console.error('unsubscribe error:', err);
    return new Response(errorPage, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
});
