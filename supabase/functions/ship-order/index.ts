import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';

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

    // Update order status and tracking code
    const { data: order, error } = await supabase
      .from('orders')
      .update({ status: 'shipped', tracking_code })
      .eq('id', order_id)
      .select('customer_name, customer_email, id')
      .single();

    if (error) throw error;
    if (!order) throw new Error('Pedido não encontrado');

    // Fire-and-forget: send tracking email
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY ?? '',
      },
      body: JSON.stringify({
        type: 'tracking',
        payload: {
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          order_id: order.id,
          tracking_code,
        },
      }),
    }).catch((err) => console.error('Failed to send tracking email:', err));

    console.log(`Order ${order_id} marked as shipped, tracking: ${tracking_code}`);

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('ship-order error:', err);
    return new Response(
      JSON.stringify({ error: 'Erro ao atualizar pedido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
