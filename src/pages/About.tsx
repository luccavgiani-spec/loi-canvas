import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { aboutUrl, lembrancasUrl } from '@/lib/storage';

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`;

const About = () => {
  return (
    <Layout>
      {/* ─── BLOCO 1 — ABERTURA ─── */}
      <section
        className="min-h-[45vh] md:min-h-[50vh] flex items-end relative overflow-hidden"
        style={{ background: '#29241f' }}
      >
        {/* Mobile: andre e brisa.jpg, cropped center-bottom to focus on the dog */}
        <img
          src={aboutUrl('andre e brisa.jpg')}
          alt=""
          className="md:hidden absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center bottom' }}
        />
        {/* Desktop: banner hero.jpg */}
        <img
          src={aboutUrl('banner hero.jpg')}
          alt=""
          className="hidden md:block absolute inset-0 w-full h-full object-cover"
        />
        {/* Grain — igual à hero da home page */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0.04, backgroundImage: GRAIN_SVG, backgroundSize: '200px 200px' }}
        />
        <div className="pb-10 pl-8 md:pl-16 pr-8 md:pr-16 relative z-10">
          <h1
            style={{
              fontFamily: "'Wagon', sans-serif",
              fontWeight: 300,
              fontSize: 'clamp(1.75rem, 4.5vw, 3.5rem)',
              color: '#f4edd2',
              lineHeight: 1.15,
              margin: 0,
              maxWidth: '48rem',
            }}
          >
            a loiê sala aromática é esse gesto poético, mas também é um ateliê real — feito de tempo, matéria, escolhas e presença
          </h1>
        </div>
      </section>

      {/* ─── BLOCO 2 — HISTÓRIA ─── */}
      <section style={{ background: '#fcf5e0' }}>
        <div className="md:grid md:grid-cols-2" style={{ gap: 0 }}>
          {/* Coluna esquerda — história */}
          <div
            className="md:sticky"
            style={{
              top: '6rem',
              alignSelf: 'start',
              padding: 'clamp(2rem, 6vw, 4rem)',
            }}
          >
            <span
              style={{
                fontFamily: "'Sackers Gothic', sans-serif",
                fontWeight: 300,
                fontSize: '0.7rem',
                letterSpacing: '0.2em',
                color: '#989857',
                display: 'block',
                marginBottom: '2rem',
              }}
            >
              história
            </span>

            {[
              'a loiê nasceu em 2015, a partir de pequenos experimentos realizados pelo artista e fundador andré magalhães liza. desde o início, o gesto de acender uma vela esteve ligado ao desejo de qualificar o tempo — dentro de casa, no cotidiano, no silêncio entre as tarefas.',
              'o ateliê tomou forma com a ocupação de uma casa antiga de família, no interior de são paulo. reativar esse espaço foi também um exercício de memória: recuperar valores, ritmos e afetos que atravessam gerações. a casa moldou a loiê tanto quanto a loiê passou a habitar a casa.',
              'ao longo de sua trajetória, a marca foi construída em diferentes etapas e parcerias, sempre guiada pela atenção às matérias-primas, ao fazer manual e à experiência sensível do aroma. trabalhamos com ceras vegetais, óleos essenciais e processos cuidadosos, respeitando o tempo de cada criação.',
              'hoje a loiê sala aromática segue como um ateliê autoral dedicado à criação de atmosferas — objetos que convidam à presença, ao cuidado e a uma relação mais consciente com o espaço e consigo mesmo. acreditamos que habitar o agora, com atenção e delicadeza, também é uma forma de transformar o mundo.',
            ].map((line, i) => (
              <p
                key={i}
                style={{
                  fontFamily: "'Sackers Gothic', sans-serif",
                  fontWeight: 300,
                  fontSize: '0.85rem',
                  color: '#29241f',
                  lineHeight: 1.9,
                  maxWidth: '28rem',
                  marginBottom: '1.75rem',
                }}
              >
                {line}
              </p>
            ))}

            <p
              style={{
                fontFamily: "'Sackers Gothic', sans-serif",
                fontWeight: 300,
                fontStyle: 'italic',
                fontSize: '0.85rem',
                color: '#29241f',
                lineHeight: 1.9,
                maxWidth: '28rem',
                marginTop: '2.5rem',
                marginBottom: '0.5rem',
              }}
            >
              por andré liza
            </p>
            <p
              style={{
                fontFamily: "'Sackers Gothic', sans-serif",
                fontWeight: 300,
                fontStyle: 'italic',
                fontSize: '0.85rem',
                color: '#29241f',
                lineHeight: 1.9,
                maxWidth: '28rem',
              }}
            >
              loiê sala aromática
            </p>
          </div>

          {/* Coluna direita — imagens */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              padding: '1rem 1rem 1rem 0',
            }}
          >
            <div className="hidden md:block aspect-[3/4] w-full overflow-hidden">
              <img src={lembrancasUrl('banner hero lembrancas.jpg')} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="hidden md:block aspect-[3/4] w-full overflow-hidden">
              <img src={aboutUrl('conceitual 4.jpg')} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-[3/4] w-full overflow-hidden">
              <img src={aboutUrl('conceitual 2.jpg')} alt="" className="w-full h-full object-cover" />
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
              color: '#989857',
              display: 'block',
              marginBottom: '3rem',
            }}
          >
            manifesto
          </span>

          <p
            style={{
              fontFamily: "'Wagon', sans-serif",
              fontWeight: 300,
              fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
              color: '#f4edd2',
              lineHeight: 1.7,
              marginBottom: '1.5rem',
            }}
          >
            acendemos uma vela como quem abre uma porta. uma porta pra dentro. pra memória. pra beleza que mora no silêncio.
          </p>
          <p
            style={{
              fontFamily: "'Wagon', sans-serif",
              fontWeight: 300,
              fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
              color: '#f4edd2',
              lineHeight: 1.7,
              marginBottom: '1.5rem',
            }}
          >
            a loiê nasceu de uma casa antiga, de um ritual secreto, de um saber que se aprende com as mãos e os sentidos. cada aroma é uma narrativa, cada frasco é um convite a ficar mais tempo com o que importa.
          </p>
          <p
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
            somos fogo, mas somos calma. somos essência, mas somos presença. somos brasileiros, feitos à mão, com técnica e alma.
          </p>
          <p
            style={{
              fontFamily: "'Wagon', sans-serif",
              fontWeight: 300,
              fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
              color: '#f4edd2',
              lineHeight: 1.7,
            }}
          >
            não vendemos velas. criamos atmosferas.
          </p>
        </div>
      </section>

      {/* ─── BLOCO 4 — IMAGEM ─── */}
      <div className="w-full aspect-[3/4] md:aspect-[21/9] overflow-hidden">
        <img src={aboutUrl('andreloie-15PB.jpg')} alt="" className="w-full h-full object-cover" />
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
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '3rem' }}>
          {[
            {
              label: 'origem',
              titulo: 'Feito à Mão',
              texto:
                'Cada vela começa no gesto. Na escolha da composição da cera, na medida do aroma, na hora certa de derramar. Não há pressa no que queremos que dure.',
            },
            {
              label: 'matéria',
              titulo: 'Só o Essencial',
              texto:
                'Ceras vegetais de coco, arroz e palma. Composições aromáticas puras. Pavios de algodão. Sem compostos que o nariz detecta como superficiais.',
            },
            {
              label: 'propósito',
              titulo: 'Atmosfera como linguagem',
              texto:
                'Não é decoração. É sobre presença. Uma vela não enfeita o espaço — ela o define. O aroma diz o que o ambiente é.',
            },
          ].map(({ label, titulo, texto }) => (
            <div key={label} className="pb-10 md:pb-0">
              <span
                style={{
                  fontFamily: "'Sackers Gothic', sans-serif",
                  fontWeight: 300,
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
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
          CONHEÇA NOSSOS PRODUTOS
        </p>
        <Link
          to="/colecoes"
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
          CONHECER COLEÇÕES
        </Link>
      </section>
    </Layout>
  );
};

export default About;
