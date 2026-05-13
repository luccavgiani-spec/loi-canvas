import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { lembrancasUrl } from '@/lib/storage';
import { sendCampaignEmail } from '@/lib/api';
import LembrancasGalleryBlock, { type GalleryPosition, type GalleryTheme, type GalleryFraseAlign } from '@/components/lembrancas/LembrancasGalleryBlock';
import { useSiteContent, useSiteContentList, readBlockText } from '@/lib/site-content/hooks';
import EditableText from '@/components/site-content/EditableText';

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

type GaleriaBloco = {
  imagem: string;
  frase: string;
  posicao: GalleryPosition;
  tema: GalleryTheme;
  posicaoFrase: GalleryFraseAlign;
};

const GALERIA_BLOCOS: GaleriaBloco[] = [
  {
    imagem: lembrancasUrl('andreloie-81.webp'),
    frase: 'Uma vela que leva o nome deles. Que traduz o dia em que disseram sim',
    posicao: 'esquerda',
    tema: 'cream',
    posicaoFrase: 'direita',
  },
  {
    imagem: lembrancasUrl('andreloie-82.webp'),
    frase: 'Para quem não some depois da festa',
    posicao: 'direita',
    tema: 'charcoal',
    posicaoFrase: 'direita',
  },
  {
    imagem: lembrancasUrl('andreloie-86.webp'),
    frase: 'Discreto no gesto. Marcante na lembrança. Sem excesso. Com intenção',
    posicao: 'esquerda',
    tema: 'cream',
    posicaoFrase: 'direita',
  },
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

  const { data: heroSection } = useSiteContent('lembrancas', 'hero');
  const { data: formSection } = useSiteContent('lembrancas', 'formulario');
  const { data: galeriaItems } = useSiteContentList('lembrancas', 'galeria_intercalada', 'blocos');
  const { data: conversaoItems } = useSiteContentList('lembrancas', 'conversao', 'cards');

  const heroBg = heroSection?.['imagem_fundo']?.value_image_url ?? lembrancasUrl('andreloie-96.jpg');

  const galeriaBlocos: GaleriaBloco[] = (galeriaItems && galeriaItems.length > 0)
    ? galeriaItems.filter((it) => it.is_visible).map((it) => ({
        imagem: (it.fields?.imagem_url as string | undefined) ?? '',
        frase: (it.fields?.frase as string | undefined) ?? '',
        posicao: ((it.fields?.posicao as GalleryPosition | undefined) ?? 'esquerda'),
        tema: ((it.fields?.tema as GalleryTheme | undefined) ?? 'cream'),
        posicaoFrase: ((it.fields?.posicao_frase as GalleryFraseAlign | undefined) ?? 'direita'),
      }))
    : GALERIA_BLOCOS;

  const cards = (conversaoItems && conversaoItems.length > 0)
    ? conversaoItems.filter((it) => it.is_visible).map((it) => ({
        num: (it.fields?.numeral as string | undefined) ?? '',
        titulo: (it.fields?.titulo as string | undefined) ?? '',
        desc: (it.fields?.descricao as string | undefined) ?? '',
      }))
    : CONVERSAO;

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
          backgroundImage: `url(${heroBg})`,
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
          <EditableText
            pageKey="lembrancas"
            sectionKey="hero"
            blockKey="titulo"
            defaultText="Lembranças sob Curadoria"
            as="h1"
            defaultClass="heading-display"
            style={{
              fontSize: 'clamp(2.8rem, 6vw, 5rem)',
              color: '#f4edd2',
              lineHeight: 1.1,
              marginBottom: '1.2rem',
            }}
          />
          <EditableText
            pageKey="lembrancas"
            sectionKey="hero"
            blockKey="subtitulo"
            defaultText="memória e sofisticação: há gestos que permanecem"
            as="p"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 300,
              fontSize: 'clamp(0.75rem, 1.4vw, 0.9rem)',
              letterSpacing: '0.15em',
              color: 'rgba(244,237,210,0.75)',
              margin: 0,
            }}
          />
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
          <EditableText
            pageKey="lembrancas"
            sectionKey="storytelling"
            blockKey="corpo"
            defaultText="as lembranças da loiê nascem com..."
            as="p"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 300,
              fontSize: 'clamp(0.88rem, 1.5vw, 1.02rem)',
              lineHeight: 2.1,
              color: '#29241f',
            }}
          />
        </div>
      </section>

      {/* ─── GALERIA INTERCALADA ─── */}
      {galeriaBlocos.map((bloco, i) => (
        <LembrancasGalleryBlock
          key={i}
          imagem={bloco.imagem}
          frase={bloco.frase}
          posicao={bloco.posicao}
          tema={bloco.tema}
          posicaoFrase={bloco.posicaoFrase}
        />
      ))}

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
          {cards.map(({ num, titulo, desc }) => (
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
          <EditableText
            pageKey="lembrancas"
            sectionKey="formulario"
            blockKey="titulo"
            defaultText="solicitar proposta"
            as="h2"
            defaultClass="heading-display"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: '#29241f',
              marginBottom: '0.5rem',
            }}
          />
          <EditableText
            pageKey="lembrancas"
            sectionKey="formulario"
            blockKey="subtitulo"
            defaultText="conte-nos sobre o seu projeto"
            as="p"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 300,
              fontSize: '0.82rem',
              letterSpacing: '0.06em',
              color: 'rgba(41,36,31,0.65)',
              marginBottom: '2.5rem',
            }}
          />

          {status === 'sent' ? (
            <EditableText
              pageKey="lembrancas"
              sectionKey="formulario"
              blockKey="texto_sucesso"
              defaultText="mensagem enviada. entraremos em contato em breve."
              as="p"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 300,
                fontSize: '0.9rem',
                lineHeight: 1.9,
                color: '#29241f',
                letterSpacing: '0.04em',
              }}
            />
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
                <EditableText
                  pageKey="lembrancas"
                  sectionKey="formulario"
                  blockKey="texto_erro"
                  defaultText="algo deu errado. tente novamente ou entre em contato pelo whatsapp."
                  as="p"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 300,
                    fontSize: '0.8rem',
                    color: '#7F2700',
                    letterSpacing: '0.04em',
                  }}
                />
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
                {status === 'sending' ? 'ENVIANDO…' : readBlockText(formSection, 'botao', 'SOLICITAR PROPOSTA')}
              </button>
            </form>
          )}
        </div>
      </section>

    </Layout>
  );
};

export default Lembrancas;
