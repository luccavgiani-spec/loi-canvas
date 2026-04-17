import { useState, useEffect, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { getProductsByCollectionSlug } from '@/lib/api';
import type { Product, Collection } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useReveal } from '@/hooks/useReveal';

const sortOptions = [
  { value: 'default', label: 'Destaque' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'name_asc', label: 'A–Z' },
];

const BorrifadoresPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [sort, setSort] = useState('default');
  const { addItem } = useCart();
  const ref = useReveal(0.15, [loading]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setNotFound(false);

    getProductsByCollectionSlug('borrifadores')
      .then((result) => {
        if (!result.collection) {
          setNotFound(true);
          return;
        }
        setCollection(result.collection);
        setProducts(result.products);
      })
      .catch((err) => {
        setError(err.message || 'Erro ao carregar coleção');
      })
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => {
    const result = [...products];
    if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
    if (sort === 'name_asc') result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, sort]);

  if (notFound && !loading) return <Navigate to="/" replace />;

  if (error) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-base">{error}</p>
      </div>
    </Layout>
  );

  if (loading || !collection) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ fontFamily: "var(--font-body)", fontWeight: 300, color: 'rgba(0,0,0,0.5)' }}>
          Carregando...
        </p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div ref={ref} style={{ textTransform: 'uppercase' }}>
        {/* Hero */}
        <section className="relative overflow-hidden" style={{ background: '#afc4e2' }}>
          {collection.cover_image && (
            <div className="absolute inset-0">
              <img
                src={collection.cover_image}
                alt=""
                className="w-full h-full object-cover"
                style={{ opacity: 0.2, filter: 'saturate(0.5) brightness(0.6)' }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(175,196,226,0.4) 0%, rgba(175,196,226,0.95) 100%)' }} />
            </div>
          )}

          <div className="relative z-10 max-w-[1400px] mx-auto px-6 pt-32 pb-16 md:pt-40 md:pb-24">
            <div className="max-w-2xl">
              <span
                className="reveal-fade block mb-4"
                style={{
                  fontFamily: "'Wagon', sans-serif",
                  fontWeight: 300,
                  fontSize: '1.1rem',
                  color: 'rgba(41,36,31,0.4)',
                }}
              >
                {collection.numeral}
              </span>
              <h1
                className="reveal-fade heading-display mb-5"
                style={{
                  fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                  color: '#29241f',
                  lineHeight: 1.1,
                }}
              >
                {collection.name}
              </h1>
              <p
                className="reveal-fade mb-6"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 300,
                  fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                  color: 'rgba(41,36,31,0.65)',
                  lineHeight: 1.8,
                }}
              >
                {collection.story}
              </p>
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
            {sorted.length === 0 ? (
              <div className="min-h-[40vh] flex items-center justify-center">
                <p style={{ fontFamily: "var(--font-body)", fontWeight: 300, color: 'rgba(0,0,0,0.5)' }}>
                  Nenhum produto nesta coleção ainda.
                </p>
              </div>
            ) : (
              <div className="reveal-stagger grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {sorted.map((product) => (
                  <div key={product.id} className="reveal group">
                    <Link to={`/product/${product.slug}`} className="block relative overflow-hidden aspect-[3/4] mb-4">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: '#f4edd2' }} />
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
      </div>
    </Layout>
  );
};

export default BorrifadoresPage;
