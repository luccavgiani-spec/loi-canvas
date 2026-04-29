// checkout v6 - CEP + endereço + frete fixo + validação completa
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { createOrder, processPayment, getPublicOrderConfirmation, validateCoupon } from '@/lib/api';
import type { Coupon } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  MP_PUBLIC_KEY,
  DEFAULT_FREE_SHIPPING_THRESHOLD,
  DEFAULT_SHIPPING_FLAT_RATE,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
} from '@/config';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { getShippingInfo } from '@/components/ShippingCalculator';
import { useSetting } from '@/hooks/useSetting';

declare global {
  interface Window {
    MercadoPago: any;
  }
}

const customerSchema = z.object({
  firstName:    z.string().trim().min(1, 'Nome obrigatório').max(100),
  lastName:     z.string().trim().min(1, 'Sobrenome obrigatório').max(100),
  email:        z.string().trim().email('E-mail inválido').max(255),
  phone:        z.string().trim().min(10, 'Telefone inválido').max(20),
  cep:          z.string().trim().min(8, 'CEP inválido'),
  street:       z.string().trim().min(1, 'Rua obrigatória'),
  number:       z.string().trim().min(1, 'Número obrigatório'),
  neighborhood: z.string().trim().min(1, 'Bairro obrigatório'),
  city:         z.string().trim().min(1, 'Cidade obrigatória'),
  state:        z.string().trim().min(1, 'Estado obrigatório'),
});

// Schema reduzido para retirada na loja: dispensa endereço.
const pickupCustomerSchema = z.object({
  firstName: z.string().trim().min(1, 'Nome obrigatório').max(100),
  lastName:  z.string().trim().min(1, 'Sobrenome obrigatório').max(100),
  email:     z.string().trim().email('E-mail inválido').max(255),
  phone:     z.string().trim().min(10, 'Telefone inválido').max(20),
  cep:          z.string().default(''),
  street:       z.string().default(''),
  number:       z.string().default(''),
  neighborhood: z.string().default(''),
  city:         z.string().default(''),
  state:        z.string().default(''),
});

type CheckoutStep = 'form' | 'payment' | 'processing' | 'success' | 'error';
type PaymentMethod = 'card' | 'pix';
type ShippingStatus = 'idle' | 'loading' | 'ready' | 'error';

const CHAR  = '#29241f';
const OLIVA = '#565600';
const CREME = '#f4edd2';

const LABEL: React.CSSProperties = {
  fontFamily: "'Sackers Gothic', sans-serif",
  fontWeight: 300,
  fontSize: '0.75rem',
  letterSpacing: '0.28em',
  textTransform: 'uppercase' as const,
  color: CHAR,
};

const INPUT: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: 'transparent',
  border: `1px solid ${CHAR}22`,
  borderRadius: 0,
  color: CHAR,
  fontFamily: "'Wagon', sans-serif",
  fontSize: '1.5rem',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

const IFRAME_CONTAINER: React.CSSProperties = {
  width: '100%',
  height: 46,
  minHeight: 46,
  border: `1px solid ${CHAR}22`,
  borderRadius: 0,
  background: 'transparent',
  boxSizing: 'border-box' as const,
  overflow: 'hidden',
  position: 'relative' as const,
  display: 'block',
};

const MP_IFRAME_CSS = `
  div[id^="mp__"] iframe {
    width: 100% !important;
    height: 46px !important;
    border: none !important;
    padding: 0 14px !important;
    font-family: 'Wagon', sans-serif !important;
    font-size: 1.5rem !important;
    color: ${CHAR} !important;
    background: transparent !important;
  }
`;

