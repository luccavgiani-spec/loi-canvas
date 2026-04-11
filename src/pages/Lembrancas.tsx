import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { lembrancasUrl } from '@/lib/storage';
import { sendCampaignEmail } from '@/lib/api';

const inputStyle: React.CSSProperties = {
  borderBottom: '1px solid rgba(41,36,31,0.30)',
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  background: 'transparent',
  fontFamily: "'Sackers Gothic', sans-serif",
  fontWeight: 300,
  fontSize: '0.82rem',
  letterSpacing: '0.04em',
  outline: 'none',
  padding: '10px 0',
  width: '100%',
  color: '#29241f',
};

const OCASIOES = [
  { value: '', label: 'SELECIONE A OCASIÃO' },
  { value: 'casamento', label: 'CASAMENTO' },
  { value: 'madrinha', label: 'MADRINHA / PADRINHO' },
  { value: 'presente', label: 'PRESENTE CORPORATIVO' },
  { value: 'outro', label: 'OUTRO' },
];

const CONVERSAO = [
  {
    num: '01',
    titulo: 'CASAMENTOS & CERIMÔNIAS',
    desc: 'velas personalizadas com nomes, data e aroma escolhido. embalagens exclusivas. mínimo de 30 unidades.',
  },
  {
    num: '02',
    titulo: 'MADRINHAS & PADRINHOS',
    desc: 'presentes que criam memória afetiva. kits com 1 ou 2 velas, mensagem manuscrita opcional e caixa loiê exclusiva.',
  },
  {
    num: '03',
    titulo: 'PRESENTES CORPORATIVOS',
    desc: 'para clientes, parceiros e equipes. identidade visual da sua marca integrada à nossa estética. projetos a partir de 50 unidades.',
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
            backgroundColor: 'rgba(41,36,31,0.60)',
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
          padding: 'clamp(64px, 10vw, 128px) 24px',
        }}
      >
        <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 300,
              fontSize: 'clamp(0.88rem, 1.5vw, 1.02rem)',
              lineHeight: 2.1,
              color: '#29241f',
              marginBottom: '2rem',
            }}
          >
            há gestos que permanecem.<br />
            as lembranças da loiê nascem com esse propósito: transformar
            ocasiões em presenças sensoriais que atravessam o tempo.
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 300,
              fontSize: 'clamp(0.88rem, 1.5vw, 1.02rem)',
              lineHeight: 2.1,
              color: '#29241f',
              marginBottom: '2rem',
            }}
          >
            criamos pequenas peças que carregam atmosfera, cuidado e
            significado. trabalhamos com um formato exclusivo, desenhado para
            valorizar o essencial: proporção, acabamento e harmonia. cada
            vela é produzida manualmente, com ceras vegetais e um olhar
            preciso sobre cada detalhe — do recipiente ao rótulo.
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 300,
              fontSize: 'clamp(0.88rem, 1.5vw, 1.02rem)',
              lineHeight: 2.1,
              color: '#29241f',
              marginBottom: '2rem',
            }}
          >
            como assinatura da casa, todas as peças são desenvolvidas a
            partir de uma única fragrância: o capim-cidreira. um aroma
            luminoso e equilibrado, que acolhe sem invadir, trazendo
            frescor e serenidade ao ambiente.
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 300,
              fontSize: 'clamp(0.88rem, 1.5vw, 1.02rem)',
              lineHeight: 2.1,
              color: '#29241f',
            }}
          >
            o resultado são lembranças que não se dispersam — permanecem
            no espaço, na memória e na experiência de quem recebe.
          </p>
        </div>
      </section>

      {/* ─── GALERIA INTERCALADA ─── */}

      {/* Bloco 1 — imagem à esquerda */}
      <section className="md:grid md:grid-cols-2" style={{ gap: 0 }}>
        <div style={{ overflow: 'hidden' }}>
          <img
            src={lembrancasUrl('andreloie-82.webp')}
            alt=""
            loading="lazy"
            style={{
              width: '100%',
              aspectRatio: '4 / 5',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
        <div
          style={{
            background: '#fcf5e0',
            display: 'flex',
            alignItems: 'center',
            padding: 'clamp(3rem, 6vw, 4rem)',
          }}
        >
          <p
            style={{
              fontFamily: "'Wagon', sans-serif",
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
              color: '#29241f',
              lineHeight: 1.6,
            }}
          >
            uma vela que leva o nome deles. que cheira ao dia em que disseram sim.
          </p>
        </div>
      </section>

      {/* Bloco 2 — imagem à direita */}
      <section className="md:grid md:grid-cols-2" style={{ gap: 0 }}>
        <div
          style={{
            background: '#29241f',
            display: 'flex',
            alignItems: 'center',
            padding: 'clamp(3rem, 6vw, 4rem)',
            order: 1,
          }}
          className="md:order-none"
        >
          <p
            style={{
              fontFamily: "'Wagon', sans-serif",
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
              color: '#f4edd2',
              lineHeight: 1.6,
            }}
          >
            para quem merece algo que não some depois da festa.
          </p>
        </div>
        <div style={{ overflow: 'hidden', order: 0 }} className="md:order-none">
          <img
            src={lembrancasUrl('andreloie-86.webp')}
            alt=""
            loading="lazy"
            style={{
              width: '100%',
              aspectRatio: '4 / 5',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
      </section>

      {/* Bloco 3 — imagem à esquerda */}
      <section className="md:grid md:grid-cols-2" style={{ gap: 0 }}>
        <div style={{ overflow: 'hidden' }}>
          <img
            src={lembrancasUrl('Loie II-8.webp')}
            alt=""
            loading="lazy"
            style={{
              width: '100%',
              aspectRatio: '4 / 5',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
        <div
          style={{
            background: '#fcf5e0',
            display: 'flex',
            alignItems: 'center',
            padding: 'clamp(3rem, 6vw, 4rem)',
          }}
        >
          <p
            style={{
              fontFamily: "'Wagon', sans-serif",
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
              color: '#29241f',
              lineHeight: 1.6,
            }}
          >
            cada cliente lembra. cada parceiro percebe a diferença.
          </p>
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
            gap: '2rem',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          {CONVERSAO.map(({ num, titulo, desc }) => (
            <div
              key={titulo}
              style={{
                background: '#29241f',
                border: '1px solid rgba(152,152,87,0.3)',
                padding: '2rem',
              }}
            >
              <p
                style={{
                  fontFamily: "'Wagon', sans-serif",
                  fontWeight: 300,
                  fontSize: '3.5rem',
                  color: 'rgba(152,152,87,0.4)',
                  lineHeight: 1,
                  marginBottom: '1rem',
                }}
              >
                {num}
              </p>
              <p
                style={{
                  fontFamily: "'Sackers Gothic', sans-serif",
                  fontWeight: 400,
                  fontSize: '0.7rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#f4edd2',
                  marginBottom: '1rem',
                }}
              >
                {titulo}
              </p>
              <p
                style={{
                  fontFamily: "'Sackers Gothic', sans-serif",
                  fontWeight: 300,
                  fontSize: '0.72rem',
                  letterSpacing: '0.04em',
                  color: 'rgba(244,237,210,0.70)',
                  lineHeight: 1.8,
                  margin: 0,
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
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label className="loi-label block mb-2">nome</label>
                <input
                  type="text"
                  required
                  placeholder="SEU NOME"
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
                  placeholder="SEU E-MAIL"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="loi-label block mb-2">whatsapp</label>
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
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
                  placeholder="EX: 50"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="loi-label block mb-2">mensagem</label>
                <textarea
                  rows={4}
                  placeholder="CONTE-NOS SOBRE O SEU PROJETO"
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
                disabled={status === 'sending'}
                style={{
                  background: '#29241f',
                  color: '#fcf5e0',
                  fontFamily: "'Sackers Gothic', sans-serif",
                  fontWeight: 300,
                  fontSize: '0.7rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  border: 'none',
                  width: '100%',
                  padding: '1rem',
                  cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                  opacity: status === 'sending' ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {status === 'sending' ? 'ENVIANDO…' : 'SOLICITAR PROPOSTA'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section
        style={{
          background: '#29241f',
          padding: 'clamp(64px, 9vw, 96px) 24px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 300,
            fontSize: '0.82rem',
            letterSpacing: '0.1em',
            color: 'rgba(244,237,210,0.75)',
            marginBottom: '2rem',
          }}
        >
          para desenvolver seu projeto, entre em contato.
        </p>
        <a
          href="https://wa.me/5511996497672"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(244,237,210,0.50)',
            color: '#f4edd2',
            fontFamily: "'Sackers Gothic', sans-serif",
            fontWeight: 300,
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            padding: '1rem 3rem',
            textDecoration: 'none',
            transition: 'background-color 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#f4edd2';
            (e.currentTarget as HTMLAnchorElement).style.color = '#29241f';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLAnchorElement).style.color = '#f4edd2';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.851L.057 23.012a.75.75 0 0 0 .931.931l5.161-1.465A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.728 9.728 0 0 1-4.949-1.347l-.355-.211-3.683 1.045 1.046-3.683-.212-.355A9.728 9.728 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
          </svg>
          FALAR PELO WHATSAPP
        </a>
      </section>
    </Layout>
  );
};

export default Lembrancas;
