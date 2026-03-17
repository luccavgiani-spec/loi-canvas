import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase.ts';

async function callSendEmail(type: string, payload: Record<string, unknown>): Promise<void> {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY ?? '',
    },
    body: JSON.stringify({ type, payload }),
  });
}

async function sendOrderEmails(supabase: ReturnType<typeof getSupabaseAdmin>, orderId: string): Promise<void> {
  try {
    // Fetch order details
    const { data: order } = await supabase
      .from('orders')
      .select('id, customer_name, customer_email, subtotal, shipping_cost, total')
      .eq('id', orderId)
      .single();

    if (!order) return;

    // Fetch order items with product names
    const { data: rawItems } = await supabase
      .from('order_items')
      .select('qty, unit_price, products(name)')
      .eq('order_id', orderId);

    const items = (rawItems ?? []).map((i: any) => ({
      name: i.products?.name ?? 'Produto',
      qty: i.qty,
      price: i.unit_price,
    }));

    // Send order_confirmed email
    await callSendEmail('order_confirmed', {
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      order_id: order.id,
      items,
      subtotal: order.subtotal,
      shipping_cost: order.shipping_cost ?? 0,
      total: order.total,
    });

    // Check if this is the customer's first paid order → send welcome
    const { count } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('customer_email', order.customer_email)
      .eq('status', 'paid');

    if (count === 1) {
      await callSendEmail('welcome', {
        customer_name: order.customer_name,
        customer_email: order.customer_email,
      });
    }
  } catch (err) {
    console.error('sendOrderEmails error (non-fatal):', err);
  }
}

/**
 * Mercado Pago webhook handler.
 * Receives IPN notifications and updates order status accordingly.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN');
    const MP_WEBHOOK_SECRET = Deno.env.get('MP_WEBHOOK_SECRET');

    if (!MP_ACCESS_TOKEN) {
      throw new Error('MP_ACCESS_TOKEN not configured');
    }

    // Validate webhook signature if secret is configured
    if (MP_WEBHOOK_SECRET) {
      const xSignature = req.headers.get('x-signature');
      const xRequestId = req.headers.get('x-request-id');

      if (!xSignature || !xRequestId) {
        return new Response(
          JSON.stringify({ error: 'Missing signature headers' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      // Parse x-signature: ts=...,v1=...
      const parts: Record<string, string> = {};
      xSignature.split(',').forEach((part) => {
        const [key, value] = part.split('=');
        parts[key.trim()] = value.trim();
      });

      const url = new URL(req.url);
      const dataId = url.searchParams.get('data.id') || url.searchParams.get('id') || '';

      // Build the manifest string for HMAC validation
      const manifest = `id:${dataId};request-id:${xRequestId};ts:${parts.ts};`;

      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(MP_WEBHOOK_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
      );
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(manifest));
      const hexHash = Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      if (hexHash !== parts.v1) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    const body = await req.json();
    const { type, data } = body;

    // We only care about payment notifications
    if (type !== 'payment') {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const paymentId = data?.id;
    if (!paymentId) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch payment details from Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });

    if (!mpResponse.ok) {
      console.error('Failed to fetch payment from MP:', mpResponse.status);
      return new Response(JSON.stringify({ error: 'Failed to fetch payment' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payment = await mpResponse.json();
    const orderId = payment.external_reference;

    if (!orderId) {
      console.warn('Payment without external_reference:', paymentId);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Map MP payment status to our order status
    const statusMap: Record<string, string> = {
      approved: 'paid',
      authorized: 'paid',
      in_process: 'pending',
      in_mediation: 'pending',
      rejected: 'cancelled',
      cancelled: 'cancelled',
      refunded: 'refunded',
      charged_back: 'refunded',
    };

    const orderStatus = statusMap[payment.status] || 'pending';

    const supabase = getSupabaseAdmin();

    await supabase
      .from('orders')
      .update({
        status: orderStatus,
        mp_payment_id: String(paymentId),
      })
      .eq('id', orderId);

    console.log(`Order ${orderId} updated to status: ${orderStatus} (MP: ${payment.status})`);

    // Send transactional emails when payment is confirmed
    if (orderStatus === 'paid') {
      await sendOrderEmails(supabase, orderId);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('mp-webhook error:', err);
    return new Response(
      JSON.stringify({ error: 'Webhook processing error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
