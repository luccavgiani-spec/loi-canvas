import { useState } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const CHAR  = '#29241f';
const OLIVA = '#565600';

const LABEL: React.CSSProperties = {
  fontFamily: "'Sackers Gothic', 'Wagon', sans-serif",
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
  fontFamily: "'Wagon', sans-serif",
  fontSize: '1rem',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

function getShippingInfo(cep: string): string {
  const digit = parseInt(cep[0], 10);
  if (digit <= 5) return 'Entrega estimada: 7 a 12 dias úteis — R$ 15,00';
  return 'Entrega estimada: 10 a 15 dias úteis — R$ 15,00';
}

type Status = 'idle' | 'loading' | 'ready' | 'error';

const ShippingCalculator = () => {
  const [cep, setCep] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [shippingMessage, setShippingMessage] = useState('');

  const handleCepChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    // Format as 00000-000
    const formatted = digits.length > 5
      ? `${digits.slice(0, 5)}-${digits.slice(5)}`
      : digits;
    setCep(formatted);

    if (digits.length === 8) {
      setStatus('loading');
      setShippingMessage('');

      const delay = 1500 + Math.random() * 500; // 1.5–2s

      fetch(`https://viacep.com.br/ws/${digits}/json/`)
        .then(r => r.json())
        .then(data => {
          setTimeout(() => {
            if (data.erro) {
              setStatus('error');
            } else {
              setShippingMessage(getShippingInfo(digits));
              setStatus('ready');
            }
          }, delay);
        })
        .catch(() => {
          setTimeout(() => {
            // If ViaCEP is unreachable, still show shipping (CEP format was valid)
            setShippingMessage(getShippingInfo(digits));
            setStatus('ready');
          }, delay);
        });
    } else {
      setStatus('idle');
      setShippingMessage('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ ...LABEL, display: 'block' }}>calcular frete — cep</label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="00000-000"
          value={cep}
          onChange={e => handleCepChange(e.target.value)}
          style={{ ...INPUT, maxWidth: 160 }}
          onFocus={e => (e.target.style.borderColor = `${CHAR}55`)}
          onBlur={e => (e.target.style.borderColor = `${CHAR}22`)}
        />
      </div>

      {status === 'loading' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Loader2 size={13} className="animate-spin" style={{ color: `${CHAR}66`, flexShrink: 0 }} />
          <span style={{
            fontFamily: "'Wagon', sans-serif",
            fontSize: '0.82rem',
            color: `${CHAR}77`,
          }}>
            Calculando prazo e custo de envio...
          </span>
        </div>
      )}

      {status === 'ready' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={13} style={{ color: OLIVA, flexShrink: 0 }} />
          <span style={{
            fontFamily: "'Wagon', sans-serif",
            fontSize: '0.88rem',
            color: CHAR,
          }}>
            {shippingMessage}
          </span>
        </div>
      )}

      {status === 'error' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={13} style={{ color: '#c44', flexShrink: 0 }} />
          <span style={{
            fontFamily: "'Wagon', sans-serif",
            fontSize: '0.82rem',
            color: '#c44',
          }}>
            CEP não encontrado.
          </span>
        </div>
      )}
    </div>
  );
};

export default ShippingCalculator;
export { getShippingInfo };
