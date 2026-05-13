import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';
import { useCart } from '@/contexts/CartContext';
import { getProducts, getCollabs, getBestsellerProducts, getCollections } from '@/lib/api';
import { storageUrl } from '@/lib/storage';
import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LazyVideo from '@/components/LazyVideo';
import ArrowLink from '@/components/ui/ArrowLink';
import ProductPriceTag from '@/components/shop/ProductPriceTag';
import { getProductAvailability } from '@/lib/productFilters';
import type { Product, Collab, Collection } from '@/types';
import { useSiteContent, useSiteContentList, readBlockText } from '@/lib/site-content/hooks';
import EditableText from '@/components/site-content/EditableText';

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
        {products.map((product) => {
          const availability = getProductAvailability(product);
          const canAdd = availability === 'estoque';
          return (
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
                  onClick={(e) => { e.preventDefault(); if (canAdd) addItem(product); }}
                  disabled={!canAdd}
                  aria-disabled={!canAdd}
                  className="absolute bottom-0 left-0 right-0 py-3 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 disabled:cursor-not-allowed"
                  style={{
                    background: canAdd ? 'rgba(86,86,0,0.9)' : 'rgba(41,36,31,0.75)',
                    color: '#f4edd2',
                    fontFamily: "var(--font-body)",
                    fontWeight: 300,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontSize: '0.65rem',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {availability === 'em-breve'
                    ? 'em breve'
                    : availability === 'esgotado'
                      ? 'esgotado'
                      : 'adicionar ao carrinho'}
                </button>
              </Link>
              <Link to={`/product/${product.slug}`} className="block">
                <h3 style={{ fontFamily: "'Wagon', sans-serif", fontWeight: 400, fontSize: '1.1rem', color: dark ? '#f4edd2' : '#000', marginBottom: 4 }}>
                  {product.name}
                </h3>
                <ProductPriceTag product={product} dark={dark} />
              </Link>
            </div>
          );
        })}
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
            {(() => {
              const text = product.details ?? product.description ?? '';
              return text.length > 120 ? `${text.slice(0, 120).trimEnd()}…` : text;
            })()}
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
const CollabCard = memo(({ collab }: { collab: Collab }) => {
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
    if (!isVisible || collab.images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % collab.images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [collab.images.length, isVisible]);

  return (
    <div className="reveal group" ref={containerRef} style={{ textAlign: 'left' }}>
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
        {collab.category && (
          <p style={{ fontFamily: "'Sackers Gothic', sans-serif", fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', marginBottom: 5, lineHeight: 1.5 }}>
            {collab.category}
          </p>
        )}
        <p style={{ fontFamily: "'Sackers Gothic', sans-serif", fontWeight: 400, fontSize: '0.75rem', letterSpacing: '0.12em', color: '#000', marginBottom: 2, lineHeight: 1.3 }}>
          {collab.name}
        </p>
        {collab.year && (
          <p style={{ fontFamily: "'Sackers Gothic', sans-serif", fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(0,0,0,0.45)', marginBottom: 8 }}>
            {collab.year}
          </p>
        )}
        {collab.description && (
          <p style={{ fontFamily: "'Sackers Gothic', sans-serif", fontWeight: 300, fontSize: '0.6rem', letterSpacing: '0.05em', color: 'rgba(0,0,0,0.55)', lineHeight: 1.7, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {collab.description}
          </p>
        )}
      </Link>
      <Link to={`/collabs#${collab.slug}`}>
        <ArrowLink>
          <span className="md:hidden">ver</span>
          <span className="hidden md:inline">ver colaboração</span>
        </ArrowLink>
      </Link>
    </div>
  );
});

CollabCard.displayName = 'CollabCard';

/* ── Circular collab carousel – button-driven, no scrollbar ── */
const CLONE_COUNT = 3; // clones appended for seamless loop (SHOW - 1)

const CollabCarousel = memo(() => {
  const [items, setItems] = useState<Collab[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const lockRef = useRef(false);
  const [cardWidth, setCardWidth] = useState<number | null>(null);

  useEffect(() => {
    getCollabs()
      .then(setItems)
      .catch(err => console.error('[CollabCarousel] load failed', err));
  }, []);

  const N = items.length;
  const extended = N > 0 ? [...items, ...items.slice(0, Math.min(CLONE_COUNT, N))] : [];

  useEffect(() => {
    const compute = () => {
      const c = containerRef.current;
      if (!c) return;
      const show = c.offsetWidth >= 600 ? 4 : 2;
      const gap = 24; // 1.5rem at 16px base
      setCardWidth((c.offsetWidth - gap * (show - 1)) / show);
      // Reset position on resize to avoid stale offset
      const track = trackRef.current;
      if (track) {
        track.style.transition = 'none';
        track.style.transform = 'translateX(0)';
      }
      posRef.current = 0;
      lockRef.current = false;
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const advance = useCallback(() => {
    if (lockRef.current || cardWidth === null || N === 0) return;
    lockRef.current = true;
    const track = trackRef.current;
    if (!track) { lockRef.current = false; return; }

    const step = cardWidth + 24;
    const next = posRef.current + 1;

    track.style.transition = 'transform 0.45s cubic-bezier(0.4,0,0.2,1)';
    track.style.transform = `translateX(-${next * step}px)`;
    posRef.current = next;

    if (next >= N) {
      setTimeout(() => {
        track.style.transition = 'none';
        posRef.current = 0;
        track.style.transform = 'translateX(0)';
        track.getBoundingClientRect(); // force reflow before re-enabling transition
        lockRef.current = false;
      }, 460);
    } else {
      setTimeout(() => { lockRef.current = false; }, 460);
    }
  }, [cardWidth, N]);

  if (N === 0) return null;

  return (
    <div style={{ position: 'relative' }}>
      {/* overflow:hidden lives here so the button is never clipped */}
      <div ref={containerRef} style={{ overflow: 'hidden' }}>
        <div ref={trackRef} style={{ display: 'flex', gap: '1.5rem' }}>
          {extended.map((collab, i) => (
            <div
              key={`${collab.slug}-${i}`}
              style={{ flexShrink: 0, width: cardWidth !== null ? cardWidth : 'calc(25% - 1.125rem)' }}
            >
              <CollabCard collab={collab} />
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={advance}
        aria-label="Próxima colaboração"
        className="absolute right-0 top-1/3 -translate-y-1/2 z-10 flex items-center justify-center transition-opacity duration-300 hover:opacity-80"
        style={{ width: 40, height: 40, background: 'rgba(0,0,0,0.6)', color: '#f4edd2', backdropFilter: 'blur(4px)', flexShrink: 0 }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
});

CollabCarousel.displayName = 'CollabCarousel';

/* ────────────────────────────────────────────────────────────── */
const HomeSections = () => {
  const { addItem } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: descubraSection } = useSiteContent('home', 'descubra_novos_aromas');
  const { data: faqItems } = useSiteContentList('home', 'faq', 'perguntas');
  const { data: focusSlots } = useSiteContentList('home', 'produto_foco', 'slots');
  // Bestsellers vem de um fetch separado de getProducts. Sem incluir
  // bestsellers.length nas deps, a secao monta DEPOIS que loading virou
  // false e seus .reveal nunca recebem .revealed (somem).
  const ref = useReveal(0.15, [loading, bestsellers.length]);

  useEffect(() => {
    getProducts()
      .then(setAllProducts)
      .finally(() => setLoading(false));
    getCollections().then(setAllCollections).catch(() => {});
  }, []);

  useEffect(() => {
    getBestsellerProducts()
      .then(setBestsellers)
      .catch(err => console.error('[HomeSections] bestsellers load failed', err));
  }, []);

  // Coleção do "Descubra novos aromas" — vem do site_content (FK), fallback Refúgio.
  const descubraColecaoSlug = useMemo(() => {
    const refId = descubraSection?.['colecao_ref']?.value_ref_id;
    if (refId) {
      const col = allCollections.find((c) => c.id === refId);
      if (col) return col.slug;
    }
    return 'refugio';
  }, [descubraSection, allCollections]);

  const refugio = useMemo(() => allProducts
    .filter((p) =>
      p.collection_slug === descubraColecaoSlug ||
      (descubraColecaoSlug === 'refugio' && p.collection?.toLowerCase().includes('ref'))
    )
    .slice(0, 4), [allProducts, descubraColecaoSlug]);

  /* Slots vêm do site_content; fallback para Bosque+Pomar hardcoded. */
  const focusItems = useMemo(() => {
    const slots = (focusSlots ?? []).filter((s) => s.is_visible);
    if (slots.length > 0) {
      return slots.map((slot) => {
        const productId = slot.fields?.produto_id as string | undefined;
        const videoSrc = (slot.fields?.video_url as string | undefined) ?? '';
        const product = allProducts.find((p) => p.id === productId);
        return product ? { product, videoSrc } : null;
      }).filter((x): x is { product: Product; videoSrc: string } => x !== null);
    }
    // fallback estático
    const FALLBACK_SLOTS: Array<{ slug: string; videoSrc: string }> = [
      { slug: 'bosque', videoSrc: storageUrl('loie_vela_bosque_compress (1).mp4') },
      { slug: 'pomar',  videoSrc: storageUrl('LOIE.pomarOverdelivery.mp4') },
    ];
    return FALLBACK_SLOTS.map((slot, i) => {
      const product = allProducts.find((p) => p.slug === slot.slug) ?? allProducts[i];
      return product ? { product, videoSrc: slot.videoSrc } : null;
    }).filter((x): x is { product: Product; videoSrc: string } => x !== null);
  }, [focusSlots, allProducts]);

  return (
    <div ref={ref} style={{ background: '#fcf5e0' }}>
      {/* ── Degradê de transição hero → conteúdo ── */}
      <div
        style={{
          height: 'clamp(120px, 18vw, 240px)',
          background: 'linear-gradient(to bottom, #29241f 0%, #3a3228 20%, #6e6455 45%, #b5a890 70%, #e8e0cc 88%, #fcf5e0 100%)',
        }}
      />

      {/* ── 1. Mais pedidas — Carousel (consome is_bestseller + bestseller_sort_order) ── */}
      {bestsellers.length > 0 && (
      <section className="py-16 px-6 md:py-0 loi-section-lazy">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <EditableText
              pageKey="home"
              sectionKey="bestsellers"
              blockKey="eyebrow"
              defaultText="bestsellers"
              as="span"
              style={{
                fontFamily: "'Sackers Gothic Std', 'Sackers Gothic', sans-serif",
                fontWeight: 300,
                fontSize: '0.65rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(0,0,0,0.4)',
                display: 'block',
                marginBottom: '0.4rem',
              }}
            />
            <EditableText
              pageKey="home"
              sectionKey="bestsellers"
              blockKey="titulo"
              defaultText="mais pedidas"
              as="h2"
              defaultClass="reveal heading-display"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#000' }}
            />
          </div>
          <div className="reveal">
            <ProductCarousel products={bestsellers} addItem={addItem} />
          </div>
        </div>
      </section>
      )}

      {/* ── Separador cream → cream (sutil) ── */}
      <div style={{ height: 'clamp(40px, 6vw, 80px)', background: '#f4edd2' }} />

      {/* ── 2. Banner de Produto Foco — slots iteráveis ── */}
      <section style={{ background: '#f4edd2' }} className="loi-section-lazy">
        {loading ? (
          <div style={{ minHeight: '50vh', background: '#f4edd2' }} />
        ) : (
          focusItems.map((slot, i) => (
            <div className="relative" key={slot.product.id}>
              <ProductFocusBanner
                product={slot.product}
                videoSrc={slot.videoSrc}
                reverse={i % 2 === 1}
                dark
              />
            </div>
          ))
        )}
      </section>

      {/* ── Separador cream → cream (sutil) ── */}
      <div style={{ height: 'clamp(40px, 6vw, 80px)', background: '#f4edd2' }} />

      {/* ── 3. Descubra Novos Aromas — Carousel ── */}
      <section className="py-16 md:py-20 px-6 loi-section-lazy">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <EditableText
              pageKey="home"
              sectionKey="descubra_novos_aromas"
              blockKey="titulo"
              defaultText="Descubra novos aromas"
              as="h2"
              defaultClass="reveal"
              style={{ fontFamily: "'Sackers Gothic', sans-serif", fontWeight: 300, letterSpacing: '0.2em', fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: '#000' }}
            />
          </div>
          <div className="reveal">
            <ProductCarousel products={refugio} addItem={addItem} />
          </div>
          <div className="reveal text-center mt-10">
            <Link to={`/colecoes/${descubraColecaoSlug}`}>
              <ArrowLink>{readBlockText(descubraSection, 'cta', 'ver toda a coleção')}</ArrowLink>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. Collabs — Grid animado ── */}
      <section className="py-16 px-6 md:py-[5px] loi-section-lazy" style={{ background: '#f4edd2' }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <EditableText
              pageKey="home"
              sectionKey="colaboracoes"
              blockKey="eyebrow"
              defaultText="collabs"
              as="span"
              style={{
                fontFamily: "'Sackers Gothic Std', 'Sackers Gothic', sans-serif",
                fontWeight: 300,
                fontSize: '0.65rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(0,0,0,0.4)',
                display: 'block',
                marginBottom: '0.4rem',
              }}
            />
            <EditableText
              pageKey="home"
              sectionKey="colaboracoes"
              blockKey="titulo"
              defaultText="Colaborações"
              as="h2"
              defaultClass="reveal"
              style={{ fontFamily: "'Sackers Gothic', sans-serif", fontWeight: 300, letterSpacing: '0.2em', fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: '#000' }}
            />
          </div>
          <CollabCarousel />
          <div className="reveal text-center mt-10">
            <Link to="/collabs">
              <ArrowLink><EditableText pageKey="home" sectionKey="colaboracoes" blockKey="cta" defaultText="ver todas as colaborações" /></ArrowLink>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. FAQ Section ── */}
      <section className="py-16 md:py-20 px-6 loi-section-lazy">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <EditableText
              pageKey="home"
              sectionKey="faq"
              blockKey="eyebrow"
              defaultText="dúvidas"
              as="span"
              defaultClass="reveal loi-label block mb-4"
              style={{ color: '#29241f' }}
            />
            <EditableText
              pageKey="home"
              sectionKey="faq"
              blockKey="titulo"
              defaultText="Perguntas frequentes"
              as="h2"
              defaultClass="reveal"
              style={{ fontFamily: "'Sackers Gothic', sans-serif", fontWeight: 300, letterSpacing: '0.2em', fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: '#29241f' }}
            />
          </div>
          <div className="reveal space-y-0">
            {(faqItems && faqItems.length > 0
              ? faqItems
                  .filter((it) => it.is_visible)
                  .map((it) => ({
                    q: (it.fields?.pergunta as string | undefined) ?? '',
                    a: (it.fields?.resposta as string | undefined) ?? '',
                  }))
              : []
            ).map((faq, i) => (
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

    </div>
  );
};

export default HomeSections;
