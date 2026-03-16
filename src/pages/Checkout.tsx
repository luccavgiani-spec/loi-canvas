// checkout v5 - fix: cardForm race condition + PIX via Payments API
import { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { createOrder, processPayment } from '@/lib/api';
import { MP_PUBLIC_KEY, FREE_SHIPPING_THRESHOLD, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { z } from 'zod';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

const customerSchema = z.object({
  name: z.string().trim().min(2, 'Nome obrigatório').max(100),
  email: z.string().trim().email('E-mail inválido').max(255),
  phone: z.string().trim().min(10, 'Telefone inválido').max(20),
});

type CheckoutStep = 'form' | 'payment' | 'processing' | 'success' | 'error';
type PaymentMethod = 'card' | 'pix';

const CHAR  = '#29241f';
const OLIVA = '#565600';
const CREME = '#f4edd2';

const LABEL: React.CSSProperties = {
  fontFamily: "'Sackers Gothic', 'Cormorant Garamond', serif",
  fontSize: '0.6rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: `${CHAR}99`,
};

const INPUT: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: 'transparent',
  border: `1px solid ${CHAR}22`,
  borderRadius: 0,
  color: CHAR,
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: '1rem',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

const IFRAME_CONTAINER: React.CSSProperties = {
  width: '100%',
  height: 44,
  minHeight: 44,
  border: `1px solid ${CHAR}22`,
  borderRadius: 0,
  background: 'transparent',
  boxSizing: 'border-box' as const,
  overflow: 'visible',
  position: 'relative' as const,
  display: 'block',
  // Garante que o iframe injetado pelo MP SDK ocupe todo o container e receba eventos
};

// ─── PIX form ─────────────────────────────────────────────────────────────────
const PixForm = ({
  total, email, orderId, onSuccess, onError,
}: {
  total: number; email: string; orderId: string;
  onSuccess: (data: any) => void; onError: (msg: string) => void;
}) => {
  const [loading, setLoading] = useState(false);

  const handlePix = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/mp-process-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          order_id: orderId,
          payment_method_id: 'pix',
          transaction_amount: total,
          payer: { email },
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Erro ao gerar PIX');
      onSuccess(result);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erro ao gerar PIX');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.95rem', color: `${CHAR}77`, lineHeight: 1.6 }}>
        Clique no botão abaixo para gerar o QR Code PIX. O pagamento é confirmado instantaneamente.
      </p>
      <button
        onClick={handlePix}
        disabled={loading}
        style={{
          padding: '14px 24px',
          background: loading ? `${OLIVA}55` : OLIVA,
          color: CREME, border: 'none',
          fontFamily: "'Sackers Gothic', 'Cormorant Garamond', serif",
          fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? 'gerando pix...' : `gerar qr code pix — R$ ${total.toFixed(2)}`}
      </button>
    </div>
  );
};

// ─── QR Code display ──────────────────────────────────────────────────────────
const PixQRCode = ({ qrCode, qrCodeBase64, amount }: { qrCode: string; qrCodeBase64?: string; amount: number }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '20px 0' }}>
    <span style={{ ...LABEL, display: 'block' }}>pix gerado — aguardando pagamento</span>
    {qrCodeBase64 && (
      <img src={`data:image/png;base64,${qrCodeBase64}`} alt="QR Code PIX"
        style={{ width: 200, height: 200, border: `1px solid ${CHAR}22` }} />
    )}
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ ...LABEL, display: 'block' }}>ou copie o código</span>
      <div style={{ ...INPUT, padding: '10px 14px', fontSize: '0.7rem', fontFamily: 'monospace', wordBreak: 'break-all', background: `${CHAR}05`, userSelect: 'all', cursor: 'text' }}>
        {qrCode}
      </div>
      <button
        onClick={() => navigator.clipboard.writeText(qrCode)}
        style={{
          padding: '10px 20px', background: 'transparent', border: `1px solid ${CHAR}33`, color: CHAR,
          fontFamily: "'Sackers Gothic', 'Cormorant Garamond', serif",
          fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
        }}
      >
        copiar código
      </button>
    </div>
    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.85rem', color: `${CHAR}55`, textAlign: 'center' }}>
      R$ {amount.toFixed(2)} — você receberá a confirmação por e-mail assim que o pagamento for processado.
    </p>
  </div>
);

