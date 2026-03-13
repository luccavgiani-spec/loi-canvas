import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { items, customer } = await req.json();

    if (!items?.length || !customer?.name || !customer?.email) {
      return new Response(
        JSON.stringify({ error: 'items e customer (name, email) são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = getSupabaseAdmin();

    const subtotal = items.reduce(
      (sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity,
      0,
    );
    const FREE_SHIPPING_THRESHOLD = 299;
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 19.9;
    const total = subtotal + shippingCost;

    // Upsert customer
    const { data: customerData } = await supabase
      .from('customers')
      .upsert({ name: customer.name, email: customer.email, phone: customer.phone || null }, { onConflict: 'email' })
      .select('id')
      .single();

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone || null,
        subtotal,
        shipping_cost: shippingCost,
        total,
        status: 'pending',
      })
      .select('id')
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = items.map((i: { product_id: string; quantity: number; price: number }) => ({
      order_id: order.id,
      product_id: i.product_id,
      qty: i.quantity,
      unit_price: i.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    return new Response(
      JSON.stringify({ order_id: order.id, total }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('create-order error:', err);
    return new Response(
      JSON.stringify({ error: 'Erro ao criar pedido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
