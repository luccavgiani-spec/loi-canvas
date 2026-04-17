import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useReveal } from '@/hooks/useReveal';

const SUPABASE_STORAGE_URL =
  'https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/produtos';

const fileToUrl = (filename: string) =>
  `${SUPABASE_STORAGE_URL}/${encodeURIComponent(filename)}`;

const mapRowToProduct = (row: any): Product => ({
  id: row.id,
  collection_id: row.collection_id,
  collection: row.collections?.name ?? '',
  collection_slug: row.collections?.slug ?? '',
  slug: row.slug,
  name: row.name,
  sku: row.sku ?? '',
  price: Number(row.price),
  weight_g: row.weight_g ?? null,
  burn_hours: row.burn_hours ?? null,
  accord: row.accord ?? '',
  description: row.description ?? '',
  details: row.details ?? undefined,
  suggested_use: row.suggested_use ?? '',
  composition: row.composition ?? '',
  notes: row.notes ?? '',
  ritual: row.ritual ?? '',
  is_bestseller: row.is_bestseller ?? false,
  images: (row.product_images as { filename: string; sort_order: number }[] | null | undefined ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => fileToUrl(img.filename)),
  tags: [],
  rating_avg: 0,
  rating_count: 0,
  created_at: row.created_at || '',
});

const sortOptions = [
  { value: 'default', label: 'Destaque' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'name_asc', label: 'A–Z' },
];

const BorrifadoresPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState('default');
  const { addItem } = useCart();
  const ref = useReveal(0.15, [loading]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { data: col, error: colError } = await supabase
          .from('collections')
          .select('id')
          .eq('slug', 'borrifadores')
          .single();
        if (colError || !col) throw colError || new Error('Coleção borrifadores não encontrada');

        const { data, error: prodError } = await (supabase
          .from('products')
          .select('*, collections(name, slug), product_images(filename, sort_order)') as any)
          .eq('collection_id', col.id)
          .eq('visible', true)
          .order('created_at', { ascending: false });
        if (prodError) throw prodError;

        if (!cancelled) setProducts(((data as any[]) || []).map(mapRowToProduct));
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Erro ao carregar produtos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = useMemo(() => {
    const result = [...products];
    if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
    if (sort === 'name_asc') result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, sort]);

  if (error) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-base">{error}</p>
      </div>
    </Layout>
  );

  if (loading) return (
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
      <div ref={ref}>
        {/* Hero */}
        <section className="relative overflow-hidden" style={{ background: '#afc4e2' }}>
          <div className="relative z-10 max-w-[1400px] mx-auto px-6 pt-32 pb-16 md:pt-40 md:pb-24">
            <div className="max-w-2xl">
              <h1
                className="reveal-fade heading-display"
                style={{
                  fontFamily: "'Wagon', sans-serif",
                  fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                  color: '#29241f',
                  lineHeight: 1.1,
                  textTransform: 'none',
                }}
              >
                Borrifadores
              </h1>
            </div>
          </div>
        </section>

        {/* Produtos */}
        <section className="py-24 md:py-32 px-6" style={{ background: '#fcf5e0' }}>
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
                  Nenhum produto disponível.
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
                      <h3 style={{ fontFamily: "'Wagon', sans-serif", fontWeight: 400, fontSize: '1.1rem', color: '#000', marginBottom: 4, textTransform: 'none' }}>
                        {product.name}
                      </h3>
                      {product.notes && (
                        <p
                          style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: 300,
                            fontSize: '0.72rem',
                            color: 'rgba(0,0,0,0.5)',
                            lineHeight: 1.6,
                            marginBottom: 8,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {product.notes}
                        </p>
                      )}
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
