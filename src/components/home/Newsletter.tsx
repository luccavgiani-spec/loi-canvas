import { useState } from 'react';
import { subscribeNewsletter } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { z } from 'zod';

const emailSchema = z.string().trim().email('E-mail inválido').max(255);

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [coupon, setCoupon] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      const data = await subscribeNewsletter(result.data);
      setCoupon(data.coupon_code);
    } catch {
      setError('Erro ao cadastrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container max-w-lg text-center">
        <h2 className="mb-3" style={{ fontFamily: "'Sackers Gothic', sans-serif", fontWeight: 300, letterSpacing: '0.2em', fontSize: 'clamp(1rem, 1.5vw, 1.25rem)' }}>Ganhe 15% de desconto</h2>
        <p className="text-muted-foreground text-base mb-8">
          Cadastre-se e receba um cupom exclusivo de 15% na sua primeira compra.
        </p>

        {coupon ? (
          <div className="bg-background border border-border rounded-lg p-6">
            <p className="text-base text-muted-foreground mb-2">Seu cupom de 15%:</p>
            <p className="font-heading text-2xl tracking-widest text-accent font-semibold">{coupon}</p>
            <p className="text-sm text-muted-foreground mt-3">Use no checkout. Válido para primeira compra.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 bg-background"
            />
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 text-base uppercase tracking-wider">
              {loading ? '...' : 'Cadastrar'}
            </Button>
          </form>
        )}
        {error && <p className="text-destructive text-sm mt-2">{error}</p>}
      </div>
    </section>
  );
};

export default Newsletter;
