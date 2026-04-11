import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <Layout>
      {/* ─── BLOCO 1 — ABERTURA ─── */}
      <section
        className="min-h-screen flex items-end"
        style={{ background: '#29241f' }}
      >
        <div className="pb-16 pl-8 md:pl-16">
          <span
            style={{
              fontFamily: "'Sackers Gothic', sans-serif",
              fontWeight: 300,
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#989857',
              display: 'block',
              marginBottom: '1rem',
            }}
          >
            SOBRE
          </span>
          <h1
            style={{
              fontFamily: "'Wagon', sans-serif",
              fontWeight: 300,
              fontSize: 'clamp(3.5rem, 9vw, 7rem)',
              color: '#f4edd2',
              lineHeight: 1,
              margin: 0,
            }}
          >
            SALA AROMÁTICA
          </h1>
        </div>
      </section>

      {/* ─── BLOCO 2 — INTRODUÇÃO EDITORIAL ─── */}
      <section style={{ background: '#fcf5e0' }}>
        <div className="md:grid md:grid-cols-2" style={{ gap: 0 }}>
          {/* Coluna esquerda — texto */}
          <div
            className="md:sticky"
            style={{
              top: '6rem',
              alignSelf: 'start',
              padding: 'clamp(2rem, 6vw, 4rem)',
            }}
          >
            <p
              style={{
                fontFamily: "'Sackers Gothic', sans-serif",
                fontWeight: 300,
                fontSize: '0.85rem',
                color: '#29241f',
                lineHeight: 1.9,
                maxWidth: '24rem',
                marginBottom: '2rem',
              }}
            >
              a loiê nasceu de uma casa antiga. de um saber que se aprende com
              as mãos. de um tempo em que o perfume ainda tinha nome próprio e
              endereço.
            </p>
            <p
              style={{
                fontFamily: "'Sackers Gothic', sans-serif",
                fontWeight: 300,
                fontSize: '0.85rem',
                color: '#29241f',
                lineHeight: 1.9,
                maxWidth: '24rem',
              }}
            >
              cada vela é uma afirmação silenciosa: de que beleza não precisa
              explicar. de que o aroma faz o que a palavra não consegue. de que
              existe arte no que queima.
            </p>
          </div>

          {/* Coluna direita — slots de imagem */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              padding: '1rem 1rem 1rem 0',
            }}
          >
            {/* TODO: substituir pelos paths reais do bucket Supabase */}
            <div
              className="aspect-[3/4] bg-stone-200 flex items-center justify-center w-full"
              style={{
                fontFamily: "'Sackers Gothic', sans-serif",
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                color: '#a8a29e',
                textTransform: 'uppercase',
              }}
            >
              [FOTO 1 — aguardando entrega]
            </div>
            <div
              className="aspect-[3/4] bg-stone-200 flex items-center justify-center w-full"
              style={{
                fontFamily: "'Sackers Gothic', sans-serif",
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                color: '#a8a29e',
                textTransform: 'uppercase',
              }}
            >
              [FOTO 2 — aguardando entrega]
            </div>
            <div
              className="aspect-[3/4] bg-stone-200 flex items-center justify-center w-full"
              style={{
                fontFamily: "'Sackers Gothic', sans-serif",
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                color: '#a8a29e',
                textTransform: 'uppercase',
              }}
            >
              [FOTO 3 — aguardando entrega]
            </div>
          </div>
        </div>
      </section>

      {/* ─── BLOCO 3 — MANIFESTO ─── */}
      <section
        style={{
          background: '#29241f',
          padding: 'clamp(5rem, 10vw, 8rem) clamp(1.5rem, 6vw, 4rem)',
        }}
      >
        <div style={{ maxWidth: '42rem', margin: '0 auto', textAlign: 'center' }}>
          <span
            style={{
              fontFamily: "'Sackers Gothic', sans-serif",
              fontWeight: 300,
              fontSize: '0.7rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#989857',
              display: 'block',
              marginBottom: '3rem',
            }}
          >
            MANIFESTO
          </span>

          {[
            'acendemos uma vela como quem abre uma porta.',
            'uma porta pra dentro. pra memória. pra beleza que mora no silêncio.',
            'a loiê nasceu de uma casa antiga, de um ritual secreto, de um saber que se aprende com as mãos e os sentidos.',
            'cada aroma é uma narrativa, cada frasco é um convite a ficar mais tempo com o que importa.',
          ].map((line, i) => (
            <p
              key={i}
              style={{
                fontFamily: "'Wagon', sans-serif",
                fontWeight: 300,
                fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                color: '#f4edd2',
                lineHeight: 1.7,
                marginBottom: '1.5rem',
              }}
            >
              {line}
            </p>
          ))}

          {[
            'somos fogo, mas somos calma.',
            'somos essência, mas somos presença.',
            'somos brasileiros, feitos à mão, com técnica e alma.',
          ].map((line, i) => (
            <p
              key={`italic-${i}`}
              style={{
                fontFamily: "'Wagon', sans-serif",
                fontWeight: 300,
                fontStyle: 'italic',
                fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                color: '#f4edd2',
                lineHeight: 1.7,
                marginBottom: '1.5rem',
              }}
            >
              {line}
            </p>
          ))}

          <div style={{ marginTop: '2.5rem' }}>
            <p
              style={{
                fontFamily: "'Wagon', sans-serif",
                fontWeight: 300,
                fontSize: 'clamp(1.6rem, 4vw, 2.25rem)',
                color: '#f4edd2',
                lineHeight: 1.3,
                marginBottom: '0.75rem',
              }}
            >
              não vendemos velas.
            </p>
            <p
              style={{
                fontFamily: "'Wagon', sans-serif",
                fontWeight: 300,
                fontSize: 'clamp(1.6rem, 4vw, 2.25rem)',
                color: '#f4edd2',
                lineHeight: 1.3,
              }}
            >
              criamos atmosferas.
            </p>
          </div>
        </div>
      </section>

      {/* ─── BLOCO 4 — IMAGEM CONCEITUAL ─── */}
      <div
        className="w-full aspect-[21/9] bg-stone-300 flex items-center justify-center"
        style={{
          fontFamily: "'Sackers Gothic', sans-serif",
          fontSize: '0.6rem',
          letterSpacing: '0.15em',
          color: '#a8a29e',
          textTransform: 'uppercase',
        }}
      >
        {/* TODO: substituir pelo path da imagem conceitual no bucket Supabase */}
        [FOTO CONCEITUAL — aguardando entrega]
      </div>

      {/* ─── BLOCO 5 — FILOSOFIA (3 pilares) ─── */}
      <section
        style={{
          background: '#fcf5e0',
          padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 6vw, 4rem)',
        }}
      >
        <hr
          style={{
            border: 'none',
            borderTop: '1px solid rgba(41,36,31,0.2)',
            marginBottom: '4rem',
          }}
        />
        <div className="md:grid md:grid-cols-3" style={{ gap: '3rem' }}>
          {[
            {
              label: 'ORIGEM',
              titulo: 'feita à mão',
              texto:
                'cada vela começa no gesto. na escolha da cera, no cálculo do aroma, na hora certa de despejar. não há pressa no que queremos que dure.',
            },
            {
              label: 'MATÉRIA',
              titulo: 'só o essencial',
              texto:
                'ceras vegetais de coco, arroz e palma. óleos essenciais puros. pavios de algodão. sem sintéticos, sem atalhos, sem compostos que o nariz detecta como artificiais.',
            },
            {
              label: 'PROPÓSITO',
              titulo: 'atmosfera como linguagem',
              texto:
                'não acreditamos em decoração. acreditamos em presença. uma vela não enfeita o espaço — ela o define. o aroma diz o que o ambiente quer ser.',
            },
          ].map(({ label, titulo, texto }) => (
            <div key={label}>
              <span
                style={{
                  fontFamily: "'Sackers Gothic', sans-serif",
                  fontWeight: 300,
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#989857',
                  display: 'block',
                  marginBottom: '1rem',
                }}
              >
                {label}
              </span>
              <h3
                style={{
                  fontFamily: "'Wagon', sans-serif",
                  fontWeight: 300,
                  fontSize: '1.5rem',
                  color: '#29241f',
                  marginBottom: '1rem',
                  lineHeight: 1.2,
                }}
              >
                {titulo}
              </h3>
              <p
                style={{
                  fontFamily: "'Sackers Gothic', sans-serif",
                  fontWeight: 300,
                  fontSize: '0.82rem',
                  color: '#29241f',
                  lineHeight: 1.9,
                }}
              >
                {texto}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── BLOCO 6 — IMAGEM + CITAÇÃO ─── */}
      <section className="md:grid md:grid-cols-2" style={{ gap: 0 }}>
        {/* Coluna esquerda — imagem */}
        <div
          className="aspect-square bg-stone-200 flex items-center justify-center"
          style={{
            fontFamily: "'Sackers Gothic', sans-serif",
            fontSize: '0.6rem',
            letterSpacing: '0.15em',
            color: '#a8a29e',
            textTransform: 'uppercase',
          }}
        >
          {/* TODO: substituir pelo path da imagem no bucket Supabase */}
          [FOTO — aguardando entrega]
        </div>

        {/* Coluna direita — citação */}
        <div
          style={{
            background: '#29241f',
            padding: 'clamp(3rem, 6vw, 4rem)',
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <p
            style={{
              fontFamily: "'Wagon', sans-serif",
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
              color: '#f4edd2',
              lineHeight: 1.5,
            }}
          >
            o ritual não está na vela. está em quem a acende.
          </p>
        </div>
      </section>

      {/* ─── BLOCO 7 — CTA FINAL ─── */}
      <section
        style={{
          background: '#fcf5e0',
          padding: 'clamp(4rem, 8vw, 6rem) 1.5rem',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: "'Sackers Gothic', sans-serif",
            fontWeight: 300,
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#29241f',
            marginBottom: '2rem',
          }}
        >
          PARA CONHECER NOSSAS CRIAÇÕES
        </p>
        <Link
          to="/shop"
          style={{
            display: 'inline-block',
            border: '1px solid #29241f',
            fontFamily: "'Sackers Gothic', sans-serif",
            fontWeight: 300,
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#29241f',
            padding: '1rem 2.5rem',
            textDecoration: 'none',
            transition: 'background-color 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#29241f';
            (e.currentTarget as HTMLAnchorElement).style.color = '#fcf5e0';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLAnchorElement).style.color = '#29241f';
          }}
        >
          NAVEGAR A COLEÇÃO
        </Link>
      </section>
    </Layout>
  );
};

export default About;
