import { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/shop/ProductCard';
import { getProducts } from '@/lib/api';
import type { Product } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'react-router-dom';

const collections = ['Todas', 'Cítricos', 'Amadeirados', 'Herbais', 'Orientais', 'Gourmand'];
const sortOptions = [
  { value: 'bestsellers', label: 'Mais vendidos' },
  { value: 'newest', label: 'Novidades' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState(searchParams.get('collection') || 'Todas');
  const [sort, setSort] = useState(searchParams.get('sort') || 'bestsellers');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

  useEffect(() => {
    setLoading(true);
    getProducts({ collection: collection === 'Todas' ? undefined : collection, sort })
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [collection, sort]);

  const filtered = useMemo(() => {
    let result = [...products];
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
    if (sort === 'newest') result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (sort === 'bestsellers') result.sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0));
    return result;
  }, [products, sort, priceRange]);

  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="container">
          <h1 className="heading-display text-4xl md:text-5xl text-center mb-12">Shop</h1>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div className="flex flex-wrap gap-2">
              {collections.map(c => (
                <button
                  key={c}
                  onClick={() => setCollection(c)}
                  className={`px-4 py-1.5 text-xs uppercase tracking-wider rounded-full border transition-colors ${
                    collection === c
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="text-sm bg-background border border-border rounded px-3 py-1.5 text-foreground"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-square rounded mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p>Nenhum produto encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Shop;
