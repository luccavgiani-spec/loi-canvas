import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';

// Validacao de UUID v4 (formato 8-4-4-4-12 hex). Mais barato que regex
// completa de RFC 4122; suficiente para barrar IDs claramente invalidos.
const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { order_id } = await req.json();

    if (typeof order_id !== 'string' || !UUID_RE.test(order_id)) {
      return new Response(
        JSON.stringify({ error: 'order_id inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = getSupabaseAdmin();

    // Decisao: retornamos pedidos cancelled tambem. O cliente foi
    // redirecionado pelo MP/checkout para essa pagina, e ver "pedido
    // cancelado" e mais util do que 404 — evita confusao de "fiz pedido
    // mas o site nao acha". O frontend pode usar status para mostrar
    // mensagem apropriada.
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, status, total, shipping_cost, is_pickup, created_at')
      .eq('id', order_id)
      .maybeSingle();

    if (orderErr) throw orderErr;
    if (!order) {
      return new Response(
        JSON.stringify({ error: 'Pedido não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Items + lookup de product_name (sem expor product_id/variant_id).
    const { data: rawItems } = await supabase
      .from('order_items')
      .select('qty, unit_price, products(name)')
      .eq('order_id', order.id);

    const items = (rawItems ?? []).map((row: { qty: number; unit_price: number; products: { name: string } | null }) => ({
      product_name: row.products?.name ?? 'Produto',
      quantity: row.qty,
      unit_price: Number(row.unit_price),
    }));

    // pickup_address so se for retirada na loja
    let pickup_address: string | null = null;
    if (order.is_pickup) {
      const { data: setting } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'pickup_address')
        .maybeSingle();
      const value = setting?.value as { address?: string } | null;
      pickup_address = value?.address ?? null;
    }

    return new Response(
      JSON.stringify({
        id: order.id,
        status: order.status,
        total: Number(order.total),
        shipping_cost: order.shipping_cost == null ? 0 : Number(order.shipping_cost),
        is_pickup: Boolean(order.is_pickup),
        created_at: order.created_at,
        items,
        pickup_address,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('get-order-public error:', err);
    return new Response(
      JSON.stringify({ error: 'Erro ao buscar pedido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
