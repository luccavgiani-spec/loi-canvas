import { useEffect, useState } from 'react';
import { useReveal } from '@/hooks/useReveal';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import { getCollabs } from '@/lib/api';
import type { Collab } from '@/types';

const CollabBlock = ({ collab, reverse }: { collab: Collab; reverse: boolean }) => (
  <section id={collab.slug} className="reveal md:grid md:grid-cols-2" style={{ gap: 0 }}>
    {/* Imagem — no HTML sempre primeiro; em desktop ímpar fica à direita via order */}
    <div
      style={{ overflow: 'hidden', order: reverse ? 1 : 0 }}
      className={reverse ? 'md:order-none' : ''}
    >
      {collab.images[0] && (
        <img
          src={collab.images[0]}
          alt={collab.name}
          loading="lazy"
          style={{
            width: '100%',
            aspectRatio: '4 / 5',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      )}
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
        {collab.category && (
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
        )}

        <h2
          className="heading-display"
          style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            color: '#000',
            lineHeight: 1.15,
            marginBottom: '1rem',
          }}
        >
          {collab.name}{collab.year ? ` — ${collab.year}` : ''}
        </h2>

        <div className="loi-divider" style={{ marginBottom: '1.5rem' }} />

        {collab.description && (
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
        )}
      </div>
    </div>
  </section>
);

const Collabs = () => {
  const ref = useReveal();
  const [collabs, setCollabs] = useState<Collab[]>([]);

  useEffect(() => {
    getCollabs()
      .then(setCollabs)
      .catch(err => console.error('[Collabs] load failed', err));
  }, []);

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
        {collabs.map((collab, index) => (
          <div key={collab.id}>
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