// ─── Card form ────────────────────────────────────────────────────────────────
const SCRIPT_ID = 'mp-sdk-v2';
// Instância singleton do MP — evita "Cardform already instantiated" no StrictMode
let mpInstance: any = null;
let cardFormInstance: any = null;

const CardForm = ({
  total, email, onSuccess, onError,
}: {
  total: number; email: string;
  onSuccess: (data: any) => void; onError: (msg: string) => void;
}) => {
  const formRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [installments, setInstallments] = useState<any[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState(1);
  const [docType, setDocType] = useState('CPF');
  const [mpReady, setMpReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Só inicializa quando o container DOM já estiver pintado
    if (!containerRef.current) return;

    let mounted = true;
    let intervalRef: ReturnType<typeof setInterval> | undefined;

    const init = () => {
      if (!mounted) return;

      // Confirma que todos os elementos alvo existem antes de chamar cardForm
      const requiredIds = [
        'mp__cardNumber', 'mp__expirationDate', 'mp__securityCode',
        'mp__cardholderName', 'mp__identificationNumber',
      ];
      const allPresent = requiredIds.every(id => document.getElementById(id));
      if (!allPresent) {
        setTimeout(init, 50);
        return;
      }

      // Verifica que os elementos estão realmente attached e visíveis no documento
      const firstEl = document.getElementById('mp__cardNumber');
      const rect = firstEl?.getBoundingClientRect();
      if (!rect || (rect.width === 0 && rect.height === 0)) {
        // Elemento existe mas ainda não foi pintado — aguarda próximo frame
        requestAnimationFrame(() => setTimeout(init, 100));
        return;
      }

      if (!mpInstance) {
        mpInstance = new window.MercadoPago(MP_PUBLIC_KEY, { locale: 'pt-BR' });
      }
      const mp = mpInstance;
      const cardForm = mp.cardForm({
        amount: String(total),
        iframe: true,
        form: {
          id: 'loie-card-form',
          cardholderName: { id: 'mp__cardholderName', placeholder: 'Nome como no cartão' },
          cardholderEmail: { id: 'mp__cardholderEmail' },
          cardNumber: { id: 'mp__cardNumber', placeholder: '0000 0000 0000 0000' },
          expirationDate: { id: 'mp__expirationDate', placeholder: 'MM/AA' },
          securityCode: { id: 'mp__securityCode', placeholder: '000' },
          installments: { id: 'mp__installments' },
          identificationType: { id: 'mp__identificationType' },
          identificationNumber: { id: 'mp__identificationNumber', placeholder: '000.000.000-00' },
          issuer: { id: 'mp__issuer' },
        },
        callbacks: {
          onFormMounted: (error: any) => {
            if (!mounted) return;
            if (error) {
              console.error('onFormMounted error:', error);
              onError('Erro ao carregar formulário de pagamento.');
              return;
            }
            setMpReady(true);
          },
          onInstallmentsReceived: (_: any, data: any) => {
            if (!mounted) return;
            if (data?.payer_costs) setInstallments(data.payer_costs);
          },
          onSubmit: async (event: any) => {
            event.preventDefault();
            setIsSubmitting(true);
            const d = cardForm.getCardFormData();
            onSuccess({
              token: d.token,
              payment_method_id: d.paymentMethodId,
              issuer_id: d.issuerId,
              installments: Number(d.installments) || 1,
              transaction_amount: Number(d.amount),
              payer: {
                email: d.cardholderEmail || email,
                identification: { type: d.identificationType, number: d.identificationNumber },
              },
            });
          },
        },
      });
      formRef.current = cardForm;
      cardFormInstance = cardForm;
    };

    // Polling: aguarda window.MercadoPago estar disponível (máx 10s)
    const waitForSDK = () => {
      if (window.MercadoPago) { init(); return; }
      let attempts = 0;
      intervalRef = setInterval(() => {
        attempts++;
        if (window.MercadoPago) {
          clearInterval(intervalRef);
          init();
        } else if (attempts >= 100) {
          clearInterval(intervalRef);
          if (mounted) onError('Não foi possível carregar o formulário de pagamento. Recarregue a página.');
        }
      }, 100);
    };

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      waitForSDK();
    } else {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = waitForSDK;
      document.head.appendChild(script);
    }

    return () => {
      mounted = false;
      if (intervalRef) clearInterval(intervalRef);
      // Limpa instâncias ao desmontar para permitir remontagem correta
      if (cardFormInstance) {
        try { cardFormInstance.unmount?.(); } catch (_) {}
        cardFormInstance = null;
      }
      mpInstance = null;
    };
  }, [total, email]);

  return (
    <div ref={containerRef}>
      {/* Container do MP SDK — id obrigatório para o cardForm localizar os campos */}
      <div id="loie-card-form" style={{ display: 'none' }}>
        <input type="hidden" id="mp__cardholderEmail" value={email} readOnly />
        <select id="mp__installments" style={{ display: 'none' }} />
        <select id="mp__identificationType" style={{ display: 'none' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={LABEL}>número do cartão</label>
          <div id="mp__cardNumber" style={IFRAME_CONTAINER} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={LABEL}>validade</label>
            <div id="mp__expirationDate" style={IFRAME_CONTAINER} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={LABEL}>código de segurança</label>
            <div id="mp__securityCode" style={IFRAME_CONTAINER} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={LABEL}>nome no cartão</label>
          <input
            id="mp__cardholderName"
            type="text"
            placeholder="Nome como no cartão"
            style={{ ...INPUT }}
            autoComplete="cc-name"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={LABEL}>documento</label>
            <select
              style={{ ...INPUT, appearance: 'none', cursor: 'pointer' }}
              value={docType}
              onChange={e => setDocType(e.target.value)}
            >
              <option value="CPF">CPF</option>
              <option value="CNPJ">CNPJ</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={LABEL}>número</label>
            <div id="mp__identificationNumber" style={IFRAME_CONTAINER} />
          </div>
        </div>

        <select id="mp__issuer" style={{ display: 'none' }} />

        {installments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={LABEL}>parcelas</label>
            <select
              style={{ ...INPUT, appearance: 'none', cursor: 'pointer' }}
              value={selectedInstallment}
              onChange={e => setSelectedInstallment(Number(e.target.value))}
            >
              {installments.map((p: any) => (
                <option key={p.installments} value={p.installments}>
                  {p.recommended_message || `${p.installments}x de R$ ${(total / p.installments).toFixed(2)}`}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="button"
          onClick={() => formRef.current?.createCardToken?.()}
          disabled={!mpReady || isSubmitting}
          style={{
            marginTop: 8, padding: '14px 24px',
            background: mpReady && !isSubmitting ? CHAR : `${CHAR}44`,
            color: CREME, border: 'none',
            fontFamily: "'Sackers Gothic', 'Cormorant Garamond', serif",
            fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase',
            cursor: mpReady && !isSubmitting ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {isSubmitting && <Loader2 size={14} className="animate-spin" />}
          {!mpReady ? 'carregando...' : isSubmitting ? 'processando...' : `pagar R$ ${total.toFixed(2)}`}
        </button>

        <p style={{ textAlign: 'center', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.78rem', color: `${CHAR}44` }}>
          pagamento seguro via Mercado Pago
        </p>
      </div>
    </div>
  );
};

// ─── Main Checkout ─────────────────────────────────────────────────────────────
const Checkout = () => {
  const { items, subtotal, clear } = useCart();
  const [step, setStep] = useState<CheckoutStep>('form');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [errorMessage, setErrorMessage] = useState('');
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_base64?: string } | null>(null);

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
      setStep('payment');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao criar pedido');
      setStep('error');
    }
  };

  const handleCardSuccess = useCallback(async (paymentData: any) => {
    setStep('processing');
    try {
      const result = await processPayment({ order_id: orderId!, ...paymentData });
      if (result.status === 'paid') { clear(); setStep('success'); }
      else if (result.status === 'pending') {
        setErrorMessage('Pagamento em análise. Você será notificado por e-mail.');
        setStep('error');
      } else {
        const msgs: Record<string, string> = {
          cc_rejected_insufficient_amount: 'Saldo insuficiente.',
          cc_rejected_bad_filled_security_code: 'Código de segurança inválido.',
          cc_rejected_bad_filled_date: 'Data de vencimento inválida.',
          cc_rejected_bad_filled_other: 'Dados do cartão inválidos.',
          cc_rejected_call_for_authorize: 'Ligue para a operadora.',
          cc_rejected_other_reason: 'Pagamento recusado. Tente outro cartão.',
        };
        setErrorMessage(msgs[result.mp_status_detail] || 'Pagamento recusado. Tente novamente.');
        setStep('error');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao processar pagamento.');
      setStep('error');
    }
  }, [orderId, clear]);

  const handlePixSuccess = useCallback((result: any) => {
    const qr = result.pix_qr_code
      || result.point_of_interaction?.transaction_data?.qr_code;
    const qrBase64 = result.pix_qr_code_base64
      || result.point_of_interaction?.transaction_data?.qr_code_base64;
    if (qr) {
      setPixData({ qr_code: qr, qr_code_base64: qrBase64 });
    } else {
      setErrorMessage('PIX gerado. Aguarde a confirmação por e-mail.');
      setStep('error');
    }
  }, []);

  const handlePaymentError = useCallback((msg: string) => {
    setErrorMessage(msg);
    setStep('error');
  }, []);

  if (items.length === 0 && step !== 'success') {
    return (
      <Layout>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: `${CHAR}55` }}>
            Seu carrinho está vazio.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(40px,6vw,80px) 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ ...LABEL, display: 'block', marginBottom: 12 }}>finalizar compra</span>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 300, color: CHAR, margin: 0, letterSpacing: '0.04em' }}>
            Checkout
          </h1>
          <div style={{ width: 40, height: 1, background: `${OLIVA}55`, margin: '20px auto 0' }} />
        </div>

        {step === 'success' ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <CheckCircle size={40} style={{ color: OLIVA, marginBottom: 20 }} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 300, color: CHAR, marginBottom: 12 }}>
              Pedido confirmado
            </h2>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: `${CHAR}66` }}>
              Você receberá um e-mail de confirmação em breve.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 48, alignItems: 'start' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

              {/* Customer data */}
              <section>
                <span style={{ ...LABEL, display: 'block', marginBottom: 20 }}>seus dados</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { id: 'name', label: 'nome completo', type: 'text' },
                    { id: 'email', label: 'e-mail', type: 'email' },
                    { id: 'phone', label: 'telefone', type: 'tel' },
                  ].map(field => (
                    <div key={field.id}>
                      <label style={{ ...LABEL, display: 'block', marginBottom: 6 }}>{field.label}</label>
                      <input
                        type={field.type}
                        value={form[field.id as keyof typeof form]}
                        onChange={e => setForm(f => ({ ...f, [field.id]: e.target.value }))}
                        disabled={step !== 'form'}
                        style={{ ...INPUT, opacity: step !== 'form' ? 0.5 : 1 }}
                        onFocus={e => (e.target.style.borderColor = `${CHAR}55`)}
                        onBlur={e => (e.target.style.borderColor = `${CHAR}22`)}
                      />
                      {errors[field.id] && (
                        <p style={{ color: '#c44', fontSize: '0.7rem', marginTop: 4, fontFamily: 'sans-serif' }}>
                          {errors[field.id]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <div style={{ height: 1, background: `${CHAR}11` }} />

              {/* Payment */}
              <section>
                <span style={{ ...LABEL, display: 'block', marginBottom: 20 }}>pagamento</span>

                {step === 'form' && (
                  <>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.95rem', color: `${CHAR}55`, marginBottom: 24 }}>
                      Preencha seus dados acima para continuar.
                    </p>
                    <button
                      onClick={handleContinueToPayment}
                      style={{
                        width: '100%', padding: '14px 24px', background: CHAR, color: CREME, border: 'none',
                        fontFamily: "'Sackers Gothic', 'Cormorant Garamond', serif",
                        fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      continuar para pagamento
                    </button>
                  </>
                )}

                {step === 'payment' && orderId && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {pixData ? (
                      <PixQRCode qrCode={pixData.qr_code} qrCodeBase64={pixData.qr_code_base64} amount={total} />
                    ) : (
                      <>
                        {/* Method selector */}
                        <div style={{ display: 'flex', gap: 0, border: `1px solid ${CHAR}22` }}>
                          {(['card', 'pix'] as PaymentMethod[]).map(method => (
                            <button
                              key={method}
                              onClick={() => setPaymentMethod(method)}
                              style={{
                                flex: 1, padding: '12px 16px',
                                background: paymentMethod === method ? CHAR : 'transparent',
                                color: paymentMethod === method ? CREME : `${CHAR}88`,
                                border: 'none', cursor: 'pointer',
                                fontFamily: "'Sackers Gothic', 'Cormorant Garamond', serif",
                                fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase',
                                transition: 'all 0.2s',
                              }}
                            >
                              {method === 'card' ? 'cartão' : 'pix'}
                            </button>
                          ))}
                        </div>

                        {paymentMethod === 'card' && (
                          <CardForm total={total} email={form.email} onSuccess={handleCardSuccess} onError={handlePaymentError} />
                        )}
                        {paymentMethod === 'pix' && (
                          <PixForm total={total} email={form.email} orderId={orderId} onSuccess={handlePixSuccess} onError={handlePaymentError} />
                        )}
                      </>
                    )}
                  </div>
                )}

                {step === 'processing' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '32px 0' }}>
                    <Loader2 size={18} className="animate-spin" style={{ color: CHAR }} />
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '0.95rem', color: `${CHAR}88` }}>
                      processando...
                    </span>
                  </div>
                )}

                {step === 'error' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <AlertCircle size={16} style={{ color: '#c44', flexShrink: 0, marginTop: 2 }} />
                      <p style={{ color: '#c44', fontSize: '0.82rem', fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.5 }}>
                        {errorMessage || 'Erro ao processar pagamento. Tente novamente.'}
                      </p>
                    </div>
                    <button
                      onClick={() => { setStep('form'); setErrorMessage(''); setPixData(null); }}
                      style={{
                        padding: '12px 24px', background: 'transparent', border: `1px solid ${CHAR}33`, color: CHAR,
                        fontFamily: "'Sackers Gothic', 'Cormorant Garamond', serif",
                        fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
                      }}
                    >
                      tentar novamente
                    </button>
                  </div>
                )}
              </section>
            </div>

            {/* Order summary */}
            <div style={{ position: 'sticky', top: 96, padding: 28, border: `1px solid ${CHAR}14`, background: `${CREME}44` }}>
              <span style={{ ...LABEL, display: 'block', marginBottom: 20 }}>resumo</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                {items.map(item => (
                  <div key={item.product.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {item.product.images?.[0] && (
                      <img src={item.product.images[0]} alt={item.product.name}
                        style={{ width: 44, height: 44, objectFit: 'cover', filter: 'saturate(0.6)' }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.95rem', color: CHAR, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.product.name}
                      </p>
                      <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.68rem', color: `${CHAR}55`, margin: 0 }}>
                        Qtd: {item.quantity}
                      </p>
                    </div>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem', color: CHAR, whiteSpace: 'nowrap' }}>
                      R$ {(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: `1px solid ${CHAR}14`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.88rem', color: `${CHAR}77` }}>Subtotal</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.88rem', color: CHAR }}>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.88rem', color: `${CHAR}77` }}>Frete</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.88rem', color: CHAR }}>
                    {shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${CHAR}14` }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', color: CHAR }}>Total</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 500, color: CHAR }}>
                    R$ {total.toFixed(2)}
                  </span>
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
