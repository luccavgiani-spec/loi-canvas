import { useState, useEffect, useCallback, useRef } from 'react';
// checkout v3 - cardform nativo
import Layout from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { createOrder, processPayment } from '@/lib/api';
import { MP_PUBLIC_KEY, FREE_SHIPPING_THRESHOLD } from '@/config';
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

// ─── Shared style tokens ───────────────────────────────────────────────────────
const CHAR   = '#29241f';
const OLIVA  = '#565600';
const CREME  = '#f4edd2';
const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "'Sackers Gothic', 'Cormorant Garamond', serif",
  fontSize: '0.6rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: `${CHAR}99`,
};
const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: 'transparent',
  border: `1px solid ${CHAR}22`,
  borderRadius: 0,
  color: CHAR,
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: '1rem',
  fontWeight: 400,
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box' as const,
};

// ─── Secure MP field wrapper ───────────────────────────────────────────────────
const SecureField = ({
  id,
  label,
  placeholder,
}: {
  id: string;
  label: string;
  placeholder?: string;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={LABEL_STYLE}>{label}</label>
    <div
      id={id}
      style={{
        ...INPUT_STYLE,
        minHeight: 44,
        display: 'flex',
        alignItems: 'center',
      }}
    />
  </div>
);

// ─── Card Form component ───────────────────────────────────────────────────────
const CardForm = ({
  total,
  email,
  onSuccess,
  onError,
}: {
  total: number;
  email: string;
  onSuccess: (data: any) => void;
  onError: (msg: string) => void;
}) => {
  const formRef = useRef<any>(null);
  const [installments, setInstallments] = useState<any[]>([]);
  const [selectedInstallment, setSelectedInstallment] = useState(1);
  const [cardholderName, setCardholderName] = useState('');
  const [docType, setDocType] = useState('CPF');
  const [docNumber, setDocNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mpReady, setMpReady] = useState(false);

  useEffect(() => {
    const loadMP = () => {
      if (window.MercadoPago) {
        initCardForm();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = initCardForm;
      document.head.appendChild(script);
    };

    const initCardForm = () => {
      const mp = new window.MercadoPago(MP_PUBLIC_KEY, { locale: 'pt-BR' });

      const cardForm = mp.cardForm({
        amount: String(total),
        iframe: true,
        form: {
          id: 'loie-card-form',
          cardholderName: { id: 'form-checkout__cardholderName', placeholder: 'Nome no cartão' },
          cardholderEmail: { id: 'form-checkout__cardholderEmail', placeholder: email },
          cardNumber: { id: 'form-checkout__cardNumber', placeholder: '0000 0000 0000 0000' },
          expirationDate: { id: 'form-checkout__expirationDate', placeholder: 'MM/AA' },
          securityCode: { id: 'form-checkout__securityCode', placeholder: '000' },
          installments: { id: 'form-checkout__installments', placeholder: 'Parcelas' },
          identificationType: { id: 'form-checkout__identificationType', placeholder: 'CPF' },
          identificationNumber: { id: 'form-checkout__identificationNumber', placeholder: '000.000.000-00' },
          issuer: { id: 'form-checkout__issuer', placeholder: 'Banco emissor' },
        },
        callbacks: {
          onFormMounted: (error: any) => {
            if (error) { onError('Erro ao montar formulário de pagamento.'); return; }
            setMpReady(true);
          },
          onInstallmentsReceived: (error: any, data: any) => {
            if (!error && data?.payer_costs) setInstallments(data.payer_costs);
          },
          onSubmit: async (event: any) => {
            event.preventDefault();
            setIsSubmitting(true);
            const {
              paymentMethodId,
              issuerId,
              cardholderEmail,
              amount,
              token,
              installments: inst,
              identificationNumber,
              identificationType,
            } = cardForm.getCardFormData();

            onSuccess({
              token,
              payment_method_id: paymentMethodId,
              issuer_id: issuerId,
              installments: Number(inst),
              transaction_amount: Number(amount),
              payer: {
                email: cardholderEmail || email,
                identification: { type: identificationType, number: identificationNumber },
              },
            });
          },
          onFetching: (resource: string) => {
            // optional: show skeleton while fetching installments
          },
        },
      });

      formRef.current = cardForm;
    };

    loadMP();

    return () => {
  // cleanup intencional vazio - cardForm do MP não precisa de unmount manual
};
  }, [total, email]);

  const handleSubmit = () => {
    formRef.current?.createCardToken?.();
  };

  return (
    <div>
      <form id="loie-card-form" style={{ display: 'none' }}>
        <input type="hidden" id="form-checkout__cardholderEmail" value={email} />
        <input type="hidden" id="form-checkout__installments" />
        <input type="hidden" id="form-checkout__identificationType" />
        <input type="hidden" id="form-checkout__issuer" />
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Card Number */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={LABEL_STYLE}>número do cartão</label>
          <div id="form-checkout__cardNumber" style={{ ...INPUT_STYLE, minHeight: 44 }} />
        </div>

        {/* Expiry + CVV */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={LABEL_STYLE}>validade</label>
            <div id="form-checkout__expirationDate" style={{ ...INPUT_STYLE, minHeight: 44 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={LABEL_STYLE}>código de segurança</label>
            <div id="form-checkout__securityCode" style={{ ...INPUT_STYLE, minHeight: 44 }} />
          </div>
        </div>

        {/* Cardholder name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={LABEL_STYLE}>nome no cartão</label>
          <div id="form-checkout__cardholderName" style={{ ...INPUT_STYLE, minHeight: 44 }} />
        </div>

        {/* Doc type + number */}
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={LABEL_STYLE}>documento</label>
            <select
              style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }}
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              <option value="CPF">CPF</option>
              <option value="CNPJ">CNPJ</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={LABEL_STYLE}>número</label>
            <div id="form-checkout__identificationNumber" style={{ ...INPUT_STYLE, minHeight: 44 }} />
          </div>
        </div>

        {/* Issuer (hidden visually, required by MP) */}
        <div style={{ display: 'none' }}>
          <div id="form-checkout__issuer" />
        </div>

        {/* Installments */}
        {installments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={LABEL_STYLE}>parcelas</label>
            <select
              style={{ ...INPUT_STYLE, appearance: 'none', cursor: 'pointer' }}
              value={selectedInstallment}
              onChange={(e) => setSelectedInstallment(Number(e.target.value))}
            >
              {installments.map((p: any) => (
                <option key={p.installments} value={p.installments}>
                  {p.recommended_message || `${p.installments}x de R$ ${(total / p.installments).toFixed(2)}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!mpReady || isSubmitting}
          style={{
            marginTop: 8,
            width: '100%',
            padding: '14px 24px',
            background: mpReady && !isSubmitting ? CHAR : `${CHAR}55`,
            color: CREME,
            border: 'none',
            fontFamily: "'Sackers Gothic', 'Cormorant Garamond', serif",
            fontSize: '0.6rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            cursor: mpReady && !isSubmitting ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s',
          }}
        >
          {isSubmitting ? 'processando...' : `pagar R$ ${total.toFixed(2)}`}
        </button>

        {/* Security note */}
        <p style={{
          textAlign: 'center',
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: '0.78rem',
          color: `${CHAR}55`,
        }}>
          pagamento seguro via Mercado Pago
        </p>
      </div>
    </div>
  );
};

// ─── Main Checkout page ────────────────────────────────────────────────────────
const Checkout = () => {
  const { items, subtotal, clear } = useCart();
  const [step, setStep] = useState<CheckoutStep>('form');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 19.9;
  const total = subtotal + shipping;

  const handleContinueToPayment = async () => {
    const result = customerSchema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((e) => { errs[e.path[0] as string] = e.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep('processing');

    try {
      const orderItems = items.map((i) => ({
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
      console.error('Checkout error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao processar pedido');
      setStep('error');
    }
  };

  const handlePaymentSuccess = useCallback(async (paymentData: any) => {
    setStep('processing');
    try {
      const result = await processPayment({
        order_id: orderId!,
        ...paymentData,
      });

      if (result.status === 'paid') {
        clear();
        setStep('success');
      } else if (result.status === 'pending') {
        setErrorMessage('Pagamento em análise. Você será notificado por e-mail.');
        setStep('error');
      } else {
        const detail = result.mp_status_detail || '';
        const messages: Record<string, string> = {
          cc_rejected_other_reason: 'Pagamento recusado. Tente outro cartão.',
          cc_rejected_call_for_authorize: 'Ligue para a operadora do cartão.',
          cc_rejected_insufficient_amount: 'Saldo insuficiente.',
          cc_rejected_bad_filled_security_code: 'Código de segurança inválido.',
          cc_rejected_bad_filled_date: 'Data de vencimento inválida.',
          cc_rejected_bad_filled_other: 'Dados do cartão inválidos.',
        };
        setErrorMessage(messages[detail] || 'Pagamento recusado. Tente novamente.');
        setStep('error');
      }
    } catch (err) {
      console.error('Process payment error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao processar pagamento.');
      setStep('error');
    }
  }, [orderId, clear]);

  const handlePaymentError = useCallback((msg: string) => {
    setErrorMessage(msg);
    setStep('error');
  }, []);

  if (items.length === 0 && step !== 'success') {
    return (
      <Layout>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: `${CHAR}66` }}>
            Seu carrinho está vazio.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(40px, 6vw, 80px) 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ ...LABEL_STYLE, display: 'block', marginBottom: 12 }}>finalizar compra</span>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 300,
            color: CHAR,
            margin: 0,
            letterSpacing: '0.04em',
          }}>
            Checkout
          </h1>
          {/* thin decorative line */}
          <div style={{ width: 40, height: 1, background: `${OLIVA}55`, margin: '20px auto 0' }} />
        </div>

        {/* Success */}
        {step === 'success' ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <CheckCircle size={40} style={{ color: OLIVA, marginBottom: 20 }} />
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '2rem',
              fontWeight: 300,
              color: CHAR,
              marginBottom: 12,
            }}>
              Pedido confirmado
            </h2>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              color: `${CHAR}66`,
              fontSize: '1rem',
            }}>
              Você receberá um e-mail de confirmação em breve.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 48 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 48, alignItems: 'start' }}>

              {/* Left column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

                {/* Customer data */}
                <section>
                  <span style={{ ...LABEL_STYLE, display: 'block', marginBottom: 20 }}>seus dados</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                      { id: 'name', label: 'nome completo', type: 'text' },
                      { id: 'email', label: 'e-mail', type: 'email' },
                      { id: 'phone', label: 'telefone', type: 'tel' },
                    ].map((field) => (
                      <div key={field.id}>
                        <label style={{ ...LABEL_STYLE, display: 'block', marginBottom: 6 }}>
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          value={form[field.id as keyof typeof form]}
                          onChange={(e) => setForm((f) => ({ ...f, [field.id]: e.target.value }))}
                          disabled={step !== 'form'}
                          style={{
                            ...INPUT_STYLE,
                            opacity: step !== 'form' ? 0.5 : 1,
                          }}
                          onFocus={(e) => (e.target.style.borderColor = `${CHAR}55`)}
                          onBlur={(e) => (e.target.style.borderColor = `${CHAR}22`)}
                        />
                        {errors[field.id] && (
                          <p style={{ color: '#c44', fontSize: '0.7rem', marginTop: 4, fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                            {errors[field.id]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Divider */}
                <div style={{ height: 1, background: `${CHAR}11` }} />

                {/* Payment section */}
                <section>
                  <span style={{ ...LABEL_STYLE, display: 'block', marginBottom: 20 }}>pagamento</span>

                  {step === 'form' && (
                    <>
                      <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontStyle: 'italic',
                        fontSize: '0.95rem',
                        color: `${CHAR}55`,
                        marginBottom: 24,
                      }}>
                        Preencha seus dados acima para continuar.
                      </p>
                      <button
                        onClick={handleContinueToPayment}
                        style={{
                          width: '100%',
                          padding: '14px 24px',
                          background: CHAR,
                          color: CREME,
                          border: 'none',
                          fontFamily: "'Sackers Gothic', 'Cormorant Garamond', serif",
                          fontSize: '0.6rem',
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        continuar para pagamento
                      </button>
                    </>
                  )}

                  {step === 'payment' && orderId && (
                    <CardForm
                      total={total}
                      email={form.email}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  )}

                  {step === 'processing' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '32px 0' }}>
                      <Loader2 size={18} style={{ color: CHAR, animation: 'spin 1s linear infinite' }} className="animate-spin" />
                      <span style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontStyle: 'italic',
                        fontSize: '0.95rem',
                        color: `${CHAR}88`,
                      }}>
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
                        onClick={() => { setStep('form'); setErrorMessage(''); }}
                        style={{
                          padding: '12px 24px',
                          background: 'transparent',
                          color: CHAR,
                          border: `1px solid ${CHAR}33`,
                          fontFamily: "'Sackers Gothic', 'Cormorant Garamond', serif",
                          fontSize: '0.6rem',
                          letterSpacing: '0.18em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                        }}
                      >
                        tentar novamente
                      </button>
                    </div>
                  )}
                </section>
              </div>

              {/* Right column — Order summary */}
              <div style={{
                position: 'sticky',
                top: 96,
                padding: 28,
                border: `1px solid ${CHAR}14`,
                background: `${CREME}44`,
              }}>
                <span style={{ ...LABEL_STYLE, display: 'block', marginBottom: 20 }}>resumo</span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                  {items.map((item) => (
                    <div key={item.product.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {item.product.images?.[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          style={{ width: 44, height: 44, objectFit: 'cover', filter: 'saturate(0.6)' }}
                        />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: '0.95rem',
                          color: CHAR,
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
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
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Checkout;
