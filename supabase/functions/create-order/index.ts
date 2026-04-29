import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';

type CartItemPayload = { product_id: string; quantity: number; price: number };
type CouponRow = {
  id: string;
  code: string;
  type: string;
  value: number;
  is_active: boolean | null;
  current_uses: number;
  max_uses: number | null;
  valid_from: string | null;
  valid_until: string | null;
  min_order_value: number | null;
  collection_id: string | null;
};

// Re-valida o cupom server-side. Não confiamos no cliente: o subtotal
// é recalculado a partir dos preços do banco em outra etapa, mas para
// determinar elegibilidade por coleção precisamos buscar collection_id
// dos produtos do carrinho.
async function resolveCoupon(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  code: string,
  items: CartItemPayload[],
  subtotal: number,
): Promise<{ ok: true; coupon: CouponRow; discount: number } | { ok: false; reason: string }> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { ok: false, reason: 'Código de cupom vazio' };

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', trimmed)
    .maybeSingle();

  if (error) return { ok: false, reason: 'Erro ao validar cupom' };
  if (!coupon) return { ok: false, reason: 'Cupom inválido' };

  if (!coupon.is_active) return { ok: false, reason: 'Cupom inativo' };

  const now = new Date();
  if (coupon.valid_from && new Date(coupon.valid_from) > now) {
    return { ok: false, reason: 'Cupom ainda não está vigente' };
  }
  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    return { ok: false, reason: 'Cupom expirado' };
  }
  if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
    return { ok: false, reason: 'Cupom esgotado' };
  }
  if (coupon.min_order_value !== null && subtotal < Number(coupon.min_order_value)) {
    return { ok: false, reason: `Pedido mínimo de R$ ${Number(coupon.min_order_value).toFixed(2)}` };
  }

  let eligibleBase = subtotal;
  if (coupon.collection_id) {
    const productIds = items.map(i => i.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('id, collection_id')
      .in('id', productIds);
    const productCollectionMap = new Map(
      (products ?? []).map((p: { id: string; collection_id: string | null }) => [p.id, p.collection_id]),
    );
    eligibleBase = items.reduce((sum, item) => {
      if (productCollectionMap.get(item.product_id) === coupon.collection_id) {
        return sum + item.price * item.quantity;
      }
      return sum;
    }, 0);
    if (eligibleBase <= 0) {
      return { ok: false, reason: 'Cupom não vale para os itens deste pedido' };
    }
  }

  const value = Number(coupon.value);
  const rawDiscount = coupon.type === 'percent'
    ? eligibleBase * (value / 100)
    : Math.min(eligibleBase, value);
  const discount = Math.round(Math.min(eligibleBase, rawDiscount) * 100) / 100;

  return { ok: true, coupon: coupon as CouponRow, discount };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { items, customer, is_pickup, coupon_code } = await req.json() as {
      items: CartItemPayload[];
      customer: { name: string; email: string; phone?: string };
      is_pickup?: boolean;
      coupon_code?: string;
    };

    if (!items?.length || !customer?.name || !customer?.email) {
      return new Response(
        JSON.stringify({ error: 'items e customer (name, email) são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = getSupabaseAdmin();

    const subtotal = items.reduce(
      (sum: number, i: CartItemPayload) => sum + i.price * i.quantity,
      0,
    );
    const FREE_SHIPPING_THRESHOLD = 299;
    const isPickup = Boolean(is_pickup);
    const shippingCost = isPickup
      ? 0
      : (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 19.9);

    // Cupom (opcional)
    let discount = 0;
    let resolvedCoupon: CouponRow | null = null;
    if (coupon_code) {
      const res = await resolveCoupon(supabase, coupon_code, items, subtotal);
      if (!res.ok) {
        return new Response(
          JSON.stringify({ error: res.reason }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      discount = res.discount;
      resolvedCoupon = res.coupon;
    }

    const total = Math.max(0, subtotal + shippingCost - discount);

    // Upsert customer
    await supabase
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
        discount: discount > 0 ? discount : null,
        total,
        status: 'pending',
        is_pickup: isPickup,
      })
      .select('id')
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = items.map((i: CartItemPayload) => ({
      order_id: order.id,
      product_id: i.product_id,
      qty: i.quantity,
      unit_price: i.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    // Incrementa current_uses do cupom NA CRIAÇÃO do pedido (não em
    // status='paid'). Decisão: previne abuso de carrinhos duplicados
    // consumindo o limite — se o pagamento não for concluído, o cupom
    // já foi gasto, mas isso é aceitável para a Loiê (limite global, não
    // limite por usuário). Se quiser inverter para "incrementar só em
    // paid", mover esta lógica para o webhook do Mercado Pago.
    if (resolvedCoupon) {
      await supabase
        .from('coupons')
        .update({ current_uses: resolvedCoupon.current_uses + 1 })
        .eq('id', resolvedCoupon.id);
    }

    return new Response(
      JSON.stringify({ order_id: order.id, total, discount }),
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
