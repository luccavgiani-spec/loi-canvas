import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';

/**
 * Creates a Mercado Pago preference (Orders API - automatic mode) for transparent checkout.
 * The frontend uses the preference_id to render the Payment Brick.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ error: 'order_id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = getSupabaseAdmin();
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN');

    if (!MP_ACCESS_TOKEN) {
      throw new Error('MP_ACCESS_TOKEN not configured');
    }

    // Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Pedido não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*, products(name)')
      .eq('order_id', order_id);

    // Build Mercado Pago preference
    const items = (orderItems || []).map((item: any) => ({
      title: item.products?.name || 'Produto Loiê',
      quantity: item.qty,
      unit_price: Number(item.unit_price),
      currency_id: 'BRL',
    }));

    // Add shipping as an item if applicable
    if (order.shipping_cost && order.shipping_cost > 0) {
      items.push({
        title: 'Frete',
        quantity: 1,
        unit_price: Number(order.shipping_cost),
        currency_id: 'BRL',
      });
    }

    const WEBHOOK_URL = Deno.env.get('MP_WEBHOOK_URL');

    const preferenceBody = {
      items,
      payer: {
        name: order.customer_name,
        email: order.customer_email,
      },
      external_reference: order_id,
      ...(WEBHOOK_URL ? { notification_url: WEBHOOK_URL } : {}),
      back_urls: {
        success: `${Deno.env.get('SITE_URL') || 'https://loie-commerce-spark.lovable.app'}/checkout?status=approved`,
        failure: `${Deno.env.get('SITE_URL') || 'https://loie-commerce-spark.lovable.app'}/checkout?status=failure`,
        pending: `${Deno.env.get('SITE_URL') || 'https://loie-commerce-spark.lovable.app'}/checkout?status=pending`,
      },
      auto_return: 'approved',
      statement_descriptor: 'LOIE',
    };

    // Create preference via Mercado Pago API
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preferenceBody),
    });

    if (!mpResponse.ok) {
      const mpError = await mpResponse.text();
      console.error('MP preference error:', mpError);
      throw new Error(`Mercado Pago API error: ${mpResponse.status}`);
    }

    const preference = await mpResponse.json();

    // Save preference_id to order
    await supabase
      .from('orders')
      .update({ mp_preference_id: preference.id })
      .eq('id', order_id);

    return new Response(
      JSON.stringify({
        preference_id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('mp-create-preference error:', err);
    return new Response(
      JSON.stringify({ error: 'Erro ao criar preferência de pagamento' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
