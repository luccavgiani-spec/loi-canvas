import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';
import { useCart } from '@/contexts/CartContext';
import { getProducts } from '@/lib/api';
import { storageUrl, collabsUrl } from '@/lib/storage';
import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LazyVideo from '@/components/LazyVideo';
import type { Product } from '@/types';

/* ── Horizontal carousel with snap scrolling ── */
const ProductCarousel = memo(({
  products,
  addItem,
  dark = false,
}: {
  products: Product[];
  addItem: (p: Product) => void;
  dark?: boolean;
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
            <Link to={`/product/${product.slug}`} className="block relative overflow-hidden mb-4" style={{ aspectRatio: '3/4' }}>
              {product.images[0]?.match(/\.mp4$/i) ? (
                <LazyVideo
                  src={product.images[0]}
                  className="relative w-full h-full"
                  rootMargin="100px 0px"
                />
              ) : (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  width={400}
                  height={533}
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
              <h3 style={{ fontFamily: "'Wagon', sans-serif", fontWeight: 400, fontSize: '1.1rem', color: dark ? '#f4edd2' : '#000', marginBottom: 4 }}>
                {product.name}
              </h3>
              <div className="flex items-center gap-3">
                <span style={{ fontFamily: "var(--font-body)", fontWeight: 300, fontSize: '0.8rem', color: dark ? '#f4edd2' : '#000' }}>
                  R$ {product.price.toFixed(2)}
                </span>
                {product.compare_at_price && (
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: 300, fontSize: '0.7rem', color: dark ? 'rgba(244,237,210,0.4)' : 'rgba(0,0,0,0.4)', textDecoration: 'line-through' }}>
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
            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: dark ? 'rgba(244,237,210,0.2)' : 'rgba(0,0,0,0.15)' }} />
          ))}
        </div>
      )}
    </div>
  );
});

ProductCarousel.displayName = 'ProductCarousel';

/* ── Product focus banner with lazy video ── */
const ProductFocusBanner = memo(({
  product,
  reverse = false,
  videoSrc,
  dark = false,
}: {
  product: Product;
  reverse?: boolean;
  videoSrc?: string;
  dark?: boolean;
}) => {
  return (
    <div className={`reveal flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} min-h-[50vh]`}>
      <div className="md:w-1/2 relative md:flex md:items-center md:justify-center" style={{ minHeight: 350, background: dark ? '#f4edd2' : '#f4edd2' }}>
        {/* mobile-only: gradient strip above the video, outside/adjacent (not a mask) */}
        <div
          className="md:hidden w-full pointer-events-none"
          style={{ height: '3rem', background: 'linear-gradient(to bottom, #f4edd2 0%, transparent 100%)', flexShrink: 0 }}
        />
        <div
          className="relative overflow-hidden w-full"
          style={{ aspectRatio: '4 / 3', background: '#29241f' }}
        >
          {videoSrc ? (
            <LazyVideo
              src={videoSrc}
              className="relative w-full h-full"
              style={{ aspectRatio: '4/3' }}
              rootMargin="300px 0px"
            />
          ) : (
            <img
              src={product.images[0]}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
        {/* mobile-only: gradient strip below the video, outside/adjacent (not a mask) */}
        <div
          className="md:hidden w-full pointer-events-none"
          style={{ height: '3rem', background: 'linear-gradient(to top, #f4edd2 0%, transparent 100%)', flexShrink: 0 }}
        />
      </div>
      <div className="md:w-1/2 flex items-center px-6 md:px-10 lg:px-16 py-12 md:py-0" style={{ background: '#f4edd2' }}>
        <div className="max-w-md">
          <span className="loi-label block mb-4">{product.collection}</span>
          <h3
            className="heading-display mb-4"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: '#29241f', lineHeight: 1.15 }}
          >
            {product.name}
          </h3>
          <div className="loi-divider mb-6" />
          <p
            style={{
              fontFamily: "'Sackers Gothic Std', 'Sackers Gothic', sans-serif",
              fontWeight: 300,
              fontSize: '0.72rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(0,0,0,0.75)',
              lineHeight: 1.9,
              marginBottom: '1.5rem',
            }}
          >
            {product.description}
          </p>
          <p style={{ fontFamily: "'Sackers Gothic', sans-serif", fontWeight: 300, fontSize: '0.85rem', color: '#29241f', marginBottom: '1.5rem' }}>
            R$ {product.price.toFixed(2)}
          </p>
          <Link to={`/product/${product.slug}`} className="loi-btn-outline">
            ver produto
          </Link>
        </div>
      </div>
    </div>
  );
});

