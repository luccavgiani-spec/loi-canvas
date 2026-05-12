import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { getProducts, getCollections } from '@/lib/api';
import { bannerUrl } from '@/lib/storage';
import type { Collection, Product } from '@/types';
import { useReveal } from '@/hooks/useReveal';
import { useCart } from '@/contexts/CartContext';
import {
  ProductFiltersSidebar,
  ProductFiltersMobile,
} from '@/components/produtos/ProductFilters';
import {
  applyFilters,
  buildCategoryMap,
  emptyFilters,
  filtersFromParams,
  getProductAvailability,
  writeFiltersToParams,
} from '@/lib/productFilters';
import ProductPriceTag from '@/components/shop/ProductPriceTag';

type SortKey = 'recent' | 'price_asc' | 'price_desc' | 'name_asc';

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'recent',     label: 'Mais recentes' },
  { value: 'price_asc',  label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'name_asc',   label: 'A–Z' },
];

const isSortKey = (v: string): v is SortKey =>
  v === 'recent' || v === 'price_asc' || v === 'price_desc' || v === 'name_asc';

const Produtos = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();
  const ref = useReveal(0.15, [loading]);

  const sortParam = searchParams.get('ordem') ?? '';
  const sort: SortKey = isSortKey(sortParam) ? sortParam : 'recent';

  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);

  useEffect(() => {
    setLoading(true);
    Promise.all([getProducts(), getCollections()])
      .then(([prods, cols]) => {
        setProducts(prods);
        setCollections(cols);
      })
      .finally(() => setLoading(false));
  }, []);

  const categoryMap = useMemo(() => buildCategoryMap(collections), [collections]);

  const visibleSorted = useMemo(() => {
    const filtered = applyFilters(products, filters, categoryMap);
    if (sort === 'price_asc')  filtered.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);
    if (sort === 'name_asc')   filtered.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    if (sort === 'recent') {
      filtered.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    }
    return filtered;
  }, [products, filters, categoryMap, sort]);

  const updateSort = (next: SortKey) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'recent') params.delete('ordem');
    else params.set('ordem', next);
    setSearchParams(params, { replace: true });
  };

  const updateFilters = (next: typeof filters) => {
    setSearchParams(writeFiltersToParams(searchParams, next), { replace: true });
  };

  return (
    <Layout>
      <div ref={ref}>
        {/* Hero */}
        <section
          className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 overflow-hidden"
          style={{ background: '#29241f' }}
        >
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
                color: 'rgba(244,237,210,0.35)',
              }}
            >
              produtos
            </span>
            <h1
              className="reveal-fade heading-display mb-6"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                color: '#f4edd2',
                lineHeight: 1.1,
              }}
            >
              todos os aromas
            </h1>
            <p
              className="reveal-fade max-w-xl mx-auto"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 300,
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: 'rgba(244,237,210,0.5)',
                lineHeight: 1.8,
              }}
            >
              o catálogo inteiro, em um só lugar. navegue, refine e encontre o aroma que habita o seu espaço.
            </p>
          </div>
        </section>

        {/* Sidebar + Grid */}
        <section className="py-14 md:py-20 px-6" style={{ background: '#fcf5e0' }}>
          <div className="max-w-[1400px] mx-auto lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
            <ProductFiltersSidebar
              products={products}
              collections={collections}
              filters={filters}
              onChange={updateFilters}
            />

            <div>
              {/* Toolbar */}
              <div className="flex justify-between items-center mb-10 md:mb-12 gap-4 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  <ProductFiltersMobile
                    products={products}
                    collections={collections}
                    filters={filters}
                    onChange={updateFilters}
                  />
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
                    {loading
                      ? 'carregando…'
                      : `${visibleSorted.length} ${visibleSorted.length === 1 ? 'produto' : 'produtos'}`}
                    {filters.busca && !loading && (
                      <span style={{ marginLeft: 8, color: 'rgba(0,0,0,0.6)' }}>
                        — busca: “{filters.busca}”
                      </span>
                    )}
                  </span>
                </div>

                <label className="flex items-center gap-2">
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 300,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      fontSize: '0.62rem',
                      color: 'rgba(0,0,0,0.45)',
                    }}
                  >
                    ordenar
                  </span>
                  <select
                    value={sort}
                    onChange={(e) => updateSort(e.target.value as SortKey)}
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
                </label>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i}>
                      <div className="aspect-[3/4] mb-4" style={{ background: 'rgba(0,0,0,0.05)' }} />
                      <div className="h-4 w-3/4 mb-2" style={{ background: 'rgba(0,0,0,0.05)' }} />
                      <div className="h-3 w-1/2" style={{ background: 'rgba(0,0,0,0.05)' }} />
                    </div>
                  ))}
                </div>
              ) : visibleSorted.length === 0 ? (
                <div className="min-h-[40vh] flex flex-col items-center justify-center text-center gap-4">
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 300,
                      fontSize: '0.95rem',
                      color: 'rgba(0,0,0,0.55)',
                    }}
                  >
                    {filters.busca
                      ? `nenhum produto encontrado para “${filters.busca}”.`
                      : 'nenhum produto corresponde aos filtros selecionados.'}
                  </p>
                  <button
                    onClick={() => updateFilters(emptyFilters)}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 300,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      fontSize: '0.65rem',
                      color: '#565600',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      textUnderlineOffset: '4px',
                    }}
                  >
                    limpar filtros
                  </button>
                </div>
              ) : (
                <div className="reveal-stagger grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                  {visibleSorted.map((product) => {
                    const availability = getProductAvailability(product);
                    const canAdd = availability === 'estoque';
                    return (
                      <div key={product.id} className="reveal group">
                        <Link to={`/product/${product.slug}`} className="block relative overflow-hidden aspect-[3/4] mb-4">
                          {product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="w-full h-full" style={{ backgroundColor: '#f4edd2' }} />
                          )}
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }}
                          />
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
                          <h3 style={{ fontFamily: "'Wagon', sans-serif", fontWeight: 400, fontSize: '1.1rem', color: '#000', marginBottom: 4 }}>
                            {product.name}
                          </h3>
                          {product.notes && (
                            <p
                              style={{
                                fontFamily: "var(--font-body)",
                                fontWeight: 300,
                                fontSize: '0.75rem',
                                color: 'rgba(0,0,0,0.7)',
                                lineHeight: 1.6,
                                marginBottom: 8,
                                textTransform: 'lowercase',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {product.notes}
                            </p>
                          )}
                          <ProductPriceTag product={product} />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Produtos;
