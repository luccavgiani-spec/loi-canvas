import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { createOrder, createPaymentIntent } from '@/lib/api';
import { FREE_SHIPPING_THRESHOLD } from '@/config';
import { CheckCircle, Loader2 } from 'lucide-react';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().trim().min(2, 'Nome obrigatório').max(100),
  email: z.string().trim().email('E-mail inválido').max(255),
  phone: z.string().trim().min(10, 'Telefone inválido').max(20),
});

type CheckoutState = 'form' | 'processing' | 'success' | 'error';

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  background: 'transparent',
  border: '1px solid rgba(86,86,0,0.2)',
  color: '#29241f',
  fontFamily: "'Montserrat', sans-serif",
  fontWeight: 300 as const,
  fontSize: '0.85rem',
  outline: 'none',
};

const Checkout = () => {
  const { items, subtotal, clear } = useCart();
  const [state, setState] = useState<CheckoutState>('form');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 19.9;
  const total = subtotal + shipping;

  const handlePay = async () => {
    const result = customerSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach(e => { errs[e.path[0] as string] = e.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setState('processing');

    try {
      const orderItems = items.map(i => ({ product_id: i.product.id, quantity: i.quantity, price: i.product.price }));
      let orderId = 'mock-order-' + Date.now();
      try {
        const res = await createOrder({ items: orderItems, customer: result.data as { name: string; email: string; phone: string } });
        orderId = res.order_id;
      } catch { /* use mock */ }
      try {
        await createPaymentIntent({ order_id: orderId, amount: total });
      } catch { /* mock success */ }
      await new Promise(r => setTimeout(r, 1500));
      clear();
      setState('success');
    } catch {
      setState('error');
    }
  };

  if (items.length === 0 && state !== 'success') {
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
          <h1 className="heading-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#29241f' }}>
            Checkout
          </h1>
        </div>

        {state === 'success' ? (
          <div className="text-center py-16">
            <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#565600' }} />
            <h2 className="heading-display mb-3" style={{ fontSize: '2rem', color: '#29241f' }}>
              Pedido Confirmado!
            </h2>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'rgba(41,36,31,0.45)' }}>
              Obrigado pela sua compra. Você receberá um e-mail de confirmação em breve.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-5 gap-10">
            {/* Form */}
            <div className="md:col-span-3 space-y-6">
              <div>
                <h2 className="heading-display mb-6" style={{ fontSize: '1.4rem', color: '#29241f' }}>
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

              {/* Payment placeholder */}
              <div className="p-6" style={{ border: '1px solid rgba(86,86,0,0.12)', background: 'rgba(41,36,31,0.02)' }}>
                <span className="loi-label block mb-2">pagamento</span>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.9rem', color: 'rgba(41,36,31,0.4)' }}>
                  O Checkout Transparente do Mercado Pago será renderizado aqui após a configuração do backend.
                </p>
              </div>

              <button
                onClick={handlePay}
                disabled={state === 'processing'}
                className="loi-btn w-full justify-center"
              >
                {state === 'processing' ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> processando...
                  </span>
                ) : (
                  `pagar r$ ${total.toFixed(2)}`
                )}
              </button>
              {state === 'error' && (
                <p style={{ color: '#c44', fontSize: '0.7rem', fontFamily: "'Montserrat', sans-serif" }}>
                  Erro ao processar pagamento. Tente novamente.
                </p>
              )}
            </div>

            {/* Order summary */}
            <div className="md:col-span-2">
              <div className="p-6 sticky top-24" style={{ border: '1px solid rgba(86,86,0,0.12)', background: 'rgba(41,36,31,0.02)' }}>
                <h3 className="heading-display mb-6" style={{ fontSize: '1.2rem', color: '#29241f' }}>Resumo</h3>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 object-cover" style={{ filter: 'saturate(0.7) brightness(0.8)' }} />
                      <div className="flex-1 min-w-0">
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem', color: '#29241f' }} className="truncate">
                          {item.product.name}
                        </p>
                        <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.7rem', color: 'rgba(41,36,31,0.35)' }}>
                          Qtd: {item.quantity}
                        </p>
                      </div>
                      <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: '#29241f' }}>
                        R$ {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 space-y-2" style={{ borderTop: '1px solid rgba(86,86,0,0.1)' }}>
                  <div className="flex justify-between">
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: 'rgba(41,36,31,0.45)' }}>Subtotal</span>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: '#29241f' }}>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: 'rgba(41,36,31,0.45)' }}>Frete</span>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: '#29241f' }}>{shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between pt-2" style={{ borderTop: '1px solid rgba(86,86,0,0.1)' }}>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.9rem', color: '#29241f' }}>Total</span>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400, fontSize: '1rem', color: '#565600' }}>R$ {total.toFixed(2)}</span>
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
