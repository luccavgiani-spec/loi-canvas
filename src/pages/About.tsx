import Layout from '@/components/layout/Layout';
import { bannerAtelier as banner02, bannerCollection as banner01 } from '@/assets';
import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';

const About = () => {
  const ref = useReveal();

  return (
    <Layout>
      <div ref={ref}>
        {/* Hero banner */}
        <section className="relative" style={{ height: '60vh', minHeight: 350 }}>
          <img
            src={banner02}
            alt="Ateliê Loiê"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'saturate(0.5) brightness(0.4)' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #fcf5e0 0%, transparent 30%, transparent 70%, #fcf5e0 100%)' }} />
          <div className="loi-grain" />
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
        <section className="py-28 md:py-36 px-6">
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
                  style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#29241f', lineHeight: 1.15 }}
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
                    color: 'rgba(41,36,31,0.55)',
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
                    style={{ fontSize: '2.5rem', color: '#565600' }}
                  >
                    {stat.num}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 300,
                      fontSize: '0.75rem',
                      color: 'rgba(41,36,31,0.45)',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Manifesto */}
            <div className="reveal text-center max-w-2xl mx-auto">
              <span className="loi-label block mb-6">manifesto</span>
              <h2
                className="heading-display mb-8"
                style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', color: '#29241f', lineHeight: 1.2 }}
              >
                A Loiê Sala Aromática é esse gesto poético, mas também é um ateliê real
                <em style={{ color: '#565600' }}>— feito de tempo, matéria, escolhas e presença</em>
              </h2>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 300,
                  fontStyle: 'italic',
                  fontSize: '1.05rem',
                  color: 'rgba(41,36,31,0.5)',
                  lineHeight: 1.8,
                }}
              >
                {'\n'}A Loiê Sala Aromática é esse gesto poético, mas também é um ateliê real — feito de tempo, matéria, escolhas e presença
                {'\n'}A Loiê nasceu em 2015, a partir de pequenos experimentos realizados pelo artista e fundador André Magalhães Liza. Desde o início, o gesto de acender uma vela esteve ligado ao desejo de qualificar o tempo — dentro de casa, no cotidiano, no silêncio entre as tarefas.
                {'\n\n'}O ateliê tomou forma com a ocupação de uma casa antiga de família, no interior de São Paulo. Reativar esse espaço foi também um exercício de memória: recuperar valores, ritmos e afetos que atravessam gerações. A casa moldou a Loiê tanto quanto a Loiê passou a habitar a casa.
                {'\n\n'}Ao longo de sua trajetória, a marca foi construída em diferentes etapas e parcerias, sempre guiada pela atenção às matérias-primas, ao fazer manual e à experiência sensível do aroma. Trabalhamos com ceras vegetais, óleos essenciais e processos cuidadosos, respeitando o tempo de cada criação.
                {'\n\n'}Hoje a Loiê Sala Aromática segue como um ateliê autoral dedicado à criação de atmosferas — objetos que convidam à presença, ao cuidado e a uma relação mais consciente com o espaço e consigo mesmo. Acreditamos que habitar o agora, com atenção e delicadeza, também é uma forma de transformar o mundo.
              </p>
              <div className="mt-10">
                <Link to="/shop" className="loi-btn">explorar coleção</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