ProductFocusBanner.displayName = 'ProductFocusBanner';

/* ── Collabs grid item with lazy rotating images ── */
const COLLAB_ITEMS = [
  { slug: 'natura', category: 'kit de imprensa', name: 'Natura', year: '2022', images: [collabsUrl('natura.jpeg')] },
  { slug: 'salon-line', category: 'kit de imprensa', name: 'Salon Line', year: '2021', images: [collabsUrl('salon_line (1).jpeg'), collabsUrl('salon_line (2).jpeg'), collabsUrl('salon_line (3).jpeg')] },
  { slug: 'malu-muhamad', category: 'desenvolvidos em colaboração', name: 'Malu Muhamad', year: '2022', images: [collabsUrl('malu (1).jpeg'), collabsUrl('malu (2).jpeg'), collabsUrl('malu (3).jpeg'), collabsUrl('malu (4).jpeg')] },
  { slug: 'neco-cunha', category: 'desenvolvidos em colaboração', name: 'Neco Cunha', year: '2023', images: [collabsUrl('neco (1).jpeg'), collabsUrl('neco (2).jpeg'), collabsUrl('neco (3).jpeg'), collabsUrl('neco (4).jpeg')] },
  { slug: 'canal-concept', category: 'kit de imprensa', name: 'Canal Concept', year: '2023', images: [collabsUrl('concept.jpeg')] },
];

const CollabCard = memo(({ collab }: { collab: typeof COLLAB_ITEMS[0] }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  /* Only mount videos when the card is near the viewport */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '200px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Rotate images only when visible */
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % collab.images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [collab.images.length, isVisible]);

  return (
    <div className="reveal group" ref={containerRef}>
      <Link to={`/collabs#${collab.slug}`} className="block">
        <div className="relative overflow-hidden mb-3" style={{ aspectRatio: '4/5' }}>
          {isVisible && collab.images.map((src, i) => (
            <div
              key={src}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: currentImage === i ? 1 : 0, willChange: 'opacity' }}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }}
          />
        </div>
        <p style={{ fontFamily: "'Sackers Gothic', sans-serif", fontWeight: 300, fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.5)', marginBottom: 4 }}>
          {collab.category}
        </p>
        <p style={{ fontFamily: "'Wagon', sans-serif", fontWeight: 400, fontSize: '1.1rem', color: '#000', marginBottom: 8 }}>
          {collab.name} — {collab.year}
        </p>
      </Link>
      <Link to={`/collabs#${collab.slug}`} className="loi-ghost group/link" style={{ fontSize: '0.65rem' }}>
        <span className="md:hidden">ver</span>
        <span className="hidden md:inline">ver colaboração</span>
        <span className="loi-ghost-dash" />
        <span className="transition-transform duration-300 group-hover/link:translate-x-1">→</span>
      </Link>
    </div>
  );
});

CollabCard.displayName = 'CollabCard';

