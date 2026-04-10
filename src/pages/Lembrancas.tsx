import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { lembrancasUrl } from '@/lib/storage';
import { sendCampaignEmail } from '@/lib/api';

const FlameIcon = () => (
  <svg width="24" height="32" viewBox="0 0 24 32" fill="none" aria-hidden="true">
    <path
      d="M12 2 C12 2 20 10 20 18 C20 22.4 16.4 26 12 26 C7.6 26 4 22.4 4 18 C4 10 12 2 12 2Z"
      stroke="#989857"
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M12 14 C12 14 15 17 15 20 C15 21.7 13.7 23 12 23 C10.3 23 9 21.7 9 20 C9 17 12 14 12 14Z"
      fill="#989857"
      opacity="0.6"
    />
  </svg>
);

const inputStyle: React.CSSProperties = {
  border: '1px solid rgba(86,86,0,0.2)',
  background: 'transparent',
  fontFamily: "'Sackers Gothic', sans-serif",
  fontWeight: 300,
  fontSize: '0.85rem',
  outline: 'none',
  padding: '12px 16px',
  width: '100%',
  color: '#29241f',
};

const OCASIOES = [
  { value: '', label: 'selecione a ocasião' },
  { value: 'casamento', label: 'casamento' },
  { value: 'madrinha', label: 'madrinha / padrinho' },
  { value: 'presente', label: 'presente corporativo' },
  { value: 'outro', label: 'outro' },
];

const GALERIA = [
  'andreloie-82.webp',
  'andreloie-86.webp',
  'Loie II-8.webp',
  'andreloie-81.webp',
];

const CONVERSAO = [
  {
    titulo: 'casamentos & cerimônias',
    desc: 'lembranças que marcam o início de uma história',
  },
  {
    titulo: 'madrinhas & padrinhos',
    desc: 'um gesto de cuidado para quem esteve presente',
  },
  {
    titulo: 'presentes corporativos',
    desc: 'sofisticação como assinatura da sua marca',
  },
];

type Status = 'idle' | 'sending' | 'sent' | 'error';

