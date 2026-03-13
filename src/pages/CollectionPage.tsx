import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { getProducts, getCollections } from '@/lib/api';
import type { Product, Collection } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useReveal } from '@/hooks/useReveal';
import { ArrowLeft } from 'lucide-react';


const sortOptions = [
  { value: 'default', label: 'Destaque' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'name_asc', label: 'A–Z' },
];

const CollectionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('default');
  const { addItem } = useCart();
  const ref = useReveal(0.15, [loading]);

  useEffect(() => {
    getCollections().then(setAllCollections);
  }, []);

  const collection = allCollections.find(c => c.slug === slug);

  useEffect(() => {
    if (!collection) return;
    setLoading(true);
    getProducts({ collection: collection.name })
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [collection]);

  const sorted = useMemo(() => {
    const result = [...products];
    if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
    if (sort === 'name_asc') result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, sort]);

  if (allCollections.length > 0 && !collection) return <Navigate to="/shop" replace />;
  if (!collection) return <Layout><div className="py-40 text-center"><p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'rgba(0,0,0,0.4)' }}>Carregando...</p></div></Layout>;

  const otherCollections = allCollections.filter(c => c.slug !== slug && c.is_active);

  return (
    <Layout>
      <div ref={ref}>
        {/* Hero */}
        <section className="relative overflow-hidden" style={{ background: '#29241f' }}>
          {collection.cover_image && (
            <div className="absolute inset-0">
              <img
                src={collection.cover_image}
                alt=""
                className="w-full h-full object-cover"
                style={{ opacity: 0.2, filter: 'saturate(0.5) brightness(0.6)' }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(41,36,31,0.4) 0%, rgba(41,36,31,0.95) 100%)' }} />
            </div>
          )}

          <div className="relative z-10 max-w-[1400px] mx-auto px-6 pt-32 pb-16 md:pt-40 md:pb-24">
            <Link
              to="/shop"
              className="reveal-fade inline-flex items-center gap-2 mb-10 group/back"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 300,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontSize: '0.65rem',
                color: 'rgba(244,237,210,0.4)',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
              }}
            >
              <ArrowLeft size={14} className="transition-transform duration-300 group-hover/back:-translate-x-1" />
              todas as coleções
            </Link>

            <div className="max-w-2xl">
              <span
                className="reveal-fade block mb-4"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 300,
                  fontStyle: 'italic',
                  fontSize: '1.1rem',
                  color: 'rgba(244,237,210,0.35)',
                }}
              >
                {collection.numeral}
              </span>
              <h1
                className="reveal-fade heading-display mb-5"
                style={{
                  fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                  color: '#f4edd2',
                  lineHeight: 1.1,
                }}
              >
                {collection.name}
              </h1>
              <p
                className="reveal-fade mb-6"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 300,
                  fontStyle: 'italic',
                  fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                  color: 'rgba(244,237,210,0.55)',
                  lineHeight: 1.8,
                }}
              >
                {collection.story}
              </p>
              <span
                className="reveal-fade"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 300,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontSize: '0.62rem',
                  color: 'rgba(244,237,210,0.3)',
                }}
              >
                {collection.detail}
              </span>
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="py-24 md:py-40 px-6" style={{ background: '#fcf5e0' }}>
          <div className="max-w-[1400px] mx-auto">
            {/* Sort */}
            <div className="flex justify-between items-center mb-12">
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 300,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontSize: '0.65rem',
                  color: 'rgba(0,0,0,0.4)',
                }}
              >
                {sorted.length} {sorted.length === 1 ? 'produto' : 'produtos'}
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0,0,0,0.12)',
                  color: '#000',
                  fontFamily: "var(--font-body)",
                  fontWeight: 300,
                  fontSize: '0.72rem',
                  padding: '8px 12px',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                }}
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <div className="aspect-[3/4] mb-4" style={{ background: 'rgba(0,0,0,0.05)' }} />
                    <div className="h-4 w-3/4 mb-2" style={{ background: 'rgba(0,0,0,0.05)' }} />
                    <div className="h-3 w-1/2" style={{ background: 'rgba(0,0,0,0.05)' }} />
                  </div>
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-20">
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontStyle: 'italic', color: 'rgba(0,0,0,0.5)' }}>
                  Nenhum produto encontrado nesta coleção.
                </p>
              </div>
            ) : (
              <div className="reveal-stagger grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {sorted.map((product) => (
                  <div key={product.id} className="reveal group">
                    <Link to={`/product/${product.slug}`} className="block relative overflow-hidden aspect-[3/4] mb-4">
                      {product.images[0]?.match(/\.mp4$/i) ? (
                        <video
                          src={product.images[0]}
                          muted
                          playsInline
                          autoPlay
                          loop
                          preload="none"
                          poster={product.images.find(s => !s.match(/\.mp4$/i))}
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
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }}
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
                        }}
                      >
                        adicionar ao carrinho
                      </button>
                    </Link>
                    <Link to={`/product/${product.slug}`} className="block">
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: '1.1rem', color: '#000', marginBottom: 4 }}>
                        {product.name}
                      </h3>
                      <p
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontWeight: 300,
                          fontStyle: 'italic',
                          fontSize: '0.82rem',
                          color: 'rgba(0,0,0,0.55)',
                          lineHeight: 1.5,
                          marginBottom: 8,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {product.description}
                      </p>
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
            )}
          </div>
        </section>

        {/* Other collections */}
        {otherCollections.length > 0 && (
          <section className="py-24 md:py-40 px-6" style={{ background: '#f5ecd0' }}>
            <div className="max-w-[1400px] mx-auto">
              <div className="text-center mb-14">
                <span
                  className="reveal-fade block mb-4"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 300,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    fontSize: '0.6rem',
                    color: 'rgba(0,0,0,0.35)',
                  }}
                >
                  explorar
                </span>
                <h2
                  className="reveal-fade heading-display"
                  style={{
                    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                    color: '#000',
                  }}
                >
                  Outras Coleções
                </h2>
              </div>
              <div className="reveal-stagger grid grid-cols-1 md:grid-cols-3 gap-6">
                {otherCollections.map((other) => {
                  return (
                    <Link
                      key={other.id}
                      to={`/shop/${other.slug}`}
                      className="reveal group relative overflow-hidden block"
                      style={{ aspectRatio: '4/3' }}
                    >
                      {other.cover_image && (
                        <img
                          src={other.cover_image}
                          alt={other.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          style={{ filter: 'saturate(0.7) brightness(0.5)' }}
                          loading="lazy"
                        />
                      )}
                      <div
                        className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-80"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%)', opacity: 0.7 }}
                      />
                      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
                        <span
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 300,
                            fontStyle: 'italic',
                            fontSize: '0.85rem',
                            color: 'rgba(244,237,210,0.4)',
                            marginBottom: 4,
                          }}
                        >
                          {other.numeral}
                        </span>
                        <h3
                          className="heading-display"
                          style={{
                            fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                            color: '#f4edd2',
                            marginBottom: 4,
                          }}
                        >
                          {other.name}
                        </h3>
                        <span
                          style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: 300,
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            fontSize: '0.6rem',
                            color: 'rgba(244,237,210,0.35)',
                          }}
                        >
                          {other.detail}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default CollectionPage;
