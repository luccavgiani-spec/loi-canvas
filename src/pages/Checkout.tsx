import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
      // Create order
      const orderItems = items.map(i => ({ product_id: i.product.id, quantity: i.quantity, price: i.product.price }));
      let orderId = 'mock-order-' + Date.now();
      try {
        const res = await createOrder({ items: orderItems, customer: result.data as { name: string; email: string; phone: string } });
        orderId = res.order_id;
      } catch { /* use mock */ }

      // Create payment intent
      try {
        await createPaymentIntent({ order_id: orderId, amount: total });
      } catch { /* mock success */ }

      // Simulate success
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
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">Seu carrinho está vazio.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-10 md:py-16 max-w-4xl">
        <h1 className="heading-display text-3xl md:text-4xl text-center mb-10">Checkout</h1>

        {state === 'success' ? (
          <div className="text-center py-16">
            <CheckCircle size={48} className="mx-auto text-badge-new mb-4" />
            <h2 className="heading-display text-2xl mb-2">Pedido Confirmado!</h2>
            <p className="text-muted-foreground text-sm">Obrigado pela sua compra. Você receberá um e-mail de confirmação em breve.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-5 gap-10">
            {/* Form */}
            <div className="md:col-span-3 space-y-6">
              <div>
                <h2 className="font-heading text-lg mb-4">Seus dados</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-xs uppercase tracking-wider">Nome completo</Label>
                    <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" />
                    {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs uppercase tracking-wider">E-mail</Label>
                    <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1" />
                    {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs uppercase tracking-wider">Telefone</Label>
                    <Input id="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1" />
                    {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* MP placeholder */}
              <div className="border border-border rounded-lg p-6 bg-secondary/50">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Pagamento</p>
                <p className="text-sm text-muted-foreground">O Checkout Transparente do Mercado Pago será renderizado aqui após a configuração do backend.</p>
              </div>

              <Button
                onClick={handlePay}
                disabled={state === 'processing'}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 text-sm uppercase tracking-wider"
              >
                {state === 'processing' ? <><Loader2 size={16} className="animate-spin mr-2" /> Processando...</> : `Pagar R$ ${total.toFixed(2)}`}
              </Button>
              {state === 'error' && <p className="text-destructive text-xs">Erro ao processar pagamento. Tente novamente.</p>}
            </div>

            {/* Order summary */}
            <div className="md:col-span-2">
              <div className="bg-secondary/50 border border-border rounded-lg p-6 sticky top-24">
                <h3 className="font-heading text-lg mb-4">Resumo</h3>
                <div className="space-y-3 mb-4">
                  {items.map(item => (
                    <div key={item.product.id} className="flex gap-3">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                      </div>
                      <span className="text-sm">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Frete</span><span>{shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2)}`}</span></div>
                  <div className="flex justify-between font-medium text-base pt-2 border-t border-border"><span>Total</span><span>R$ {total.toFixed(2)}</span></div>
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
