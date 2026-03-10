import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';
import { useCart } from '@/contexts/CartContext';
import { mockProducts } from '@/lib/mocks';
import { storageUrl } from '@/lib/storage';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PRODUCTS = mockProducts;
const SALA_OU_ESTAR = PRODUCTS.filter((p) => p.collection === 'Sala ou Estar').slice(0, 6);
const REFUGIO = PRODUCTS.filter((p) => p.collection === 'Refúgio').slice(0, 4);

/* ── Horizontal carousel with snap scrolling ── */
const ProductCarousel = ({
  products,
  addItem,
}: {
  products: typeof PRODUCTS;
  addItem: (p: typeof PRODUCTS[0]) => void;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, products]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector('[data-carousel-item]') as HTMLElement | null;
    const distance = card ? card.offsetWidth + 16 : el.clientWidth * 0.5;
    el.scrollBy({ left: dir === 'left' ? -distance : distance, behavior: 'smooth' });
  };

  return (
    <div className="relative group/carousel">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/3 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
          style={{ background: 'rgba(0,0,0,0.6)', color: '#f4edd2', backdropFilter: 'blur(4px)' }}
          aria-label="Anterior"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/3 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
          style={{ background: 'rgba(0,0,0,0.6)', color: '#f4edd2', backdropFilter: 'blur(4px)' }}
          aria-label="Próximo"
        >
          <ChevronRight size={18} />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-carousel-item
            className="group flex-shrink-0 snap-start"
          >
            <Link to={`/product/${product.slug}`} className="block relative overflow-hidden aspect-[3/4] mb-4">
              {product.images[0]?.match(/\.mp4$/i) ? (
                <video
                  src={product.images[0]}
                  muted
                  playsInline
                  autoPlay
                  loop
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              )}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }}
              />
              {product.badge && (
                <span
                  className="absolute top-3 left-3"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 300,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontSize: '0.6rem',
                    color: '#f4edd2',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '4px 10px',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {product.badge === 'sale' ? 'Promoção' : product.badge === 'new' ? 'Novo' : 'Edição Limitada'}
                </span>
              )}
              <button
                onClick={(e) => { e.preventDefault(); addItem(product); }}
                className="absolute bottom-0 left-0 right-0 py-3 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                style={{
                  background: 'rgba(86,86,0,0.9)',
                  color: '#f4edd2',
                  fontFamily: "var(--font-body)",
                  fontWeight: 300,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  fontSize: '0.65rem',
                  backdropFilter: 'blur(4px)',
                }}
              >
                adicionar ao carrinho
              </button>
            </Link>
            <Link to={`/product/${product.slug}`} className="block">
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: '1.1rem', color: '#000', marginBottom: 4 }}>
                {product.name}
              </h3>
              <div className="flex items-center gap-3">
                <span style={{ fontFamily: "var(--font-body)", fontWeight: 300, fontSize: '0.8rem', color: '#000' }}>
                  R$ {product.price.toFixed(2)}
                </span>
                {product.compare_at_price && (
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: 300, fontSize: '0.7rem', color: 'rgba(0,0,0,0.4)', textDecoration: 'line-through' }}>
                    R$ {product.compare_at_price.toFixed(2)}
                  </span>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>

      {products.length > 4 && (
        <div className="flex justify-center gap-1.5 mt-6 md:hidden">
          {Array.from({ length: Math.ceil(products.length / 2) }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.15)' }} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Product focus banner with video support ── */
const ProductFocusBanner = ({
  product,
  reverse = false,
  videoSrc,
}: {
  product: typeof PRODUCTS[0];
  reverse?: boolean;
  videoSrc?: string;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div className={`reveal flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} min-h-[50vh]`}>
      <div className="md:w-1/2 relative overflow-hidden" style={{ minHeight: 350 }}>
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            playsInline
            loop
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <img
            src={product.images[0]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: reverse
              ? 'linear-gradient(to left, transparent 60%, #f4edd2)'
              : 'linear-gradient(to right, transparent 60%, #f4edd2)',
          }}
        />
      </div>
      <div className="md:w-1/2 flex items-center px-8 md:px-16 lg:px-24 py-16 md:py-0" style={{ background: '#f4edd2' }}>
        <div className="max-w-md">
          <span className="loi-label block mb-4">{product.collection}</span>
          <h3
            className="heading-display mb-4"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: '#000', lineHeight: 1.15 }}
          >
            {product.name}
          </h3>
          <div className="loi-divider mb-6" />
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: '1.05rem',
              color: '#000',
              lineHeight: 1.8,
              marginBottom: '1.5rem',
            }}
          >
            {product.description}
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontWeight: 300, fontSize: '0.85rem', color: '#000', marginBottom: '1.5rem' }}>
            R$ {product.price.toFixed(2)}
          </p>
          <Link to={`/product/${product.slug}`} className="loi-btn-outline">
            ver produto
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ── Collabs grid item with rotating images ── */
const COLLAB_ITEMS = [
  { name: 'Ateliê Cerâmica', slug: 'atelie-ceramica', images: [storageUrl('loie_vela_bosque_compress (1).mp4'), storageUrl('loie_vela_pomar.mp4')], caption: 'Vasos artesanais × Loiê' },
  { name: 'Estúdio Botânico', slug: 'estudio-botanico', images: [storageUrl('Cartao_Postal_Loie.mp4'), storageUrl('loie_vela_estela (1).mp4')], caption: 'Arranjos vivos × fragrâncias' },
  { name: 'Casa de Chá', slug: 'casa-de-cha', images: [storageUrl('escritorio_cadeira__1_.mp4'), storageUrl('loie_vela_bosque_compress (1).mp4')], caption: 'Rituais de chá × velas' },
  { name: 'Galeria Têxtil', slug: 'galeria-textil', images: [storageUrl('loie_vela_estela (1).mp4'), storageUrl('Cartao_Postal_Loie.mp4')], caption: 'Tecidos naturais × aromas' },
];

