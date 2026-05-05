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

    // Items + lookup de product_name em 2 queries (sem embedded join).
    // order_items.product_id NÃO tem FK para products.id (69 de 87 rows
    // são órfãs, ~79%, dado histórico de testes), então PostgREST não
    // resolve `products(name)` embedado — retorna PGRST200. Mantendo o
    // padrão da v2 deployada: select cru de order_items, depois lookup
    // separado de nomes em products.
    const { data: rawItems, error: itemsErr } = await supabase
      .from('order_items')
      .select('product_id, qty, unit_price')
      .eq('order_id', order.id);

    if (itemsErr) throw itemsErr;

    type RawItem = { product_id: string | null; qty: number; unit_price: number };

    // NOTE: order_items.product_id não tem FK para products.id (69/87 rows
    // órfãs). Filtramos null e confiamos que IDs presentes existem;
    // órfãos retornam product_name='Produto' e caem no fallback de
    // bestsellers (não geram upsells configurados — a query de upsells
    // contra IDs órfãos retorna 0 rows e o fallback dispara).
    // Reutilizado no lookup de nomes E nos algoritmos de upsell abaixo.
    const orderProductIds = (rawItems as RawItem[] ?? [])
      .map((r) => r.product_id)
      .filter((id): id is string => id !== null);

    const productNamesById = new Map<string, string>();
    if (orderProductIds.length > 0) {
      const { data: namedProducts, error: namedErr } = await supabase
        .from('products')
        .select('id, name')
        .in('id', orderProductIds);
      if (namedErr) throw namedErr;
      for (const p of (namedProducts as { id: string; name: string }[] ?? [])) {
        productNamesById.set(p.id, p.name);
      }
    }

    const items = (rawItems as RawItem[] ?? []).map((row) => ({
      product_name: row.product_id
        ? productNamesById.get(row.product_id) ?? 'Produto'
        : 'Produto',
      quantity: row.qty,
      unit_price: Number(row.unit_price),
    }));

    // ── Upsells: até 3 produtos relacionados, configurados via admin ─────
    // Algoritmo:
    //   1) Tentar product_upsells → produtos cadastrados como upsell de
    //      qualquer item do pedido, deduplicados, ordenados por
    //      MIN(sort_order), excluindo itens já no pedido.
    //   2) Se 1 retornar vazio, fallback all-or-nothing para bestsellers
    //      (visible=true, is_bestseller=true, ordenados por
    //      bestseller_sort_order ASC NULLS LAST), também excluindo o que
    //      o cliente comprou.
    //   3) Se ambos vazios (cenário extremo: pedido só com órfãos E
    //      nenhum bestseller), retornar [].
    type UpsellProduct = {
      id: string;
      name: string;
      slug: string;
      price: number;
      image_url: string | null;
    };
    type ProductRow = {
      id: string;
      name: string;
      slug: string;
      price: number;
      created_at: string;
      bestseller_sort_order?: number | null;
      product_images: { filename: string; sort_order: number }[] | null;
    };

    // Mesma lógica de productImagePublicUrl em src/lib/api.ts:47-51,724-725
    // (bucket "produtos", URL pública via prefixo de storage). Validado
    // empiricamente: o endpoint /storage/v1/object/public aceita %2F como
    // separador de path, então encodeURIComponent(filename) puro funciona
    // tanto para filenames "uuid/timestamp-x.jpg" quanto para root.
    const PRODUCT_BUCKET_PUBLIC_URL =
      `${Deno.env.get('SUPABASE_URL')!}/storage/v1/object/public/produtos`;
    const productImagePublicUrl = (filename: string) =>
      `${PRODUCT_BUCKET_PUBLIC_URL}/${encodeURIComponent(filename)}`;

    const toUpsellProduct = (p: ProductRow): UpsellProduct => {
      const cover = (p.product_images ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)[0];
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        image_url: cover ? productImagePublicUrl(cover.filename) : null,
      };
    };

    let upsells: UpsellProduct[] = [];

    if (orderProductIds.length > 0) {
      // PASSO 2: upsells configurados (pode retornar 0..N rows)
      const { data: upsellRows, error: upsellErr } = await supabase
        .from('product_upsells')
        .select('upsell_product_id, sort_order')
        .in('product_id', orderProductIds);

      if (upsellErr) throw upsellErr;

      // Dedupe: mesma upsell_product_id pode aparecer via múltiplos
      // produtos do pedido. Mantemos MIN(sort_order). Também excluímos
      // qualquer upsell que o cliente já tem no pedido.
      const candidateSort = new Map<string, number>();
      for (const row of (upsellRows as { upsell_product_id: string; sort_order: number }[] ?? [])) {
        if (orderProductIds.includes(row.upsell_product_id)) continue;
        const cur = candidateSort.get(row.upsell_product_id);
        if (cur === undefined || row.sort_order < cur) {
          candidateSort.set(row.upsell_product_id, row.sort_order);
        }
      }

      if (candidateSort.size > 0) {
        const { data: products, error: productsErr } = await supabase
          .from('products')
          .select('id, name, slug, price, created_at, product_images(filename, sort_order)')
          .in('id', [...candidateSort.keys()])
          .eq('visible', true);

        if (productsErr) throw productsErr;

        upsells = (products as ProductRow[] ?? [])
          .sort((a, b) => {
            const sa = candidateSort.get(a.id) ?? 0;
            const sb = candidateSort.get(b.id) ?? 0;
            if (sa !== sb) return sa - sb;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          })
          .slice(0, 3)
          .map(toUpsellProduct);
      }
    }

    // PASSO 4: fallback all-or-nothing — bestsellers (só dispara se PASSO 2 = 0)
    if (upsells.length === 0) {
      const { data: bestsellers, error: bsErr } = await supabase
        .from('products')
        .select('id, name, slug, price, created_at, bestseller_sort_order, product_images(filename, sort_order)')
        .eq('visible', true)
        .eq('is_bestseller', true);

      if (bsErr) throw bsErr;

      upsells = (bestsellers as ProductRow[] ?? [])
        .filter((p) => !orderProductIds.includes(p.id))
        .sort((a, b) => {
          // bestseller_sort_order ASC NULLS LAST, then created_at DESC
          const sa = a.bestseller_sort_order ?? Number.MAX_SAFE_INTEGER;
          const sb = b.bestseller_sort_order ?? Number.MAX_SAFE_INTEGER;
          if (sa !== sb) return sa - sb;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })
        .slice(0, 3)
        .map(toUpsellProduct);
    }

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
        upsells,
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
