import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { getProducts } from '@/lib/api';
import type { Product } from '@/types';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useReveal } from '@/hooks/useReveal';

const collections = ['Todas', 'Cítricos', 'Amadeirados', 'Herbais', 'Orientais', 'Gourmand'];
const sortOptions = [
  { value: 'bestsellers', label: 'Mais vendidos' },
  { value: 'newest', label: 'Novidades' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
];

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState(searchParams.get('collection') || 'Todas');
  const [sort, setSort] = useState(searchParams.get('sort') || 'bestsellers');
  const { addItem } = useCart();
  const ref = useReveal();

  useEffect(() => {
    setLoading(true);
    getProducts({ collection: collection === 'Todas' ? undefined : collection, sort })
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [collection, sort]);

  const filtered = useMemo(() => {
    let result = [...products];
    if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
    if (sort === 'newest') result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (sort === 'bestsellers') result.sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0));
    return result;
  }, [products, sort]);

  return (
    <Layout>
      <div ref={ref}>
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <span className="loi-label block mb-4">coleção</span>
              <h1
                className="heading-display"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#29241f' }}
              >
                Nossas Fragrâncias
              </h1>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div className="flex flex-wrap gap-2">
                {collections.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCollection(c)}
                    style={{
                      padding: '6px 16px',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 300,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      fontSize: '0.68rem',
                      border: '1px solid',
                      borderColor: collection === c ? '#565600' : 'rgba(86,86,0,0.2)',
                      background: collection === c ? 'rgba(86,86,0,0.12)' : 'transparent',
                      color: '#29241f',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{
                  background: 'rgba(41,36,31,0.04)',
                  border: '1px solid rgba(86,86,0,0.2)',
                  color: '#29241f',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 300,
                  fontSize: '0.75rem',
                  padding: '8px 12px',
                  letterSpacing: '0.1em',
                }}
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i}>
                    <div className="aspect-[3/4] mb-4" style={{ background: 'rgba(41,36,31,0.05)' }} />
                    <div className="h-4 w-3/4 mb-2" style={{ background: 'rgba(41,36,31,0.05)' }} />
                    <div className="h-3 w-1/2" style={{ background: 'rgba(41,36,31,0.05)' }} />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p style={{ color: '#29241f', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
                  Nenhum produto encontrado.
                </p>
              </div>
            ) : (
              <div className="reveal-stagger grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {filtered.map((product) => (
                  <div key={product.id} className="reveal group">
                    <Link to={`/product/${product.slug}`} className="block relative overflow-hidden aspect-[3/4] mb-4">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        style={{ filter: 'saturate(0.85) brightness(0.9)' }}
                        loading="lazy"
                      />
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ background: 'linear-gradient(to top, rgba(41,36,31,0.7) 0%, transparent 50%)' }}
                      />
                      {product.badge && (
                        <span
                          className="absolute top-3 left-3"
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontWeight: 300,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            fontSize: '0.6rem',
                            color: '#f4edd2',
                            background: 'rgba(41,36,31,0.7)',
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
                          fontFamily: "'Montserrat', sans-serif",
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
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: '1.1rem', color: '#29241f', marginBottom: 4 }}>
                        {product.name}
                      </h3>
                      <p
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontWeight: 300,
                          fontStyle: 'italic',
                          fontSize: '0.82rem',
                          color: '#29241f',
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
                        <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: '#565600' }}>
                          R$ {product.price.toFixed(2)}
                        </span>
                        {product.compare_at_price && (
                          <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.7rem', color: '#29241f', textDecoration: 'line-through' }}>
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

export default Shop;
