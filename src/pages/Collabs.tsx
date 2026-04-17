import { useReveal } from '@/hooks/useReveal';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import { collabsUrl } from '@/lib/storage';

const COLLABS = [
  {
    slug: 'natura',
    category: 'kit de imprensa',
    title: 'Natura',
    year: '2022',
    description: 'a loiê desenvolveu uma série especial de oito velas aromáticas para acompanhar o lançamento de produtos de cuidado corporal. criadas exclusivamente para kit de imprensa, essas peças foram pensadas como extensão sensorial das fórmulas — um gesto silencioso de atmosfera e presença.',
    images: ['natura.jpeg'],
  },
  {
    slug: 'salon-line',
    category: 'kit de imprensa',
    title: 'Salon Line',
    year: '2021',
    description: 'a loiê desenvolveu velas aromáticas para um kit de imprensa destinado aos embaixadores da salon line, em ocasião do "reencontrinho". peças pensadas como gesto de acolhimento e atmosfera de autocuidado.',
    images: ['salon_line (1).jpeg', 'salon_line (2).jpeg', 'salon_line (3).jpeg'],
  },
  {
    slug: 'malu-muhamad',
    category: 'desenvolvidos em colaboração',
    title: 'Malu Muhamad',
    year: '2022',
    description: 'duas coleções de velas da loiê receberam vasos desenvolvidos em colaboração com a ceramista malu muhamad. produzidas em pequenos lotes, as peças foram pensadas com atenção à forma, à matéria e ao gesto manual.',
    images: ['malu (1).jpeg', 'malu (2).jpeg', 'malu (3).jpeg', 'malu (4).jpeg'],
  },
  {
    slug: 'neco-cunha',
    category: 'desenvolvidos em colaboração',
    title: 'Neco Cunha',
    year: '2023',
    description: 'a loiê encomendou uma coleção de porta-velas ao artista regional neco cunha. as peças, desenvolvidas em marchetaria com madeiras nobres, revelam o encontro entre desenho, matéria e precisão manual.',
    images: ['neco (3).jpeg', 'neco (1).jpeg', 'neco (2).jpeg', 'neco (4).jpeg'],
  },
  {
    slug: 'canal-concept',
    category: 'kit de imprensa',
    title: 'Canal Concept',
    year: '2023',
    description: 'a loiê desenvolveu uma vela aromática para um evento da canal concept. distribuídas entre colaboradores, clientes e parceiros.',
    images: ['concept.jpeg'],
  },
];

const CollabBlock = ({ collab, reverse }: { collab: typeof COLLABS[0]; reverse: boolean }) => (
  <section id={collab.slug} className="reveal md:grid md:grid-cols-2" style={{ gap: 0 }}>
    {/* Imagem — no HTML sempre primeiro; em desktop ímpar fica à direita via order */}
    <div
      style={{ overflow: 'hidden', order: reverse ? 1 : 0 }}
      className={reverse ? 'md:order-none' : ''}
    >
      <img
        src={collabsUrl(collab.images[0])}
        alt={collab.title}
        loading="lazy"
        style={{
          width: '100%',
          aspectRatio: '4 / 5',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>

    {/* Texto */}
    <div
      style={{
        background: '#fcf5e0',
        display: 'flex',
        alignItems: 'center',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(2rem, 5vw, 4rem)',
        order: reverse ? 0 : 1,
      }}
      className={reverse ? 'md:order-none' : ''}
    >
      <div style={{ maxWidth: '480px' }}>
        <span
          style={{
            fontFamily: "'Sackers Gothic', sans-serif",
            fontWeight: 300,
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(0,0,0,0.5)',
            display: 'block',
            marginBottom: '0.75rem',
          }}
        >
          {collab.category}
        </span>

        <h2
          className="heading-display"
          style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            color: '#000',
            lineHeight: 1.15,
            marginBottom: '1rem',
          }}
        >
          {collab.title} — {collab.year}
        </h2>

        <div className="loi-divider" style={{ marginBottom: '1.5rem' }} />

        <p
          style={{
            fontFamily: "'Sackers Gothic', sans-serif",
            fontWeight: 300,
            fontSize: '0.72rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(0,0,0,0.75)',
            lineHeight: 1.9,
            margin: 0,
          }}
        >
          {collab.description}
        </p>
      </div>
    </div>
  </section>
);

const Collabs = () => {
  const ref = useReveal();

  return (
    <>
      <CartDrawer />
      <Header />
      <main ref={ref} style={{ background: '#fcf5e0', paddingTop: '8rem', textTransform: 'uppercase' }}>
        {/* ── Header da página ── */}
        <div className="text-center pb-16 px-6">
          <h1
            className="reveal heading-display"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#000', marginBottom: '0.75rem' }}
          >
            colaborações
          </h1>
          <span
            className="reveal"
            style={{
              fontFamily: "'Sackers Gothic', sans-serif",
              fontWeight: 300,
              fontSize: '0.72rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(0,0,0,0.5)',
              display: 'block',
            }}
          >
            parcerias &amp; projetos especiais
          </span>
        </div>

        {/* ── Blocos alternados ── */}
        {COLLABS.map((collab, index) => (
          <div key={collab.slug}>
            <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)', margin: 0 }} />
            <CollabBlock collab={collab} reverse={index % 2 !== 0} />
          </div>
        ))}

        <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)', margin: 0 }} />
        <div style={{ paddingBottom: '5rem' }} />
      </main>
      <Footer />
    </>
  );
};

export default Collabs;
