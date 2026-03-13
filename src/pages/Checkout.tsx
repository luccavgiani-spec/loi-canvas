import { useState, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { createOrder, createPaymentPreference, processPayment } from '@/lib/api';
import { MP_PUBLIC_KEY, FREE_SHIPPING_THRESHOLD } from '@/config';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

initMercadoPago(MP_PUBLIC_KEY, { locale: 'pt-BR' });

const customerSchema = z.object({
  name: z.string().trim().min(2, 'Nome obrigatório').max(100),
  email: z.string().trim().email('E-mail inválido').max(255),
  phone: z.string().trim().min(10, 'Telefone inválido').max(20),
});

type CheckoutStep = 'form' | 'payment' | 'processing' | 'success' | 'error';

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  background: 'transparent',
  border: '1px solid rgba(86,86,0,0.2)',
  color: '#000',
  fontFamily: "'Montserrat', sans-serif",
  fontWeight: 300 as const,
  fontSize: '0.85rem',
  outline: 'none',
};

const Checkout = () => {
  const { items, subtotal, clear } = useCart();
  const [step, setStep] = useState<CheckoutStep>('form');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 19.9;
  const total = subtotal + shipping;

  const handleContinueToPayment = async () => {
    const result = customerSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach(e => { errs[e.path[0] as string] = e.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep('processing');

    try {
      const orderItems = items.map(i => ({
        product_id: i.product.id,
        quantity: i.quantity,
        price: i.product.price,
      }));

      const orderRes = await createOrder({
        items: orderItems,
        customer: result.data as { name: string; email: string; phone: string },
      });

      setOrderId(orderRes.order_id);

      const prefRes = await createPaymentPreference({ order_id: orderRes.order_id });
      setPreferenceId(prefRes.preference_id);
      setStep('payment');
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao processar pedido');
      setStep('error');
    }
  };

  const handlePaymentSubmit = useCallback(async (paymentData: any) => {
    setStep('processing');
    try {
      const formData = paymentData?.formData || paymentData;
      console.log('Payment Brick formData:', formData);

      const result = await processPayment({
        order_id: orderId!,
        token: formData.token,
        payment_method_id: formData.payment_method_id,
        issuer_id: formData.issuer_id,
        installments: formData.installments || 1,
        transaction_amount: formData.transaction_amount || total,
        payer: formData.payer || { email: form.email },
      });

      console.log('Payment result:', result);

      if (result.status === 'paid') {
        clear();
        setStep('success');
      } else if (result.status === 'pending') {
        setErrorMessage('Pagamento em análise. Você será notificado por e-mail quando for aprovado.');
        setStep('error');
      } else {
        const detail = result.mp_status_detail || 'rejected';
        const messages: Record<string, string> = {
          cc_rejected_other_reason: 'Pagamento recusado. Tente outro cartão.',
          cc_rejected_call_for_authorize: 'Pagamento recusado. Ligue para a operadora do cartão.',
          cc_rejected_insufficient_amount: 'Saldo insuficiente.',
          cc_rejected_bad_filled_security_code: 'Código de segurança inválido.',
          cc_rejected_bad_filled_date: 'Data de vencimento inválida.',
          cc_rejected_bad_filled_other: 'Dados do cartão inválidos.',
          accredited: 'Pagamento aprovado!',
        };
        setErrorMessage(messages[detail] || `Pagamento recusado (${detail}). Tente novamente.`);
        setStep('error');
      }
    } catch (err) {
      console.error('Process payment error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao processar pagamento.');
      setStep('error');
    }
  }, [orderId, total, form.email, clear]);

  const handlePaymentReady = useCallback(() => {
    // Payment Brick is ready
  }, []);

  const handlePaymentError = useCallback((error: unknown) => {
    console.error('Payment Brick error:', error);
    setErrorMessage('Erro no processamento do pagamento. Tente novamente.');
    setStep('error');
  }, []);

  if (items.length === 0 && step !== 'success') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'rgba(41,36,31,0.45)' }}>
            Seu carrinho está vazio.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-10 md:py-16">
        <div className="text-center mb-12">
          <span className="loi-label block mb-4">finalizar</span>
          <h1 className="heading-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#000' }}>
            Checkout
          </h1>
        </div>

        {step === 'success' ? (
          <div className="text-center py-16">
            <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#000' }} />
            <h2 className="heading-display mb-3" style={{ fontSize: '2rem', color: '#000' }}>
              Pedido Confirmado!
            </h2>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'rgba(41,36,31,0.45)' }}>
              Obrigado pela sua compra. Você receberá um e-mail de confirmação em breve.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-5 gap-10">
            {/* Form + Payment */}
            <div className="md:col-span-3 space-y-6">
              {/* Customer Form */}
              <div>
                <h2 className="heading-display mb-6" style={{ fontSize: '1.4rem', color: '#000' }}>
                  Seus dados
                </h2>
                <div className="space-y-4">
                  {[
                    { id: 'name', label: 'Nome completo', type: 'text' },
                    { id: 'email', label: 'E-mail', type: 'email' },
                    { id: 'phone', label: 'Telefone', type: 'tel' },
                  ].map((field) => (
                    <div key={field.id}>
                      <label className="loi-label block mb-2">{field.label}</label>
                      <input
                        type={field.type}
                        value={form[field.id as keyof typeof form]}
                        onChange={(e) => setForm((f) => ({ ...f, [field.id]: e.target.value }))}
                        style={inputStyle}
                        disabled={step === 'payment' || step === 'processing'}
                      />
                      {errors[field.id] && (
                        <p style={{ color: '#c44', fontSize: '0.7rem', marginTop: 4, fontFamily: "'Montserrat', sans-serif" }}>
                          {errors[field.id]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Section */}
              <div className="p-6" style={{ border: '1px solid rgba(86,86,0,0.12)', background: 'rgba(41,36,31,0.02)' }}>
                <span className="loi-label block mb-2">pagamento</span>

                {step === 'form' && (
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.9rem', color: 'rgba(41,36,31,0.4)' }}>
                    Preencha seus dados acima e clique em continuar para escolher a forma de pagamento.
                  </p>
                )}

                {step === 'payment' && preferenceId && (
                  <Payment
                    initialization={{
                      amount: total,
                      preferenceId: preferenceId,
                    }}
                    customization={{
                      paymentMethods: {
                        creditCard: 'all',
                        debitCard: 'all',
                        ticket: 'all',
                        bankTransfer: 'all',
                        mercadoPago: 'all',
                      },
                      visual: {
                        style: {
                          theme: 'flat',
                        },
                      },
                    }}
                    onSubmit={handlePaymentSubmit}
                    onReady={handlePaymentReady}
                    onError={handlePaymentError}
                  />
                )}

                {step === 'processing' && (
                  <div className="flex items-center justify-center py-8 gap-3">
                    <Loader2 size={20} className="animate-spin" style={{ color: '#000' }} />
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.85rem', color: 'rgba(41,36,31,0.6)' }}>
                      Processando...
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {step === 'form' && (
                <button
                  onClick={handleContinueToPayment}
                  className="loi-btn w-full justify-center"
                >
                  continuar para pagamento
                </button>
              )}

              {step === 'payment' && (
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.75rem', color: 'rgba(41,36,31,0.4)', textAlign: 'center' }}>
                  Escolha a forma de pagamento acima e finalize sua compra.
                </p>
              )}

              {step === 'error' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} style={{ color: '#c44' }} />
                    <p style={{ color: '#c44', fontSize: '0.8rem', fontFamily: "'Montserrat', sans-serif" }}>
                      {errorMessage || 'Erro ao processar pagamento. Tente novamente.'}
                    </p>
                  </div>
                  <button
                    onClick={() => { setStep('form'); setErrorMessage(''); }}
                    className="loi-btn w-full justify-center"
                  >
                    tentar novamente
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="md:col-span-2">
              <div className="p-6 sticky top-24" style={{ border: '1px solid rgba(86,86,0,0.12)', background: 'rgba(41,36,31,0.02)' }}>
                <h3 className="heading-display mb-6" style={{ fontSize: '1.2rem', color: '#000' }}>Resumo</h3>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 object-cover" style={{ filter: 'saturate(0.7) brightness(0.8)' }} />
                      <div className="flex-1 min-w-0">
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem', color: '#000' }} className="truncate">
                          {item.product.name}
                        </p>
                        <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.7rem', color: 'rgba(41,36,31,0.35)' }}>
                          Qtd: {item.quantity}
                        </p>
                      </div>
                      <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: '#000' }}>
                        R$ {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 space-y-2" style={{ borderTop: '1px solid rgba(86,86,0,0.1)' }}>
                  <div className="flex justify-between">
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: 'rgba(41,36,31,0.45)' }}>Subtotal</span>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: '#000' }}>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: 'rgba(41,36,31,0.45)' }}>Frete</span>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: '#000' }}>{shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between pt-2" style={{ borderTop: '1px solid rgba(86,86,0,0.1)' }}>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.9rem', color: '#000' }}>Total</span>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400, fontSize: '1rem', color: '#000' }}>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Checkout;