/* ────────────────────────────────────────────────────────────── */
const HomeSections = () => {
  const { addItem } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useReveal(0.15, [loading]);

  useEffect(() => {
    getProducts()
      .then(setAllProducts)
      .finally(() => setLoading(false));
  }, []);

  const salaOuEstar = allProducts
    .filter((p) =>
      p.collection?.toLowerCase().includes('sala') ||
      p.collection_slug === 'sala-ou-estar'
    )
    .slice(0, 6);
  const refugio = allProducts
    .filter((p) =>
      p.collection?.toLowerCase().includes('ref') ||
      p.collection_slug === 'refugio'
    )
    .slice(0, 4);
  const focusBosque = allProducts.find((p) => p.slug === 'bosque');
  const focusPomar = allProducts.find((p) => p.slug === 'pomar');

  return (
    <div ref={ref} style={{ background: '#fcf5e0' }}>
      {/* ── Degradê de transição hero → conteúdo ── */}
      <div
        style={{
          height: 'clamp(120px, 18vw, 240px)',
          background: 'linear-gradient(to bottom, #29241f 0%, #3a3228 20%, #6e6455 45%, #b5a890 70%, #e8e0cc 88%, #fcf5e0 100%)',
        }}
      />

      {/* ── 1. Bestsellers — Carousel ── */}
      <section className="py-16 px-6 md:py-0 loi-section-lazy">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <span className="reveal loi-label block mb-4">mais pedidas</span>
            <h2 className="reveal heading-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#000' }}>
              mais pedidas
            </h2>
          </div>
          <div className="reveal">
            <ProductCarousel products={salaOuEstar} addItem={addItem} />
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

      {/* ── Separador cream → cream (sutil) ── */}
      <div style={{ height: 'clamp(40px, 6vw, 80px)', background: '#f4edd2' }} />

      {/* ── 2. Banner de Produto Foco — Bosque (video) / Pomar (video) ── */}
      <section style={{ background: '#f4edd2' }} className="loi-section-lazy">
        {loading ? (
          <div style={{ minHeight: '50vh', background: '#f4edd2' }} />
        ) : (
          <>
            {focusBosque && (
              <div className="relative">
                <ProductFocusBanner product={focusBosque} videoSrc={storageUrl('loie_vela_bosque_compress (1).mp4')} dark />
              </div>
            )}
            {focusPomar && (
              <div className="relative">
                <ProductFocusBanner product={focusPomar} reverse videoSrc={storageUrl('loie_vela_pomar.mp4')} dark />
              </div>
            )}
            {!focusBosque && !focusPomar && (
              <>
                {allProducts[0] && (
                  <div className="relative">
                    <ProductFocusBanner product={allProducts[0]} videoSrc={storageUrl('loie_vela_bosque_compress (1).mp4')} dark />
                  </div>
                )}
                {allProducts[1] && (
                  <div className="relative">
                    <ProductFocusBanner product={allProducts[1]} reverse videoSrc={storageUrl('loie_vela_pomar.mp4')} dark />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>

      {/* ── Separador cream → cream (sutil) ── */}
      <div style={{ height: 'clamp(40px, 6vw, 80px)', background: '#f4edd2' }} />

      {/* ── 3. Descubra Novos Aromas — Carousel ── */}
      <section className="py-16 md:py-20 px-6 loi-section-lazy">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="reveal heading-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#000' }}>
              Descubra Novos Aromas
            </h2>
          </div>
          <div className="reveal">
            <ProductCarousel products={refugio} addItem={addItem} />
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
      <section className="py-16 px-6 md:py-[5px] loi-section-lazy" style={{ background: '#f4edd2' }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="reveal heading-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#000' }}>
              Colaborações
            </h2>
            <span
              style={{
                fontFamily: "'Sackers Gothic Std', 'Sackers Gothic', sans-serif",
                fontWeight: 300,
                fontSize: '0.65rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(0,0,0,0.4)',
                display: 'block',
                marginTop: '0.35rem',
              }}
            >
              collabs
            </span>
          </div>
          <div
            className="reveal-stagger"
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              gap: '1.5rem',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {COLLAB_ITEMS.map((collab) => (
              <div key={collab.slug} style={{ flexShrink: 0, scrollSnapAlign: 'start', minWidth: '240px' }}>
                <CollabCard collab={collab} />
              </div>
            ))}
          </div>
          <div className="reveal text-center mt-10">
            <Link to="/collabs" className="loi-ghost group">
              <span>ver todas as colaborações</span>
              <span className="loi-ghost-dash" />
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. FAQ Section ── */}
      <section className="py-16 md:py-20 px-6 loi-section-lazy">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <span className="reveal loi-label block mb-4" style={{ color: '#29241f' }}>dúvidas</span>
            <h2 className="reveal heading-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#29241f' }}>
              Perguntas Frequentes
            </h2>
          </div>
          <div className="reveal space-y-0">
            {[
              { q: 'Qual o tempo de queima das velas?', a: 'cotidianas 160g ————————— aprox. 20 horas\nsala 200g —————————————— aprox. 45 horas\nrefúgio 300g ——————————— aprox. 55 horas\nbotânicas & florais 400g —— aprox. 65 horas\n\npara queimas saudáveis e seguras, recomendamos sessões de até 4 horas seguidas — tempo suficiente para perfumar o ambiente sem comprometer o desempenho da vela.' },
              { q: 'As velas são veganas e cruelty-free?', a: 'Sim. Utilizamos exclusivamente ceras vegetais de coco, arroz e palma, pavios de algodão e óleos essenciais puros — sem nenhum componente de origem animal. Nenhum produto Loiê é testado em animais.' },
              { q: 'Posso trocar ou devolver?', a: 'Aceitamos trocas e devoluções em até 7 dias após o recebimento, desde que o produto esteja sem uso. Para solicitar, basta entrar em contato pelo e-mail ou WhatsApp — resolvemos com agilidade.' },
              { q: 'As velas são seguras para uso com pets ou crianças?', a: 'Nossas velas são feitas com óleos essenciais puros e ceras vegetais sem aditivos sintéticos. Em ambientes com pets ou crianças pequenas, recomendamos ventilação adequada e manter a vela fora do alcance. Óleos como eucalipto e menta exigem atenção especial com gatos — prefira usar com o ambiente bem arejado.' },
              { q: 'Qual a diferença entre as velas de 200g e as de 300g?', a: 'As velas de 200g têm duração aproximada de 45 horas e são ideais para ambientes menores ou uso diário. As de 300g duram cerca de 55 horas e entregam maior presença aromática — indicadas para salas maiores ou para quem quer que o aroma se prolongue por mais tempo.' },
              { q: 'Posso usar a vela em ambientes pequenos, como banheiros?', a: 'Sim. Em espaços menores, o aroma se concentra com rapidez. Recomendamos sessões mais curtas para evitar saturação sensorial. Velas com perfil mais suave, como Campos ou Ícaro, funcionam especialmente bem nesses ambientes.' },
              { q: 'Como armazenar a vela quando não estiver em uso?', a: 'Guarde em local fresco, seco e afastado da luz solar direta. Evite superfícies que absorvam calor, como peitoris de janela em dias quentes.' },
            ].map((faq, i) => (
              <details key={i} className="group" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <summary
                  className="flex items-center py-5 cursor-pointer list-none"
                  style={{
                    fontFamily: "'Sackers Gothic Std', 'Sackers Gothic', sans-serif",
                    fontWeight: 300,
                    fontSize: '0.72rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(0,0,0,0.75)',
                    lineHeight: 1.9,
                  }}
                >
                  {faq.q}
                </summary>
                <p className="pb-5 whitespace-pre-line" style={{ fontFamily: "var(--font-body)", fontWeight: 300, fontSize: '0.82rem', color: '#29241f', lineHeight: 1.8, maxWidth: 520 }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Newsletter / CTA Section ── */}
      <section className="py-16 px-6 relative overflow-hidden md:py-[40px] loi-section-lazy" style={{ background: '#f4edd2' }}>
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
              fontFamily: "'Wagon', sans-serif",
              fontWeight: 300,
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
              className="flex-1 px-4 py-3 bg-transparent border text-base"
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
