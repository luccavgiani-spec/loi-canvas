import { useSearchParams } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';

const COLLAB_ITEMS = [
  {
    name: 'Ateliê Cerâmica',
    slug: 'atelie-ceramica',
    images: ['/hero/Cartao_Postal_Loie_1.mp4', '/hero/Cartao_Postal_Loie_5.mp4'],
    caption: 'Vasos artesanais × Loiê',
    description: 'Uma colaboração que une a tradição da cerâmica artesanal com as fragrâncias da Loiê. Cada peça é feita à mão e carrega a essência de ambos os ateliês.',
  },
  {
    name: 'Estúdio Botânico',
    slug: 'estudio-botanico',
    images: ['/hero/Cartao_Postal_Loie.mp4', '/hero/Cartao_Postal_Loie_8.mp4'],
    caption: 'Arranjos vivos × fragrâncias',
    description: 'Plantas, flores e aromas se encontram nesta collab que celebra a natureza em sua forma mais pura. Cada arranjo é pensado para complementar nossas velas.',
  },
  {
    name: 'Casa de Chá',
    slug: 'casa-de-cha',
    images: ['/hero/escritorio_cadeira__1_.mp4', '/hero/Cartao_Postal_Loie_1.mp4'],
    caption: 'Rituais de chá × velas',
    description: 'Dois rituais que se complementam: o chá e a vela. Uma experiência sensorial completa, criada para momentos de pausa e contemplação.',
  },
  {
    name: 'Galeria Têxtil',
    slug: 'galeria-textil',
    images: ['/hero/Cartao_Postal_Loie_5.mp4', '/hero/Cartao_Postal_Loie.mp4'],
    caption: 'Tecidos naturais × aromas',
    description: 'Linho, algodão orgânico e fragrâncias exclusivas. Uma collab que transforma ambientes com texturas e aromas que contam histórias.',
  },
];

const CollabDetailCard = ({ collab }: { collab: typeof COLLAB_ITEMS[0] }) => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % collab.images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [collab.images.length]);

  return (
    <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      <div className="relative overflow-hidden aspect-[4/5]">
        {collab.images.map((src, i) => (
          <video
            key={src}
            src={src}
            muted
            playsInline
            autoPlay
            loop
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: currentImage === i ? 1 : 0 }}
          />
        ))}
      </div>
      <div className="flex flex-col justify-center">
        <span className="loi-label block mb-4">collab</span>
        <h2
          className="heading-display mb-4"
          style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: '#29241f', lineHeight: 1.15 }}
        >
          {collab.name}
        </h2>
        <div className="loi-divider mb-6" />
        <p
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 300,
            fontSize: '0.72rem',
            color: '#8B6914',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}
        >
          {collab.caption}
        </p>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: '1.05rem',
            color: 'rgba(41,36,31,0.55)',
            lineHeight: 1.8,
          }}
        >
          {collab.description}
        </p>
      </div>
    </div>
  );
};

const Collabs = () => {
  const ref = useReveal();
  const [searchParams] = useSearchParams();
  const highlightedCollab = searchParams.get('collab');

  return (
    <>
      <CartDrawer />
      <Header />
      <main ref={ref} style={{ background: '#ffffff', paddingTop: '8rem' }}>
        <div className="max-w-[1200px] mx-auto px-6 pb-20">
          <div className="text-center mb-16">
            <span className="reveal loi-label block mb-4">parcerias</span>
            <h1
              className="reveal heading-display"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#29241f' }}
            >
              Collabs
            </h1>
            <p
              className="reveal mt-4"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontStyle: 'italic',
                fontSize: '1.1rem',
                color: 'rgba(41,36,31,0.5)',
                maxWidth: 500,
                margin: '1rem auto 0',
              }}
            >
              Conexões que transformam espaços em experiências.
            </p>
          </div>

          <div className="space-y-20">
            {COLLAB_ITEMS.map((collab) => (
              <div
                key={collab.slug}
                id={collab.slug}
                className={highlightedCollab === collab.slug ? 'ring-2 ring-[#8B6914]/20 rounded-lg p-4 -m-4' : ''}
              >
                <CollabDetailCard collab={collab} />
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Collabs;