// ─── PIX form ─────────────────────────────────────────────────────────────────
const PixForm = ({
  total, email, orderId, firstName, lastName, phone, address, onSuccess, onError,
}: {
  total: number; email: string; orderId: string;
  firstName: string; lastName: string; phone: string;
  address: { zip_code: string; street_name: string; street_number: string };
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
          payer: {
            email,
            first_name: firstName,
            last_name: lastName,
            phone,
            address,
          },
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
      <p style={{ fontFamily: "'Wagon', sans-serif", fontSize: '1.05rem', color: CHAR, lineHeight: 1.6 }}>
        Clique no botão abaixo para gerar o QR Code PIX. O pagamento é confirmado instantaneamente.
      </p>
      <button
        onClick={handlePix}
        disabled={loading}
        style={{
          padding: '14px 24px',
          background: loading ? `${OLIVA}55` : OLIVA,
          color: '#ffffff', border: 'none',
          fontFamily: "'Sackers Gothic', sans-serif", fontWeight: 400,
          fontSize: '0.75rem', letterSpacing: '0.28em', textTransform: 'uppercase',
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
      <div style={{ ...INPUT, padding: '10px 14px', fontSize: '1.05rem', fontFamily: 'monospace', wordBreak: 'break-all', background: `${CHAR}05`, userSelect: 'all', cursor: 'text' }}>
        {qrCode}
      </div>
      <button
        onClick={() => navigator.clipboard.writeText(qrCode)}
        style={{
          padding: '10px 20px', background: 'transparent', border: `1px solid ${CHAR}33`, color: CHAR,
          fontFamily: "'Sackers Gothic', sans-serif", fontWeight: 400,
          fontSize: '0.75rem', letterSpacing: '0.28em', textTransform: 'uppercase', cursor: 'pointer',
        }}
      >
        copiar código
      </button>
    </div>
    <p style={{ fontFamily: "'Wagon', sans-serif", fontSize: '1rem', color: CHAR, textAlign: 'center' }}>
      R$ {amount.toFixed(2)} — você receberá a confirmação por e-mail assim que o pagamento for processado.
    </p>
  </div>
);

// ─── Card form ────────────────────────────────────────────────────────────────
const SCRIPT_ID = 'mp-sdk-v2';
let mpInstance: any = null;
let cardFormInstance: any = null;

const CardForm = ({
  total, email, firstName, lastName, phone, address, onSuccess, onError,
}: {
  total: number; email: string;
  firstName: string; lastName: string; phone: string;
  address: { zip_code: string; street_name: string; street_number: string };
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
    if (!containerRef.current) return;

    let mounted = true;
    let intervalRef: ReturnType<typeof setInterval> | undefined;

    const init = () => {
      if (!mounted) return;

      const requiredIds = [
        'mp__cardNumber', 'mp__expirationDate', 'mp__securityCode',
        'mp__cardholderName', 'mp__identificationNumber',
      ];
      const allPresent = requiredIds.every(id => document.getElementById(id));
      if (!allPresent) {
        setTimeout(init, 50);
        return;
      }

      const firstEl = document.getElementById('mp__cardNumber');
      const rect = firstEl?.getBoundingClientRect();
      if (!rect || (rect.width === 0 && rect.height === 0)) {
        requestAnimationFrame(() => setTimeout(init, 100));
        return;
      }

      if (!mpInstance) {
        mpInstance = new window.MercadoPago(MP_PUBLIC_KEY, { locale: 'pt-BR' });
      }
      const deviceId = mpInstance.getDeviceId?.() || '';
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
            event?.preventDefault?.();
          },
          onCardTokenReceived: (errors: any, token: any) => {
            if (!mounted) return;
            if (errors && errors.length > 0) {
              console.error('Token errors:', errors);
              setIsSubmitting(false);
              onError(errors.map((e: any) => e.message || e.cause).join(', ') || 'Dados do cartão inválidos.');
              return;
            }
            const d = cardForm.getCardFormData();
            onSuccess({
              token: token?.id || d.token,
              payment_method_id: d.paymentMethodId,
              issuer_id: d.issuerId,
              installments: Number(d.installments) || selectedInstallment || 1,
              transaction_amount: Number(d.amount),
              device_id: deviceId,
              payer: {
                email: d.cardholderEmail || email,
                first_name: firstName,
                last_name: lastName,
                phone,
                identification: { type: d.identificationType, number: d.identificationNumber },
                address,
              },
            });
          },
        },
      });
      formRef.current = cardForm;
      cardFormInstance = cardForm;
    };

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
      if (cardFormInstance) {
        try { cardFormInstance.unmount?.(); } catch (_) {}
        cardFormInstance = null;
      }
      mpInstance = null;
    };
  }, [total, email]);

  return (
    <div ref={containerRef}>
      <style dangerouslySetInnerHTML={{ __html: MP_IFRAME_CSS }} />
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
            style={{ ...INPUT, height: 46, padding: '11px 14px' }}
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
            <input
              id="mp__identificationNumber"
              type="text"
              placeholder="000.000.000-00"
              style={{ ...INPUT, height: 46, padding: '11px 14px' }}
              autoComplete="off"
            />
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
          onClick={() => {
            if (!formRef.current || isSubmitting) return;
            setIsSubmitting(true);
            formRef.current.createCardToken?.();
          }}
          disabled={!mpReady || isSubmitting}
          style={{
            marginTop: 8, padding: '16px 24px',
            background: mpReady && !isSubmitting ? CHAR : `${CHAR}55`,
            color: '#ffffff', border: 'none',
            fontFamily: "'Sackers Gothic', sans-serif", fontWeight: 400,
            fontSize: '0.75rem', letterSpacing: '0.28em', textTransform: 'uppercase',
            cursor: mpReady && !isSubmitting ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'opacity 0.2s',
            width: '100%',
          }}
          onMouseEnter={e => { if (mpReady && !isSubmitting) e.currentTarget.style.opacity = '0.88'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          {isSubmitting && <Loader2 size={14} className="animate-spin" />}
          {!mpReady ? 'carregando...' : isSubmitting ? 'processando...' : 'finalizar compra'}
        </button>

        <p style={{ textAlign: 'center', fontFamily: "'Wagon', sans-serif", fontSize: '0.9rem', color: CHAR }}>
          pagamento seguro via Mercado Pago
        </p>
      </div>
    </div>
  );
};

// ─── Main Checkout ─────────────────────────────────────────────────────────────
const Checkout = () => {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<CheckoutStep>('form');
  const [form, setForm] = useState({
    firstName: '', lastName: '',
    email: '', phone: '',
    cep: '', street: '', number: '', neighborhood: '', city: '', state: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [errorMessage, setErrorMessage] = useState('');
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_base64?: string } | null>(null);
  const [shippingStatus, setShippingStatus] = useState<ShippingStatus>('idle');
  const [shippingMessage, setShippingMessage] = useState('');
  // FIX: estado para detectar mobile e colapsar grid
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Polling pos-pagamento Pix: chama get-order-public a cada 3s ate
  // status='paid' (mp-webhook atualiza). Timeout 5 min. Card aprovado
  // ja redireciona direto em handleCardSuccess; cartao 'em analise' nao
  // entra aqui (vai para tela de erro).
  useEffect(() => {
    if (!pixData || !orderId) return;

    let cancelled = false;
    const startedAt = Date.now();
    const TIMEOUT_MS = 5 * 60 * 1000;
    let timedOut = false;

    const interval = setInterval(async () => {
      if (cancelled) return;
      if (Date.now() - startedAt > TIMEOUT_MS) {
        timedOut = true;
        clearInterval(interval);
        toast({
          title: 'Pagamento ainda não confirmado.',
          description: 'Verifique seu email ou recarregue a página em alguns instantes.',
        });
        return;
      }
      try {
        const order = await getPublicOrderConfirmation(orderId);
        if (cancelled) return;
        if (order.status === 'paid') {
          clearInterval(interval);
          clear();
          navigate(`/pedido-confirmado?order_id=${orderId}`);
        }
      } catch (err) {
        // Falha transitoria — proximo tick tenta de novo. Sem toast spam.
        console.warn('[checkout polling] tick failed', err);
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      // Apenas evita warning de unused — sinaliza intencao do flag.
      void timedOut;
    };
  }, [pixData, orderId, clear, navigate, toast]);

  const { amount: freeShippingThreshold } = useSetting<{ amount: number }>(
    'free_shipping_threshold',
    { amount: DEFAULT_FREE_SHIPPING_THRESHOLD },
  );
  const { amount: shippingFlatRate } = useSetting<{ amount: number }>(
    'shipping_flat_rate',
    { amount: DEFAULT_SHIPPING_FLAT_RATE },
  );
  const { address: pickupAddress } = useSetting<{ address: string }>(
    'pickup_address',
    { address: '(endereço a definir)' },
  );
  const [isPickup, setIsPickup] = useState(false);
  const shipping = isPickup
    ? 0
    : (subtotal >= freeShippingThreshold ? 0 : shippingFlatRate);

  // Cupom
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  const total = Math.max(0, subtotal + shipping - discount);

  // Quando o subtotal/itens mudam, re-validar cupom aplicado.
  // Carrinho pode ter mudado (item removido, qty alterada) e a regra
  // de coleção ou pedido mínimo pode ter virado.
  useEffect(() => {
    if (!appliedCoupon) return;
    let cancelled = false;
    validateCoupon(appliedCoupon.code, items, subtotal).then(res => {
      if (cancelled) return;
      if (!res.valid) {
        setAppliedCoupon(null);
        setDiscount(0);
        toast({ title: res.reason ?? 'Cupom não pôde ser aplicado.', variant: 'destructive' });
      } else {
        setDiscount(res.discount ?? 0);
      }
    });
    return () => { cancelled = true; };
  }, [items, subtotal, appliedCoupon, toast]);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    try {
      const res = await validateCoupon(code, items, subtotal);
      if (!res.valid) {
        toast({ title: res.reason ?? 'Cupom inválido.', variant: 'destructive' });
        return;
      }
      setAppliedCoupon(res.coupon ?? null);
      setDiscount(res.discount ?? 0);
      setCouponInput('');
      toast({ title: 'Cupom aplicado.' });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
  };

  const isFormComplete = isPickup
    ? !!(form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.phone.trim())
    : !!(
        form.firstName.trim() && form.lastName.trim() &&
        form.email.trim() && form.phone.trim() &&
        form.cep.replace(/\D/g, '').length >= 8 &&
        form.street.trim() && form.number.trim() &&
        form.neighborhood.trim() && form.city.trim() && form.state.trim()
      );

  const handleCepChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 5
      ? `${digits.slice(0, 5)}-${digits.slice(5)}`
      : digits;
    setForm(f => ({ ...f, cep: formatted }));

    if (digits.length === 8) {
      setShippingStatus('loading');
      setShippingMessage('');

      const delay = 1500 + Math.random() * 500;

      fetch(`https://viacep.com.br/ws/${digits}/json/`)
        .then(r => r.json())
        .then(data => {
          if (data.erro) {
            setTimeout(() => setShippingStatus('error'), delay);
          } else {
            setForm(f => ({
              ...f,
              street:       data.logradouro || f.street,
              neighborhood: data.bairro      || f.neighborhood,
              city:         data.localidade  || f.city,
              state:        data.uf          || f.state,
            }));
            setTimeout(() => {
              setShippingMessage(getShippingInfo(digits, shippingFlatRate));
              setShippingStatus('ready');
            }, delay);
          }
        })
        .catch(() => {
          setTimeout(() => {
            setShippingMessage(getShippingInfo(digits, shippingFlatRate));
            setShippingStatus('ready');
          }, delay);
        });
    } else {
      setShippingStatus('idle');
      setShippingMessage('');
    }
  };

  const handleContinueToPayment = async () => {
    const schema = isPickup ? pickupCustomerSchema : customerSchema;
    const result = schema.safeParse(form);
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
        is_pickup: isPickup,
        coupon_code: appliedCoupon?.code,
        customer: {
          name: `${result.data.firstName} ${result.data.lastName}`,
          email: result.data.email,
          phone: result.data.phone,
          address: {
            cep:          result.data.cep,
            street:       result.data.street,
            number:       result.data.number,
            neighborhood: result.data.neighborhood,
            city:         result.data.city,
            state:        result.data.state,
          },
        } as any,
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
      if (result.status === 'paid') {
        clear();
        navigate(`/pedido-confirmado?order_id=${orderId}`);
      } else if (result.status === 'pending') {
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
    const qr = result.pix?.qr_code;
    const qrBase64 = result.pix?.qr_code_base64;

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
          <p style={{ fontFamily: "'Wagon', sans-serif", color: CHAR }}>
            Seu carrinho está vazio.
          </p>
        </div>
      </Layout>
    );
  }

  const fieldDisabled = step !== 'form';

  const fieldInput = (
    id: keyof typeof form,
    label: string,
    type = 'text',
    placeholder = '',
    extraStyle: React.CSSProperties = {},
  ) => (
    <div key={id}>
      <label style={{ ...LABEL, display: 'block', marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={form[id]}
        onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
        disabled={fieldDisabled}
        placeholder={placeholder}
        style={{ ...INPUT, opacity: fieldDisabled ? 0.5 : 1, ...extraStyle }}
        onFocus={e => (e.target.style.borderColor = `${CHAR}55`)}
        onBlur={e => (e.target.style.borderColor = `${CHAR}22`)}
      />
      {errors[id] && (
        <p style={{ color: '#c44', fontSize: '0.85rem', marginTop: 4, fontFamily: 'sans-serif' }}>
          {errors[id]}
        </p>
      )}
    </div>
  );

  // FIX: resumo aparece antes do formulário no mobile (order), depois no desktop (sidebar)
  const orderSummary = (
    <div style={{
      padding: isMobile ? '20px 0 28px' : 28,
      border: isMobile ? 'none' : `1px solid ${CHAR}14`,
      borderTop: isMobile ? `1px solid ${CHAR}14` : undefined,
      borderBottom: isMobile ? `1px solid ${CHAR}14` : undefined,
      background: isMobile ? 'transparent' : `${CREME}44`,
      // sticky apenas no desktop
      position: isMobile ? 'static' : 'sticky' as const,
      top: isMobile ? undefined : 96,
    }}>
      <span style={{ ...LABEL, display: 'block', marginBottom: 20 }}>resumo</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
        {items.map(item => (
          <div key={item.product.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {item.product.images?.[0] && (
              <img src={item.product.images[0]} alt={item.product.name}
                style={{ width: 44, height: 44, objectFit: 'cover', filter: 'saturate(0.6)', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'Wagon', sans-serif", fontSize: '1rem', color: CHAR, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.product.name}
              </p>
              <p style={{ fontFamily: "'Sackers Gothic', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: CHAR, margin: 0 }}>
                Qtd: {item.quantity}
              </p>
            </div>
            <span style={{ fontFamily: "'Wagon', sans-serif", fontSize: '1rem', color: CHAR, whiteSpace: 'nowrap' }}>
              R$ {(item.product.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${CHAR}14`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Wagon', sans-serif", fontSize: '1rem', color: CHAR }}>Subtotal</span>
          <span style={{ fontFamily: "'Wagon', sans-serif", fontSize: '1rem', color: CHAR }}>R$ {subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Wagon', sans-serif", fontSize: '1rem', color: CHAR }}>
            {isPickup ? 'Retirada na loja' : 'Frete'}
          </span>
          <span style={{ fontFamily: "'Wagon', sans-serif", fontSize: '1rem', color: CHAR }}>
            {shipping === 0 ? 'Grátis' : `R$ ${shipping.toFixed(2)}`}
          </span>
        </div>

        {/* Cupom de desconto */}
        {!appliedCoupon ? (
          <div style={{ paddingTop: 10, borderTop: `1px solid ${CHAR}14`, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ ...LABEL, fontSize: '0.7rem' }}>cupom de desconto</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon(); } }}
                placeholder="código"
                disabled={fieldDisabled || couponLoading}
                style={{ ...INPUT, fontSize: '1rem', flex: 1, padding: '8px 12px' }}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={fieldDisabled || couponLoading || !couponInput.trim()}
                style={{
                  ...LABEL,
                  fontSize: '0.7rem',
                  padding: '8px 16px',
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  cursor: couponLoading ? 'wait' : 'pointer',
                  opacity: (fieldDisabled || !couponInput.trim()) ? 0.5 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {couponLoading ? '...' : 'aplicar'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: `1px solid ${CHAR}14` }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: "'Wagon', sans-serif", fontSize: '1rem', color: OLIVA }}>
                Desconto ({appliedCoupon.code})
              </span>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                disabled={fieldDisabled}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'sans-serif', fontSize: '0.75rem', color: `${CHAR}99`, textDecoration: 'underline', textAlign: 'left' }}
              >
                remover
              </button>
            </div>
            <span style={{ fontFamily: "'Wagon', sans-serif", fontSize: '1rem', color: OLIVA }}>
              − R$ {discount.toFixed(2)}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${CHAR}14` }}>
          <span style={{ fontFamily: "'Wagon', sans-serif", fontSize: '1.15rem', color: CHAR }}>Total</span>
          <span style={{ fontFamily: "'Wagon', sans-serif", fontSize: '1.25rem', fontWeight: 500, color: CHAR }}>
            R$ {total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(40px,6vw,80px) 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ ...LABEL, display: 'block', marginBottom: 12 }}>finalizar compra</span>
          <h1 style={{ fontFamily: "'Wagon', sans-serif", fontSize: 'clamp(2.4rem,6vw,4.8rem)', fontWeight: 300, color: CHAR, margin: 0, letterSpacing: '0.04em' }}>
            Checkout
          </h1>
          <div style={{ width: 40, height: 1, background: `${OLIVA}55`, margin: '20px auto 0' }} />
        </div>

        {step === 'success' ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <CheckCircle size={40} style={{ color: OLIVA, marginBottom: 20 }} />
            <h2 style={{ fontFamily: "'Wagon', sans-serif", fontSize: '2.5rem', fontWeight: 300, color: CHAR, marginBottom: 12 }}>
              Pedido confirmado
            </h2>
            <p style={{ fontFamily: "'Wagon', sans-serif", color: CHAR }}>
              Você receberá um e-mail de confirmação em breve.
            </p>
          </div>
        ) : (
          // FIX: grid colapsa para coluna única no mobile
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 320px',
            gap: isMobile ? 32 : 48,
            alignItems: 'start',
          }}>

            {/* No mobile, resumo aparece primeiro (topo) */}
            {isMobile && orderSummary}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 40, minWidth: 0 }}>

              {/* ── Seus dados ── */}
              <section>
                <span style={{ ...LABEL, display: 'block', marginBottom: 20 }}>seus dados</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* FIX: nome/sobrenome em coluna única no mobile */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
                    {fieldInput('firstName', 'nome')}
                    {fieldInput('lastName',  'sobrenome')}
                  </div>

                  {fieldInput('email', 'e-mail', 'email')}
                  {fieldInput('phone', 'telefone', 'tel')}

                </div>
              </section>

              <div style={{ height: 1, background: `${CHAR}11` }} />

              {/* ── Retirada na loja ── */}
              <section>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    cursor: 'pointer',
                    padding: 16,
                    border: `1px solid ${CHAR}22`,
                    borderRadius: 4,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isPickup}
                    onChange={e => setIsPickup(e.target.checked)}
                    style={{ marginTop: 4, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Wagon', sans-serif", fontSize: '1rem', color: CHAR, marginBottom: 4 }}>
                      retirar na loja (R$ 0,00 · até 5 dias úteis)
                    </div>
                    {isPickup && (
                      <div style={{ fontFamily: "'Wagon', sans-serif", fontSize: '0.95rem', color: `${CHAR}aa`, lineHeight: 1.5 }}>
                        endereço para retirada: {pickupAddress}
                      </div>
                    )}
                  </div>
                </label>
              </section>

              {!isPickup && <div style={{ height: 1, background: `${CHAR}11` }} />}

              {/* ── Endereço de entrega ── */}
              {!isPickup && (
              <section>
                <span style={{ ...LABEL, display: 'block', marginBottom: 20 }}>endereço de entrega</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  <div>
                    <label style={{ ...LABEL, display: 'block', marginBottom: 6 }}>cep</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="00000-000"
                      value={form.cep}
                      onChange={e => handleCepChange(e.target.value)}
                      disabled={fieldDisabled}
                      style={{ ...INPUT, maxWidth: 160, opacity: fieldDisabled ? 0.5 : 1 }}
                      onFocus={e => (e.target.style.borderColor = `${CHAR}55`)}
                      onBlur={e => (e.target.style.borderColor = `${CHAR}22`)}
                    />
                    {errors.cep && (
                      <p style={{ color: '#c44', fontSize: '0.85rem', marginTop: 4, fontFamily: 'sans-serif' }}>
                        {errors.cep}
                      </p>
                    )}

                    {shippingStatus === 'loading' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <Loader2 size={13} className="animate-spin" style={{ color: `${CHAR}66`, flexShrink: 0 }} />
                        <span style={{ fontFamily: "'Wagon', sans-serif", fontSize: '0.95rem', color: CHAR }}>
                          Calculando prazo e custo de envio...
                        </span>
                      </div>
                    )}
                    {shippingStatus === 'ready' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <CheckCircle size={13} style={{ color: OLIVA, flexShrink: 0 }} />
                        <span style={{ fontFamily: "'Wagon', sans-serif", fontSize: '0.95rem', color: CHAR }}>
                          {shippingMessage}
                        </span>
                      </div>
                    )}
                    {shippingStatus === 'error' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <AlertCircle size={13} style={{ color: '#c44', flexShrink: 0 }} />
                        <span style={{ fontFamily: "'Wagon', sans-serif", fontSize: '0.95rem', color: '#c44' }}>
                          CEP não encontrado.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* FIX: rua/número em coluna única no mobile */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 100px', gap: 16 }}>
                    {fieldInput('street', 'rua')}
                    {fieldInput('number', 'número')}
                  </div>

                  {/* FIX: bairro/cidade/estado empilhados no mobile */}
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 80px', gap: 16 }}>
                    {fieldInput('neighborhood', 'bairro')}
                    {fieldInput('city',         'cidade')}
                    {fieldInput('state',        'estado')}
                  </div>

                </div>
              </section>
              )}

              <div style={{ height: 1, background: `${CHAR}11` }} />

              {/* ── Pagamento ── */}
              <section>
                <span style={{ ...LABEL, display: 'block', marginBottom: 20 }}>pagamento</span>

                {step === 'form' && (
                  <>
                    {!isFormComplete && (
                      <p style={{ fontFamily: "'Wagon', sans-serif", fontSize: '1rem', color: CHAR, marginBottom: 24 }}>
                        Preencha todos os dados acima para continuar.
                      </p>
                    )}
                    <button
                      onClick={handleContinueToPayment}
                      disabled={!isFormComplete}
                      style={{
                        width: '100%', padding: '14px 24px',
                        background: isFormComplete ? CHAR : `${CHAR}44`,
                        color: '#ffffff', border: 'none',
                        fontFamily: "'Sackers Gothic', sans-serif", fontWeight: 400,
                        fontSize: '0.75rem', letterSpacing: '0.28em', textTransform: 'uppercase',
                        cursor: isFormComplete ? 'pointer' : 'not-allowed',
                        transition: 'background 0.2s',
                        // FIX: garante que o botão não quebre o texto em mobile
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      onMouseEnter={e => { if (isFormComplete) e.currentTarget.style.opacity = '0.85'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
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
                        <div style={{ display: 'flex', gap: 0, border: `1px solid ${CHAR}22` }}>
                          {(['card', 'pix'] as PaymentMethod[]).map(method => (
                            <button
                              key={method}
                              onClick={() => setPaymentMethod(method)}
                              style={{
                                flex: 1, padding: '12px 16px',
                                background: paymentMethod === method ? CHAR : 'transparent',
                                color: paymentMethod === method ? '#ffffff' : CHAR,
                                border: 'none', cursor: 'pointer',
                                fontFamily: "'Sackers Gothic', sans-serif", fontWeight: 400,
                                fontSize: '0.75rem', letterSpacing: '0.28em', textTransform: 'uppercase',
                                transition: 'all 0.2s',
                              }}
                            >
                              {method === 'card' ? 'cartão' : 'pix'}
                            </button>
                          ))}
                        </div>

                        {paymentMethod === 'card' && (
                          <CardForm
                            total={total}
                            email={form.email}
                            firstName={form.firstName}
                            lastName={form.lastName}
                            phone={form.phone.replace(/\D/g, '')}
                            address={{
                              zip_code: form.cep.replace(/\D/g, ''),
                              street_name: form.street,
                              street_number: form.number,
                            }}
                            onSuccess={handleCardSuccess}
                            onError={handlePaymentError}
                          />
                        )}
                        {paymentMethod === 'pix' && (
                          <PixForm
                            total={total}
                            email={form.email}
                            orderId={orderId}
                            firstName={form.firstName}
                            lastName={form.lastName}
                            phone={form.phone.replace(/\D/g, '')}
                            address={{
                              zip_code: form.cep.replace(/\D/g, ''),
                              street_name: form.street,
                              street_number: form.number,
                            }}
                            onSuccess={handlePixSuccess}
                            onError={handlePaymentError}
                          />
                        )}
                      </>
                    )}
                  </div>
                )}

                {step === 'processing' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '32px 0' }}>
                    <Loader2 size={18} className="animate-spin" style={{ color: CHAR }} />
                    <span style={{ fontFamily: "'Wagon', sans-serif", fontSize: '1rem', color: CHAR }}>
                      processando...
                    </span>
                  </div>
                )}

                {step === 'error' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <AlertCircle size={16} style={{ color: '#c44', flexShrink: 0, marginTop: 2 }} />
                      <p style={{ color: '#c44', fontSize: '1rem', fontFamily: "'Wagon', sans-serif", lineHeight: 1.5 }}>
                        {errorMessage || 'Erro ao processar pagamento. Tente novamente.'}
                      </p>
                    </div>
                    <button
                      onClick={() => { setStep('form'); setErrorMessage(''); setPixData(null); }}
                      style={{
                        padding: '12px 24px', background: 'transparent', border: `1px solid ${CHAR}33`, color: CHAR,
                        fontFamily: "'Sackers Gothic', sans-serif", fontWeight: 400,
                        fontSize: '0.75rem', letterSpacing: '0.28em', textTransform: 'uppercase', cursor: 'pointer',
                      }}
                    >
                      tentar novamente
                    </button>
                  </div>
                )}
              </section>
            </div>

            {/* No desktop, resumo aparece como sidebar à direita */}
            {!isMobile && orderSummary}

          </div>
        )}
      </div>
    </Layout>
  );
};

export default Checkout;
