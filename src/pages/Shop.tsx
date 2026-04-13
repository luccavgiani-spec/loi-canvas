import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { getProducts, getCollections } from '@/lib/api';
import type { Product, Collection } from '@/types';
import { useReveal } from '@/hooks/useReveal';
import { useCart } from '@/contexts/CartContext';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { storageUrl, bannerUrl } from '@/lib/storage';


/* ── Horizontal carousel with snap scrolling ── */
const ProductCarousel = ({
  products,
  addItem



}: {products: Product[];addItem: (p: Product) => void;}) => {
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
    // Scroll by the width of one card + gap
    const card = el.querySelector('[data-carousel-item]') as HTMLElement | null;
    const distance = card ? card.offsetWidth + 16 : el.clientWidth * 0.5;
    el.scrollBy({ left: dir === 'left' ? -distance : distance, behavior: 'smooth' });
  };

  return (
    <div className="relative group/carousel">
      {/* Navigation arrows */}
      {canScrollLeft &&
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/3 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.6)',
          color: '#f4edd2',
          backdropFilter: 'blur(4px)'
        }}
        aria-label="Anterior">
        
          <ChevronLeft size={18} />
        </button>
      }
      {canScrollRight &&
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/3 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.6)',
          color: '#f4edd2',
          backdropFilter: 'blur(4px)'
        }}
        aria-label="Próximo">
        
          <ChevronRight size={18} />
        </button>
      }

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
        
        {products.map((product) =>
        <div
          key={product.id}
          data-carousel-item
          className="group flex-shrink-0 snap-start">
          
            <Link to={`/product/${product.slug}`} className="block relative overflow-hidden aspect-[3/4] mb-4">
              {product.images[0] ?
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy" /> :
            <div className="w-full h-full" style={{ backgroundColor: '#f4edd2' }} />
            }
              <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
            
              {product.badge &&
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
                backdropFilter: 'blur(4px)'
              }}>
              
                  {product.badge === 'sale' ? 'Promoção' : product.badge === 'new' ? 'Novo' : 'Edição Limitada'}
                </span>
            }
              <button
              onClick={(e) => {e.preventDefault();addItem(product);}}
              className="absolute bottom-0 left-0 right-0 py-3 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300"
              style={{
                background: 'rgba(86,86,0,0.9)',
                color: '#f4edd2',
                fontFamily: "var(--font-body)",
                fontWeight: 300,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontSize: '0.65rem'
              }}>
              
                adicionar ao carrinho
              </button>
            </Link>
            <Link to={`/product/${product.slug}`} className="block">
              <h3 style={{ fontFamily: "'Wagon', sans-serif", fontWeight: 400, fontSize: '1.1rem', color: '#000', marginBottom: 4 }}>
                {product.name}
              </h3>
              <p
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 300,
                fontSize: '0.82rem',
                color: 'rgba(0,0,0,0.55)',
                lineHeight: 1.5,
                marginBottom: 8,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>

                {product.description}
              </p>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 300, fontSize: '0.8rem', color: '#000' }}>
                R$ {product.price.toFixed(2)}
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Scroll indicator dots */}
      {products.length > 4 &&
      <div className="flex justify-center gap-1.5 mt-6 md:hidden">
          {Array.from({ length: Math.ceil(products.length / 2) }).map((_, i) =>
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.15)' }} />

        )}
        </div>
      }
    </div>);

};

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const ref = useReveal(0.15, [loading]);

  useEffect(() => {
    Promise.all([getProducts(), getCollections()])
      .then(([prods, cols]) => {
        setProducts(prods);
        setCollections(cols);
      })
      .finally(() => setLoading(false));
  }, []);

  const getCollectionProducts = (name: string) =>
  products.filter((p) => p.collection === name);

  return (
    <Layout>
      <div ref={ref}>
        {/* Hero */}
        <section
          className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 overflow-hidden"
          style={{ background: '#29241f' }}>

          {/* Background image */}
          <img
            src={bannerUrl('banners (6).webp')}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'saturate(0.5) brightness(0.35) contrast(1.05)' }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 65% 70% at 50% 50%, rgba(41,36,31,0.05) 0%, rgba(41,36,31,0.55) 100%),
                linear-gradient(to bottom, rgba(41,36,31,0.65) 0%, rgba(41,36,31,0.00) 30%, rgba(41,36,31,0.00) 70%, rgba(41,36,31,0.70) 100%)
              `,
            }}
          />

          <div className="max-w-[1400px] mx-auto relative z-10 text-center">
            <span
              className="reveal-fade inline-block mb-6"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 300,
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                fontSize: '0.6rem',
                color: 'rgba(244,237,210,0.35)'
              }}>
              
              nossas coleções
            </span>
            <h1
              className="reveal-fade heading-display mb-6"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                color: '#f4edd2',
                lineHeight: 1.1
              }}>
              
              cada aroma é uma narrativa
            </h1>
            <p
              className="reveal-fade max-w-xl mx-auto"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 300,
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: 'rgba(244,237,210,0.5)',
                lineHeight: 1.8
              }}>

              quatro atos. cada coleção uma proposta de aroma, presença e permanência — pensada para habitar os seus ambientes com intenção.
            </p>
          </div>
        </section>

        {/* Collection sections */}
        {collections.map((col, idx) => {
          const colProducts = getCollectionProducts(col.name);
          const isEven = idx % 2 === 0;

          return (
            <section
              key={col.id}
              className="reveal md:py-40 px-6 py-14"
              style={{
                background: isEven ? '#fcf5e0' : '#f5ecd0'
              }}>
              
              <div className="max-w-[1400px] mx-auto">
                {/* Collection header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                  <div>
                    <span
                      style={{
                        fontFamily: "'Wagon', sans-serif",
                        fontWeight: 300,
                        fontSize: '1rem',
                        color: 'rgba(0,0,0,0.35)',
                        display: 'block',
                        marginBottom: 8
                      }}>
                      
                      {col.numeral}
                    </span>
                    <h2
                      className="heading-display"
                      style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        color: '#000',
                        marginBottom: 8
                      }}>
                      
                      {col.name}
                    </h2>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 300,
                        fontSize: '0.85rem',
                        color: 'rgba(0,0,0,0.55)',
                        lineHeight: 1.7,
                        maxWidth: 500
                      }}>

                      {col.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 300,
                        letterSpacing: '0.1em',
                        fontSize: '0.75rem',
                        color: '#000'
                      }}>
                      
                      {col.price_label}
                    </span>
                  </div>
                </div>

                {/* Products carousel */}
                {loading ?
                <div className="flex gap-4 md:gap-6">
                    {Array.from({ length: 4 }).map((_, i) =>
                  <div key={i} className="flex-shrink-0" style={{ width: 'calc(50% - 8px)' }}>
                        <div className="aspect-[3/4] mb-4" style={{ background: 'rgba(0,0,0,0.05)' }} />
                        <div className="h-4 w-3/4 mb-2" style={{ background: 'rgba(0,0,0,0.05)' }} />
                        <div className="h-3 w-1/2" style={{ background: 'rgba(0,0,0,0.05)' }} />
                      </div>
                  )}
                  </div> :

                <ProductCarousel products={colProducts} addItem={addItem} />
                }

                {/* View collection link */}
                <div className="mt-10 text-center">
                  <Link
                    to={`/colecoes/${col.slug}`}
                    className="inline-flex items-center gap-2 group/link"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 300,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      color: '#000',
                      textDecoration: 'none',
                      transition: 'gap 0.3s ease'
                    }}>
                    
                    ver coleção completa
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>
            </section>);

        })}
      </div>
    </Layout>);

};

export default Shop;