const Lembrancas = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [ocasiao, setOcasiao] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const html = `
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp || '—'}</p>
        <p><strong>Ocasião:</strong> ${ocasiao || '—'}</p>
        <p><strong>Quantidade estimada:</strong> ${quantidade || '—'}</p>
        <p><strong>Mensagem:</strong><br/>${mensagem.replace(/\n/g, '<br/>')}</p>
      `;
      await sendCampaignEmail(
        `nova proposta — ${ocasiao || 'outro'}`,
        html,
        'contato@loie.com.br',
      );
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <Layout>
      {/* ─── HERO ─── */}
      <section
        style={{
          position: 'relative',
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `url(${lembrancasUrl('andreloie-81.webp')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(41,36,31,0.38), rgba(41,36,31,0.68))',
          }}
        />
        <div
          style={{
            position: 'relative',
            textAlign: 'center',
            padding: '0 24px',
            maxWidth: '760px',
          }}
        >
          <h1
            className="heading-display"
            style={{
              fontSize: 'clamp(2.8rem, 6vw, 5rem)',
              color: '#f4edd2',
              lineHeight: 1.1,
              marginBottom: '1.2rem',
            }}
          >
            lembranças sob curadoria
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 300,
              fontSize: 'clamp(0.75rem, 1.4vw, 0.9rem)',
              letterSpacing: '0.15em',
              color: 'rgba(244,237,210,0.75)',
              margin: 0,
            }}
          >
            lembrança — memória e sofisticação
          </p>
        </div>
      </section>

      {/* ─── STORYTELLING ─── */}
      <section
        style={{
          background: '#f4edd2',
          padding: 'clamp(64px, 10vw, 112px) 24px',
        }}
      >
        <p
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            fontFamily: "var(--font-body)",
            fontWeight: 300,
            fontSize: 'clamp(0.88rem, 1.5vw, 1.02rem)',
            lineHeight: 2.1,
            textAlign: 'justify',
            color: '#29241f',
          }}
        >
          há gestos que permanecem.<br />
          as lembranças da loiê nascem com esse propósito: transformar
          ocasiões em presenças sensoriais que atravessam o tempo.<br />
          criamos pequenas peças que carregam atmosfera, cuidado e
          significado.<br />
          trabalhamos com um formato exclusivo, desenhado para
          valorizar o essencial: proporção, acabamento e harmonia. cada
          vela é produzida manualmente, com ceras vegetais e um olhar
          preciso sobre cada detalhe — do recipiente ao rótulo.<br />
          como assinatura da casa, todas as peças são desenvolvidas a
          partir de uma única fragrância: o capim-cidreira. um aroma
          luminoso e equilibrado, que acolhe sem invadir, trazendo
          frescor e serenidade ao ambiente. sua escolha não é por acaso,
          mas por sua capacidade de atravessar diferentes ocasiões com
          naturalidade e elegância.<br />
          a personalização acontece de forma sutil e refinada,
          respeitando a identidade de cada celebração ou marca através de
          elementos visuais e acabamentos.<br />
          o resultado são lembranças que não se dispersam — permanecem
          no espaço, na memória e na experiência de quem recebe.
        </p>
      </section>

      {/* ─── GALERIA ─── */}
      <section
        style={{
          background: '#fcf5e0',
          padding: 'clamp(56px, 8vw, 96px) clamp(16px, 4vw, 48px)',
        }}
      >
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6"
          style={{ maxWidth: '1400px', margin: '0 auto' }}
        >
          {GALERIA.map((filename) => (
            <div
              key={filename}
              style={{
                aspectRatio: '3 / 4',
                overflow: 'hidden',
              }}
            >
              <img
                src={lembrancasUrl(filename)}
                alt=""
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ─── CONVERSÃO ─── */}
      <section
        style={{
          background: '#29241f',
          padding: 'clamp(64px, 9vw, 104px) 24px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '40px',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          {CONVERSAO.map(({ titulo, desc }) => (
            <div
              key={titulo}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '20px',
              }}
            >
              <FlameIcon />
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: '0.82rem',
                  letterSpacing: '0.2em',
                  color: '#f4edd2',
                  margin: 0,
                }}
              >
                {titulo}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 300,
                  fontSize: '0.76rem',
                  letterSpacing: '0.04em',
                  color: 'rgba(244,237,210,0.65)',
                  margin: 0,
                  lineHeight: 1.7,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FORMULÁRIO ─── */}
      <section
        style={{
          background: '#f4edd2',
          padding: 'clamp(64px, 9vw, 104px) 24px',
        }}
      >
        <div style={{ maxWidth: '620px', margin: '0 auto' }}>
          <h2
            className="heading-display"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: '#29241f',
              marginBottom: '0.5rem',
            }}
          >
            solicitar proposta
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 300,
              fontSize: '0.82rem',
              letterSpacing: '0.06em',
              color: 'rgba(41,36,31,0.65)',
              marginBottom: '2.5rem',
            }}
          >
            conte-nos sobre o seu projeto
          </p>

          {status === 'sent' ? (
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 300,
                fontSize: '0.9rem',
                lineHeight: 1.9,
                color: '#29241f',
                letterSpacing: '0.04em',
              }}
            >
              mensagem enviada. entraremos em contato em breve.
            </p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="loi-label block mb-2">nome</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="loi-label block mb-2">e-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="loi-label block mb-2">whatsapp</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="loi-label block mb-2">ocasião</label>
                <select
                  value={ocasiao}
                  onChange={(e) => setOcasiao(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {OCASIOES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="loi-label block mb-2">quantidade estimada</label>
                <input
                  type="number"
                  min={1}
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="loi-label block mb-2">mensagem</label>
                <textarea
                  rows={4}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>

              {status === 'error' && (
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 300,
                    fontSize: '0.8rem',
                    color: '#7F2700',
                    letterSpacing: '0.04em',
                  }}
                >
                  algo deu errado. tente novamente ou entre em contato pelo whatsapp.
                </p>
              )}

              <button
                type="submit"
                className="loi-btn"
                disabled={status === 'sending'}
                style={{ justifyContent: 'center', opacity: status === 'sending' ? 0.6 : 1 }}
              >
                {status === 'sending' ? 'enviando…' : 'solicitar proposta'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section
        style={{
          background: '#fcf5e0',
          padding: 'clamp(64px, 9vw, 96px) 24px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 300,
            fontSize: '0.92rem',
            letterSpacing: '0.05em',
            color: '#29241f',
            marginBottom: '2rem',
          }}
        >
          para desenvolver seu projeto, entre em contato.
        </p>
        <a
          href="https://wa.me/5511996497672"
          target="_blank"
          rel="noopener noreferrer"
          className="loi-btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.851L.057 23.012a.75.75 0 0 0 .931.931l5.161-1.465A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.728 9.728 0 0 1-4.949-1.347l-.355-.211-3.683 1.045 1.046-3.683-.212-.355A9.728 9.728 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
          </svg>
          falar pelo whatsapp
        </a>
      </section>
    </Layout>
  );
};

export default Lembrancas;
