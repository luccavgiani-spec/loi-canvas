import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { order_id, token, payment_method_id, installments, transaction_amount, payer, device_id } = body;

    const isPix = payment_method_id === 'pix';

    if (!order_id || !payment_method_id) {
      return new Response(
        JSON.stringify({ error: 'order_id e payment_method_id são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (!isPix && !token) {
      return new Response(
        JSON.stringify({ error: 'token é obrigatório para pagamento com cartão' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN');
    if (!MP_ACCESS_TOKEN) throw new Error('MP_ACCESS_TOKEN not configured');

    const supabase = getSupabaseAdmin();

    const { data: order, error: orderError } = await supabase
      .from('orders').select('*').eq('id', order_id).single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Pedido não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Fetch order items for enriched payload
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*, products(name)')
      .eq('order_id', order_id);

    const items = (orderItems || []).map((item: any) => ({
      id: String(item.product_id),
      title: item.products?.name || 'Produto Loiê',
      description: item.products?.name || 'Produto Loiê',
      category_id: 'home_deco',
      quantity: Number(item.qty),
      unit_price: Number(item.unit_price),
    }));

    // Build enriched payer
    const payerEmail = payer?.email || order.customer_email;
    const payerObj: Record<string, any> = {
      email: payerEmail,
      first_name: payer?.first_name || order.customer_name?.split(' ')[0] || '',
      last_name: payer?.last_name || order.customer_name?.split(' ').slice(1).join(' ') || '',
    };
    if (payer?.identification?.number) payerObj.identification = payer.identification;
    if (payer?.phone) {
      const digits = String(payer.phone).replace(/\D/g, '');
      if (digits.length >= 10) {
        payerObj.phone = { area_code: digits.slice(0, 2), number: digits.slice(2) };
      }
    }
    if (payer?.address?.zip_code) {
      payerObj.address = {
        zip_code: String(payer.address.zip_code).replace(/\D/g, ''),
        street_name: payer.address.street_name || '',
        street_number: String(payer.address.street_number || ''),
      };
    }

    const amount = Number(transaction_amount || order.total);
    const idempotencyKey = `${order_id}-${Date.now()}`;

    // ─── PIX FLOW — Payments API (/v1/payments) ──────────────────────────────
    if (isPix) {
      const pixBody: Record<string, any> = {
        transaction_amount: amount,
        payment_method_id: 'pix',
        external_reference: order_id,
        description: 'Pedido Loiê',
        payer: payerObj,
      };

      console.log('[PIX] Sending:', JSON.stringify(pixBody));

      const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
          'X-Idempotency-Key': `pix-${idempotencyKey}`,
        },
        body: JSON.stringify(pixBody),
      });

      const mpResult = await mpResponse.json();
      console.log('[PIX] MP response:', mpResponse.status, JSON.stringify(mpResult));

      if (!mpResponse.ok) {
        return new Response(
          JSON.stringify({ error: mpResult.message || 'Erro ao gerar PIX', details: mpResult }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      await supabase.from('orders')
        .update({ status: 'pending', mp_payment_id: String(mpResult.id) })
        .eq('id', order_id);

      return new Response(
        JSON.stringify({
          status: 'pending',
          mp_status: mpResult.status,
          mp_payment_id: String(mpResult.id),
          pix: {
            qr_code: mpResult.point_of_interaction?.transaction_data?.qr_code || null,
            qr_code_base64: mpResult.point_of_interaction?.transaction_data?.qr_code_base64 || null,
            ticket_url: mpResult.point_of_interaction?.transaction_data?.ticket_url || null,
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ─── CARD FLOW — Orders API (/v1/orders) ─────────────────────────────────
    const debitMethods = ['debvisa', 'debmaster', 'debcabal', 'debelo'];
    const paymentType = debitMethods.includes(payment_method_id) ? 'debit_card' : 'credit_card';

    const orderBody: Record<string, any> = {
      type: 'online',
      processing_mode: 'automatic',
      external_reference: order_id,
      total_amount: String(amount),
      statement_descriptor: 'LOIE',
      items,
      payer: payerObj,
      transactions: {
        payments: [{
          amount: String(amount),
          payment_method: {
            id: payment_method_id,
            type: paymentType,
            token: token,
            installments: Number(installments) || 1,
            // issuer_id OMITIDO intencionalmente — Orders API rejeita com "unsupported_properties"
          },
        }],
      },
    };

    if (device_id) orderBody.device_id = device_id;

    console.log('[CARD] Sending to Orders API:', JSON.stringify(orderBody));

    const mpResponse = await fetch('https://api.mercadopago.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(orderBody),
    });

    const mpResult = await mpResponse.json();
    console.log('[CARD] MP response:', mpResponse.status, JSON.stringify(mpResult));

    if (!mpResponse.ok) {
      const errorMsg = mpResult.errors
        ? mpResult.errors.map((e: any) => e.message || e.description).join('; ')
        : (mpResult.message || `Mercado Pago error: ${mpResponse.status}`);
      return new Response(
        JSON.stringify({ error: errorMsg, details: mpResult }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const mpStatus = mpResult.status;
    const mpStatusDetail = mpResult.status_detail;
    const mpPaymentId = mpResult.transactions?.payments?.[0]?.id || mpResult.id;

    let orderStatus = 'pending';
    if (mpStatus === 'processed' && mpStatusDetail === 'accredited') orderStatus = 'paid';
    else if (mpStatus === 'processed' && mpStatusDetail !== 'accredited') orderStatus = 'cancelled';
    else if (mpStatus === 'expired' || mpStatusDetail === 'rejected') orderStatus = 'cancelled';

    await supabase.from('orders')
      .update({ status: orderStatus, mp_payment_id: String(mpPaymentId) })
      .eq('id', order_id);

    console.log(`[CARD] order ${order_id} → ${orderStatus} (MP: ${mpStatus}/${mpStatusDetail})`);

    return new Response(
      JSON.stringify({
        status: orderStatus,
        mp_status: mpStatus,
        mp_status_detail: mpStatusDetail,
        mp_order_id: mpResult.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (err) {
    console.error('[ERROR] mp-process-payment:', err);
    return new Response(
      JSON.stringify({ error: 'Erro ao processar pagamento' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
