import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';

interface CartItem {
  product_id: string;
  quantity: number;
  price: number;
}

interface Body {
  code: string;
  cartItems: CartItem[];
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code, cartItems }: Body = await req.json();
    const trimmed = (code ?? '').trim().toUpperCase();
    if (!trimmed) return json({ valid: false, reason: 'Código vazio' });
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return json({ valid: false, reason: 'Carrinho vazio' });
    }

    const supabase = getSupabaseAdmin();

    const { data: coupon, error: couponErr } = await supabase
      .from('vip_coupons')
      .select('id, active, vip_coupon_discounts(collection_id, discount_percent)')
      .eq('code', trimmed)
      .maybeSingle();

    if (couponErr) throw couponErr;
    if (!coupon || !coupon.active) {
      return json({ valid: false, reason: 'Cupom inválido ou expirado' });
    }

    const productIds = cartItems.map((i) => i.product_id);
    const { data: products, error: productsErr } = await supabase
      .from('products')
      .select('id, collection_id')
      .in('id', productIds);
    if (productsErr) throw productsErr;

    const productCollectionMap = new Map<string, string | null>(
      (products ?? []).map((p: { id: string; collection_id: string | null }) => [p.id, p.collection_id]),
    );
    const discountMap = new Map<string, number>(
      ((coupon.vip_coupon_discounts ?? []) as { collection_id: string; discount_percent: number }[])
        .map((d) => [d.collection_id, Number(d.discount_percent)]),
    );

    let totalDiscount = 0;
    const appliedItems: { product_id: string; discount_amount: number }[] = [];
    for (const item of cartItems) {
      const colId = productCollectionMap.get(item.product_id);
      const pct = colId ? discountMap.get(colId) ?? 0 : 0;
      if (pct > 0) {
        const itemDiscount = item.price * item.quantity * (pct / 100);
        totalDiscount += itemDiscount;
        appliedItems.push({
          product_id: item.product_id,
          discount_amount: Math.round(itemDiscount * 100) / 100,
        });
      }
    }

    if (totalDiscount <= 0) {
      return json({ valid: false, reason: 'Cupom não aplicável aos itens do carrinho' });
    }

    return json({
      valid: true,
      kind: 'vip',
      discount: Math.round(totalDiscount * 100) / 100,
      applied_items: appliedItems,
    });
  } catch (err) {
    console.error('validate-vip-coupon error:', err);
    return json({ valid: false, reason: 'Erro ao validar cupom' }, 500);
  }
});