const CollabCard = ({ collab }: { collab: typeof COLLAB_ITEMS[0] }) => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % collab.images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [collab.images.length]);

  return (
    <div className="reveal group">
      <Link to={`/collabs?collab=${collab.slug}`} className="block">
        <div className="relative overflow-hidden aspect-[4/5] mb-3">
          {collab.images.map((src, i) => (
            <video
              key={src}
              src={src}
              muted
              playsInline
              autoPlay
              loop
              preload="none"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
              style={{ opacity: currentImage === i ? 1 : 0 }}
            />
          ))}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }}
          />
        </div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: '1.1rem', color: '#000', marginBottom: 2 }}>
          {collab.name}
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontWeight: 300, fontSize: '0.72rem', color: '#000', marginBottom: 8 }}>
          {collab.caption}
        </p>
      </Link>
      <Link to={`/collabs?collab=${collab.slug}`} className="loi-ghost group/link" style={{ fontSize: '0.65rem' }}>
        <span>ver collab</span>
        <span className="loi-ghost-dash" />
        <span className="transition-transform duration-300 group-hover/link:translate-x-1">→</span>
      </Link>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────── */
const HomeSections = () => {
  const ref = useReveal();
  const { addItem } = useCart();

  const focusBosque = PRODUCTS.find((p) => p.slug === 'bosque')!;
  const focusPomar = PRODUCTS.find((p) => p.slug === 'pomar')!;

  return (
    <div ref={ref} style={{ background: '#fcf5e0' }}>
      {/* ── Degradê de transição hero → conteúdo ── */}
      <div
        style={{
          height: 'clamp(120px, 18vw, 240px)',
          background: 'linear-gradient(to bottom, #29241f 0%, #3a3228 15%, #5c5040 30%, #8a7d6a 45%, #b8ad97 58%, #ddd5c0 72%, #efe9d3 85%, #fcf5e0 100%)',
        }}
      />

      {/* ── 1. Bestsellers — Carousel ── */}
      <section className="py-16 px-6 md:py-0">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <span className="reveal loi-label block mb-4">mais amados</span>
            <h2 className="reveal heading-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#000' }}>
              Bestsellers
            </h2>
          </div>
          <div className="reveal">
            <ProductCarousel products={SALA_OU_ESTAR} addItem={addItem} />
          </div>
          <div className="reveal text-center mt-10">
            <Link to="/shop/sala-ou-estar" className="loi-ghost group">
              <span>ver toda a coleção</span>
              <span className="loi-ghost-dash" />
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Banner de Produto Foco — Bosque (video) / Pomar (video) ── */}
      <section className="relative">
        <ProductFocusBanner product={focusBosque} videoSrc={storageUrl('loie_vela_bosque_compress (1).mp4')} />
      </section>
      <section className="relative">
        <ProductFocusBanner product={focusPomar} reverse videoSrc={storageUrl('loie_vela_pomar.mp4')} />
      </section>

      {/* ── 3. Descubra Novos Aromas — Carousel ── */}
      <section className="py-16 md:py-20 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="reveal heading-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#000' }}>
              Descubra Novos Aromas
            </h2>
          </div>
          <div className="reveal">
            <ProductCarousel products={REFUGIO} addItem={addItem} />
          </div>
          <div className="reveal text-center mt-10">
            <Link to="/shop/refugio" className="loi-ghost group">
              <span>ver toda a coleção</span>
              <span className="loi-ghost-dash" />
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. Collabs — Grid animado ── */}
      <section className="py-16 px-6 md:py-[5px]" style={{ background: '#f4edd2' }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="reveal heading-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#000' }}>
              Collabs
            </h2>
          </div>
          <div className="reveal-stagger grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {COLLAB_ITEMS.map((collab) => (
              <CollabCard key={collab.slug} collab={collab} />
            ))}
          </div>
          <div className="reveal text-center mt-10">
            <Link to="/collabs" className="loi-ghost group">
              <span>ver todas as collabs</span>
              <span className="loi-ghost-dash" />
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. FAQ Section ── */}
      <section className="py-16 md:py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <span className="reveal loi-label block mb-4">dúvidas</span>
            <h2 className="reveal heading-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#000' }}>
              Perguntas Frequentes
            </h2>
          </div>
          <div className="reveal space-y-0">
            {[
              { q: 'Qual o tempo de queima das velas?', a: 'Nossas velas de 250g têm duração aproximada de 50 horas. Recomendamos queimar por no máximo 4 horas seguidas para garantir a melhor performance da fragrância.' },
              { q: 'As velas são veganas e cruelty-free?', a: 'Sim! Utilizamos cera de soja 100% vegetal, pavios de algodão e fragrâncias livres de testes em animais. Nosso compromisso com a sustentabilidade é total.' },
              { q: 'Como funciona o frete?', a: 'Frete grátis para compras acima de R$ 299. Para pedidos menores, calculamos o frete no checkout com as melhores opções de envio para a sua região.' },
              { q: 'Posso trocar ou devolver?', a: 'Aceitamos trocas e devoluções em até 7 dias após o recebimento, desde que o produto não tenha sido usado. Sua satisfação é nossa prioridade.' },
              { q: 'Qual a diferença entre as coleções?', a: 'Temos quatro coleções: Cotidianas (latinhas 160g, aromas básicos perfeitos como lembrança), Sala ou Estar (copo 200g, criações autorais com óleos essenciais puros), Refúgio (copo âmbar 300g, composições exclusivas com assinatura Loiê) e Botânicas e Florais (copo 400g, dois pavios, aromas exclusivos para queimas longas).' },
            ].map((faq, i) => (
              <details key={i} className="group" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <summary
                  className="flex items-center justify-between py-5 cursor-pointer list-none"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: '1.1rem', color: '#000' }}
                >
                  {faq.q}
                  <span className="ml-4 flex-shrink-0 transition-transform duration-300 group-open:rotate-45" style={{ color: '#000', fontSize: '1.5rem', fontWeight: 200 }}>
                    +
                  </span>
                </summary>
                <p className="pb-5" style={{ fontFamily: "var(--font-body)", fontWeight: 300, fontSize: '0.82rem', color: '#000', lineHeight: 1.8, maxWidth: 520 }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Newsletter / CTA Section ── */}
      <section className="py-16 px-6 relative overflow-hidden md:py-[40px]" style={{ background: '#f4edd2' }}>
        <div className="loi-grain" />
        <div className="relative z-[1] max-w-lg mx-auto text-center">
          <span className="reveal loi-label block mb-6">exclusivo</span>
          <h2
            className="reveal heading-display mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#000', lineHeight: 1.15 }}
          >
            Ganhe 15% na primeira compra
          </h2>
          <p
            className="reveal mb-10"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: '1.05rem',
              color: '#000',
              lineHeight: 1.7,
            }}
          >
            Cadastre seu e-mail e receba um cupom exclusivo de boas-vindas,
            além de novidades e lançamentos em primeira mão.
          </p>
          <form className="reveal flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="seu@email.com"
              className="flex-1 px-4 py-3 bg-transparent border text-sm"
              style={{
                borderColor: 'rgba(0,0,0,0.2)',
                color: '#000',
                fontFamily: "var(--font-body)",
                fontWeight: 300,
                letterSpacing: '0.05em',
                outline: 'none',
              }}
            />
            <button type="submit" className="loi-btn w-full sm:w-auto justify-center" style={{ padding: '0.75rem 1.8rem' }}>
              cadastrar
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomeSections;
