import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';

/**
 * Processes a payment via Mercado Pago.
 * - PIX: Payments API (/v1/payments) → returns qr_code data
 * - Card: Orders API (/v1/orders, automatic mode)
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { order_id, token, payment_method_id, issuer_id, installments, transaction_amount, payer, device_id } = body;

    if (!order_id || !payment_method_id) {
      return new Response(
        JSON.stringify({ error: 'order_id e payment_method_id são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN');
    if (!MP_ACCESS_TOKEN) {
      throw new Error('MP_ACCESS_TOKEN not configured');
    }

    const supabase = getSupabaseAdmin();

    // Fetch order to get the real total
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

    // Fetch order items with product info for enriched payload
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*, products(name, id)')
      .eq('order_id', order_id);

    const items = (orderItems || []).map((item: any) => ({
      id: item.product_id,
      title: item.products?.name || 'Produto Loiê',
      description: item.products?.name || 'Produto Loiê',
      category_id: 'home_deco',
      quantity: item.qty,
      unit_price: Number(item.unit_price),
    }));

    // Build enriched payer object
    const payerObj: Record<string, any> = {
      email: payer?.email || order.customer_email,
      first_name: payer?.first_name || order.customer_name?.split(' ')[0] || '',
      last_name: payer?.last_name || order.customer_name?.split(' ').slice(1).join(' ') || '',
    };
    if (payer?.identification) payerObj.identification = payer.identification;
    if (payer?.phone) {
      const digits = String(payer.phone).replace(/\D/g, '');
      payerObj.phone = { area_code: digits.slice(0, 2), number: digits.slice(2) };
    }
    if (payer?.address) {
      payerObj.address = {
        zip_code: payer.address.zip_code || '',
        street_name: payer.address.street_name || '',
        street_number: payer.address.street_number || '',
      };
    }

    // ── PIX flow via Payments API ──────────────────────────────────────────────
    if (payment_method_id === 'pix') {
      const pixBody: Record<string, any> = {
        transaction_amount: Number(transaction_amount || order.total),
        payment_method_id: 'pix',
        statement_descriptor: 'LOIE',
        external_reference: order_id,
        items,
        payer: payerObj,
      };

      console.log('Creating PIX payment:', JSON.stringify(pixBody));

      const pixRes = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
          'X-Idempotency-Key': `pix-${order_id}-${Date.now()}`,
        },
        body: JSON.stringify(pixBody),
      });

      const pixResult = await pixRes.json();
      console.log('PIX payment response:', JSON.stringify(pixResult));

      if (!pixRes.ok) {
        const errorMsg = pixResult.message || pixResult.error || `Mercado Pago error: ${pixRes.status}`;
        return new Response(
          JSON.stringify({ error: errorMsg, details: pixResult }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      await supabase
        .from('orders')
        .update({ status: 'pending', mp_payment_id: String(pixResult.id) })
        .eq('id', order_id);

      return new Response(
        JSON.stringify({
          status: 'pending',
          mp_status: pixResult.status,
          mp_payment_id: pixResult.id,
          pix: {
            qr_code: pixResult.point_of_interaction?.transaction_data?.qr_code,
            qr_code_base64: pixResult.point_of_interaction?.transaction_data?.qr_code_base64,
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ── Card flow via Orders API ───────────────────────────────────────────────
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'token é obrigatório para pagamento com cartão' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const amount = String(transaction_amount || order.total);

    // Determine payment method type based on payment_method_id
    let paymentType = 'credit_card';
    const debitMethods = ['debvisa', 'debmaster', 'debcabal', 'debelo'];
    if (debitMethods.includes(payment_method_id)) {
      paymentType = 'debit_card';
    }

    const orderBody: Record<string, any> = {
      type: 'online',
      processing_mode: 'automatic',
      external_reference: order_id,
      total_amount: amount,
      statement_descriptor: 'LOIE',
      items,
      payer: payerObj,
      transactions: {
        payments: [
          {
            amount: amount,
            payment_method: {
              id: payment_method_id,
              type: paymentType,
              token: token,
              installments: installments || 1,
              ...(issuer_id ? { issuer_id: issuer_id } : {}),
            },
          },
        ],
      },
    };

    if (device_id) orderBody.device_id = device_id;

    console.log('Creating MP Order:', JSON.stringify(orderBody));

    const mpResponse = await fetch('https://api.mercadopago.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': `${order_id}-${Date.now()}`,
      },
      body: JSON.stringify(orderBody),
    });

    const mpResult = await mpResponse.json();
    console.log('MP Order response:', JSON.stringify(mpResult));

    if (!mpResponse.ok) {
      console.error('MP Order error:', JSON.stringify(mpResult));
      const errorMsg = mpResult.errors
        ? mpResult.errors.map((e: any) => e.message || e.description).join('; ')
        : `Mercado Pago error: ${mpResponse.status}`;
      return new Response(
        JSON.stringify({ error: errorMsg, details: mpResult }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Map MP order status to our order status
    const mpStatus = mpResult.status;
    const mpStatusDetail = mpResult.status_detail;
    const mpPaymentId = mpResult.transactions?.payments?.[0]?.id || mpResult.id;

    let orderStatus = 'pending';
    if (mpStatus === 'processed' && mpStatusDetail === 'accredited') {
      orderStatus = 'paid';
    } else if (mpStatus === 'processed' && mpStatusDetail !== 'accredited') {
      orderStatus = 'cancelled';
    } else if (mpStatus === 'expired' || mpStatusDetail === 'rejected') {
      orderStatus = 'cancelled';
    }

    // Update order in Supabase
    await supabase
      .from('orders')
      .update({
        status: orderStatus,
        mp_payment_id: String(mpPaymentId),
      })
      .eq('id', order_id);

    console.log(`Order ${order_id} → status: ${orderStatus} (MP: ${mpStatus}/${mpStatusDetail})`);

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
    console.error('mp-process-payment error:', err);
    return new Response(
      JSON.stringify({ error: 'Erro ao processar pagamento' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
