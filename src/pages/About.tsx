import Layout from '@/components/layout/Layout';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { storageUrl } from '@/lib/storage';

const banner01 = storageUrl('loie_vela_campos_imagem.JPG');
const heroVideo = storageUrl('Cartao_Postal_Loie.mp4');
/* grain SVG (same as home hero) */
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`;
import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';

const About = () => {
  const ref = useReveal();

  return (
    <Layout>
      <div ref={ref}>
        {/* Hero banner */}
        <section className="relative w-full overflow-hidden" style={{ height: 'clamp(350px, 60vh, 720px)', background: '#29241f' }}>
          {/* video */}
          <VideoPlayer
            src={heroVideo}
            poster={banner01}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'saturate(0.70) brightness(0.72) contrast(1.05)' }}
          />

          {/* overlay (radial vignette + top/bottom gradient) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 65% 70% at 50% 50%, rgba(41,36,31,0.02) 0%, rgba(41,36,31,0.35) 100%),
                linear-gradient(to bottom, rgba(41,36,31,0.40) 0%, rgba(41,36,31,0.00) 28%, rgba(41,36,31,0.00) 55%, rgba(41,36,31,0.70) 100%)
              `,
            }}
          />

          {/* bottom fade into brown — seamless transition */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              height: '40%',
              background: 'linear-gradient(to bottom, transparent 0%, rgba(41,36,31,0.20) 40%, rgba(41,36,31,0.55) 70%, #29241f 100%)',
            }}
          />

          {/* grain */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: 0.04, backgroundImage: GRAIN_SVG, backgroundSize: '200px 200px' }}
          />

          {/* content */}
          <div className="relative z-[1] flex items-center justify-center h-full px-6">
            <div className="text-center">
              <span className="loi-label block mb-4">sobre a loiê</span>
              <h1
                className="heading-display"
                style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: '#f4edd2', lineHeight: 0.95 }}
              >
                Nossa História
              </h1>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-12 md:py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div className="reveal-left">
                <img
                  src={banner01}
                  alt="Produção artesanal"
                  className="w-full aspect-[4/3] object-cover"
                  style={{ filter: 'saturate(0.6) brightness(0.7)' }}
                />
              </div>
              <div className="reveal-right">
                <span className="loi-label block mb-4">origem</span>
                <h2
                  className="heading-display mb-6"
                  style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#000', lineHeight: 1.15 }}
                >
                  Manifesto
                </h2>
                <div className="loi-divider mb-6" />
                <p
                  style={{
                    fontFamily: "'Wagon', sans-serif",
                    fontWeight: 300,
                    fontStyle: 'italic',
                    fontSize: '1.05rem',
                    color: '#000',
                    lineHeight: 1.8,
                    marginBottom: '1rem',
                  }}
                >
                  Acendemos uma vela como quem abre uma porta. Uma porta para dentro. Pra memória. Pra beleza que mora no silêncio.
                  {'\n\n'}
                  A Loiê nasceu de uma casa antiga, de um ritual secreto, de um saber que se aprende com as mãos e os sentidos.
                  {'\n\n'}
                  Cada aroma é uma narrativa, cada frasco é um convite a ficar mais tempo com o que importa.
                  {'\n\n'}
                  Somos fogo, mas somos calma. Somos essência, mas somos presença. Somos brasileiros, feitos à mão, com técnica e com alma.
                  {'\n\n'}
                  Não vendemos velas. Criamos atmosferas.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="reveal-stagger grid md:grid-cols-3 gap-8 text-center mb-20">
              {[
                { num: '100%', label: 'Cera de soja vegetal' },
                { num: '50h+', label: 'Duração por vela' },
                { num: '12', label: 'Etapas artesanais' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="reveal py-10 px-6"
                  style={{ border: '1px solid rgba(86,86,0,0.15)' }}
                >
                  <p
                    className="heading-display mb-2"
                    style={{ fontSize: '2.5rem', color: '#000' }}
                  >
                    {stat.num}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Sackers Gothic', sans-serif",
                      fontWeight: 300,
                      fontSize: '0.75rem',
                      color: '#000',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Manifesto — editorial typographic layout */}
            <div className="reveal">
              <span className="loi-label block mb-12 text-center">manifesto</span>

              {/* Stanzas */}
              <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
                {[
                  'acendemos uma vela como quem abre uma porta.\numa porta pra dentro. pra memória. pra beleza que mora no silêncio.',
                  'a loiê nasceu de uma casa antiga, de um ritual secreto, de um saber\nque se aprende com as mãos e os sentidos.',
                  'cada aroma é uma narrativa, cada frasco é um convite\na ficar mais tempo com o que importa.',
                  'somos fogo, mas somos calma.\nsomos essência, mas somos presença.\nsomos brasileiros, feitos à mão, com técnica e alma.',
                ].map((stanza, i) => (
                  <p
                    key={i}
                    style={{
                      fontFamily: "'Wagon', sans-serif",
                      fontWeight: 200,
                      fontStyle: 'italic',
                      fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                      color: '#29241f',
                      lineHeight: 1.35,
                      letterSpacing: '0.01em',
                      whiteSpace: 'pre-line',
                      marginBottom: 'clamp(2rem, 4vh, 3rem)',
                    }}
                  >
                    {stanza}
                  </p>
                ))}

                {/* Final stanza — larger for emphasis */}
                <p
                  style={{
                    fontFamily: "'Wagon', sans-serif",
                    fontWeight: 700,
                    fontSize: 'clamp(1.8rem, 5vw, 3.6rem)',
                    color: '#29241f',
                    lineHeight: 1.2,
                    letterSpacing: '0.02em',
                    marginBottom: 'clamp(2rem, 4vh, 3rem)',
                  }}
                >
                  não vendemos velas.<br />criamos atmosferas.
                </p>

                {/* Photo placeholder */}
                <div
                  style={{
                    border: '1px dashed rgba(41,36,31,0.2)',
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    color: 'rgba(41,36,31,0.3)',
                    fontFamily: "'Sackers Gothic', sans-serif",
                    fontSize: '0.65rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    marginTop: '4rem',
                  }}
                >
                  espaço reservado — foto do ateliê a ser fornecida
                </div>
              </div>

            </div>
          </div>

          {/* Brand philosophy — subtle, for SEO and the curious reader */}
          <div className="reveal mt-16 pt-12" style={{ borderTop: '1px solid rgba(41,36,31,0.06)', maxWidth: '520px', margin: '4rem auto 0' }}>
            <p
              style={{
                fontFamily: "'Sackers Gothic', sans-serif",
                fontWeight: 300,
                fontSize: '0.7rem',
                letterSpacing: '0.08em',
                color: 'rgba(41,36,31,0.28)',
                lineHeight: 2,
                textAlign: 'center',
              }}
            >
              Profundo conhecimento em construção olfativa, com foco em óleos essenciais,
              mas abertura para fragrâncias que elevem a experiência sem comprometer a
              identidade e segurança da marca.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
