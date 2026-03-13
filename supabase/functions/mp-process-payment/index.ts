import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';

/**
 * Processes a payment via Mercado Pago Orders API (automatic mode).
 * Receives tokenized card data from the Payment Brick and creates an Order.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { order_id, token, payment_method_id, issuer_id, installments, transaction_amount, payer } = body;

    if (!order_id || !token || !payment_method_id) {
      return new Response(
        JSON.stringify({ error: 'order_id, token e payment_method_id são obrigatórios' }),
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

    const amount = String(transaction_amount || order.total);

    // Determine payment method type based on payment_method_id
    let paymentType = 'credit_card';
    const debitMethods = ['debvisa', 'debmaster', 'debcabal', 'debelo'];
    if (debitMethods.includes(payment_method_id)) {
      paymentType = 'debit_card';
    }

    // Create Order via Mercado Pago Orders API (automatic mode)
    const orderBody = {
      type: 'online',
      processing_mode: 'automatic',
      external_reference: order_id,
      total_amount: amount,
      payer: {
        email: payer?.email || order.customer_email,
      },
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
