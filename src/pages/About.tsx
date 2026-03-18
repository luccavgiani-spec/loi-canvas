import { useRef, useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { storageUrl } from '@/lib/storage';

const banner01 = storageUrl('loie_vela_campos_imagem.JPG');
const heroVideo = storageUrl('Cartao_Postal_Loie.mp4');
const manifestoVideo = storageUrl('video_sobre (1).mp4');

/* grain SVG (same as home hero) */
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`;
import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';

/** Hook: play video when it scrolls into view */
function useScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { videoRef, isVisible };
}

const About = () => {
  const ref = useReveal();
  const { videoRef, isVisible } = useScrollVideo();

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
                    fontFamily: "'Cormorant Garamond', serif",
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
                      fontFamily: "'Montserrat', sans-serif",
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

            {/* Manifesto — left text + right video */}
            <div className="reveal grid md:grid-cols-2 gap-12 items-start">
              {/* Left: text */}
              <div className="text-left">
                <span className="loi-label block mb-6">manifesto</span>
                <h2
                  className="heading-display mb-8"
                  style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#000', lineHeight: 1.2, textAlign: 'left' }}
                >
                  A Loiê Sala Aromática é esse gesto poético, mas também é um ateliê real
                  <em style={{ color: '#000' }}>— feito de tempo, matéria, escolhas e presença</em>
                </h2>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 300,
                    fontStyle: 'italic',
                    fontSize: '1.05rem',
                    color: '#000',
                    lineHeight: 1.8,
                    textAlign: 'left',
                  }}
                >
                  A Loiê nasceu em 2015, a partir de pequenos experimentos realizados pelo artista e fundador André Magalhães Liza. Desde o início, o gesto de acender uma vela esteve ligado ao desejo de qualificar o tempo — dentro de casa, no cotidiano, no silêncio entre as tarefas.
                  {'\n\n'}O ateliê tomou forma com a ocupação de uma casa antiga de família, no interior de São Paulo. Reativar esse espaço foi também um exercício de memória: recuperar valores, ritmos e afetos que atravessam gerações. A casa moldou a Loiê tanto quanto a Loiê passou a habitar a casa.
                  {'\n\n'}Ao longo de sua trajetória, a marca foi construída em diferentes etapas e parcerias, sempre guiada pela atenção às matérias-primas, ao fazer manual e à experiência sensível do aroma. Trabalhamos com ceras vegetais, óleos essenciais e processos cuidadosos, respeitando o tempo de cada criação.
                  {'\n\n'}Hoje a Loiê Sala Aromática segue como um ateliê autoral dedicado à criação de atmosferas — objetos que convidam à presença, ao cuidado e a uma relação mais consciente com o espaço e consigo mesmo. Acreditamos que habitar o agora, com atenção e delicadeza, também é uma forma de transformar o mundo.
                </p>
                <div className="mt-10">
                  <Link to="/shop" className="loi-btn">explorar coleção</Link>
                </div>
              </div>

              {/* Right: scroll-triggered video with depth frame */}
              <div
                className="relative"
                style={{
                  /* soft ambient shadow for depth */
                  boxShadow: '0 8px 40px rgba(41,36,31,0.25), 0 2px 12px rgba(41,36,31,0.15)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  transform: 'perspective(800px) rotateY(-2deg)',
                }}
              >
                {/* subtle inner border glow */}
                <div
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{
                    borderRadius: '4px',
                    boxShadow: 'inset 0 0 30px rgba(41,36,31,0.3), inset 0 0 4px rgba(41,36,31,0.15)',
                  }}
                />
                {/* fade edges so video blends into the page */}
                <div
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{
                    background: `
                      linear-gradient(to right, rgba(244,237,210,0.35) 0%, transparent 8%, transparent 92%, rgba(244,237,210,0.35) 100%),
                      linear-gradient(to bottom, rgba(244,237,210,0.25) 0%, transparent 6%, transparent 94%, rgba(244,237,210,0.25) 100%)
                    `,
                  }}
                />
                <div
                  className="transition-all duration-700"
                  style={{
                    opacity: isVisible ? 1 : 0.3,
                    transform: isVisible ? 'scale(1)' : 'scale(0.97)',
                    willChange: 'opacity, transform',
                  }}
                >
                  <VideoPlayer
                    ref={videoRef}
                    src={manifestoVideo}
                    poster={banner01}
                    className="w-full aspect-[9/16] object-cover"
                    style={{ filter: 'saturate(0.7) brightness(0.85)' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
