import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import type { Collection, Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useReveal } from '@/hooks/useReveal';

interface Props {
  parentSlug: 'velas' | 'borrifadores' | 'corpo';
}

const SUPABASE_STORAGE_URL =
  'https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/produtos';

const fileToUrl = (filename: string) =>
  `${SUPABASE_STORAGE_URL}/${encodeURIComponent(filename)}`;

const PREVIEW_SIZE = 4;

// Tipo mínimo dos produtos exibidos na prévia. Reusa o fluxo padrão
// (collection_id + product_images) — só não populamos os campos
// editoriais (description/notes/etc.), que não são usados na grid.
type PreviewProduct = Pick<Product, 'id' | 'slug' | 'name' | 'price' | 'images' | 'badge' | 'compare_at_price' | 'collection_id'>;

const mapRowToPreview = (row: any): PreviewProduct => ({
  id: row.id,
  collection_id: row.collection_id,
  slug: row.slug,
  name: row.name,
  price: Number(row.price),
  badge: row.badge ?? undefined,
  compare_at_price: row.compare_at_price ?? undefined,
  images: (row.product_images as { filename: string; sort_order: number }[] | null | undefined ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => fileToUrl(img.filename)),
});

const CollectionParentPage = ({ parentSlug }: Props) => {
  const [parent, setParent] = useState<Collection | null>(null);
  const [children, setChildren] = useState<Collection[]>([]);
  const [productsByCollection, setProductsByCollection] = useState<Map<string, PreviewProduct[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const ref = useReveal(0.15, [loading]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { data: parentRow, error: parentErr } = await supabase
          .from('collections')
          .select('*')
          .eq('slug', parentSlug)
          .maybeSingle();
        if (parentErr) throw parentErr;
        if (!parentRow) throw new Error('Coleção não encontrada');

        const { data: childRows, error: childrenErr } = await supabase
          .from('collections')
          .select('*')
          .eq('parent_collection_id', parentRow.id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        if (childrenErr) throw childrenErr;

        const childList = (childRows ?? []) as Collection[];

        // Single query agrupando produtos das filhas (evita N+1).
        let grouped = new Map<string, PreviewProduct[]>();
        if (childList.length > 0) {
          const childIds = childList.map((c) => c.id);
          const { data: productRows, error: prodErr } = await (supabase
            .from('products')
            .select('id, slug, name, price, collection_id, product_images(filename, sort_order)') as any)
            .in('collection_id', childIds)
            .eq('visible', true)
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false });
          if (prodErr) throw prodErr;

          for (const row of (productRows as any[]) ?? []) {
            const colId: string | null = row.collection_id;
            if (!colId) continue;
            const list = grouped.get(colId) ?? [];
            if (list.length < PREVIEW_SIZE) {
              list.push(mapRowToPreview(row));
              grouped.set(colId, list);
            }
          }
        }

        if (!cancelled) {
          setParent(parentRow as Collection);
          setChildren(childList);
          setProductsByCollection(grouped);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? 'Erro ao carregar coleção');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [parentSlug]);

  const hasDescription = useMemo(
    () => !!(parent?.description && parent.description.trim().length > 0),
    [parent],
  );

  if (error) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-base">{error}</p>
      </div>
    </Layout>
  );

  if (loading || !parent) return (
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
        {/* Hero — inalterado */}
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
                {parent.name}
              </h1>
              {hasDescription && (
                <p
                  className="reveal-fade mt-5"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 300,
                    fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                    color: 'rgba(41,36,31,0.65)',
                    lineHeight: 1.8,
                  }}
                >
                  {parent.description}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Sem coleções-filhas — mensagem mínima */}
        {children.length === 0 ? (
          <section className="py-24 md:py-32 px-6" style={{ background: '#fcf5e0' }}>
            <div className="max-w-[1400px] mx-auto min-h-[40vh] flex items-center justify-center">
              <p style={{ fontFamily: "var(--font-body)", fontWeight: 300, color: 'rgba(0,0,0,0.5)' }}>
                Nenhuma coleção disponível.
              </p>
            </div>
          </section>
        ) : (
          children.map((child, idx) => {
            const products = productsByCollection.get(child.id) ?? [];
            const isEven = idx % 2 === 0;
            return (
              <section
                key={child.id}
                className="reveal py-14 md:py-32 px-6"
                style={{ background: isEven ? '#fcf5e0' : '#f5ecd0' }}
              >
                <div className="max-w-[1400px] mx-auto">
                  {/* Header da coleção */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                      {child.numeral && (
                        <span
                          style={{
                            fontFamily: "'Wagon', sans-serif",
                            fontWeight: 300,
                            fontSize: '1rem',
                            color: 'rgba(0,0,0,0.35)',
                            display: 'block',
                            marginBottom: 8,
                          }}
                        >
                          {child.numeral}
                        </span>
                      )}
                      <h2
                        className="heading-display"
                        style={{
                          fontSize: 'clamp(2rem, 4vw, 3rem)',
                          color: '#000',
                          marginBottom: 8,
                        }}
                      >
                        {child.name}
                      </h2>
                      {child.description && (
                        <p
                          style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: 300,
                            fontSize: '0.85rem',
                            color: 'rgba(0,0,0,0.55)',
                            lineHeight: 1.7,
                            maxWidth: 500,
                          }}
                        >
                          {child.description}
                        </p>
                      )}
                    </div>
                    {child.price_label && (
                      <div className="flex flex-col items-start md:items-end gap-2">
                        <span
                          style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: 300,
                            letterSpacing: '0.1em',
                            fontSize: '0.75rem',
                            color: '#000',
                          }}
                        >
                          {child.price_label}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Grid de produtos (até 4) — inline igual CollectionPage leaf */}
                  {products.length > 0 ? (
                    <div className="reveal-stagger grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                      {products.map((product) => (
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
                              onClick={(e) => { e.preventDefault(); addItem(product as Product); }}
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
                            <div className="flex items-center gap-3">
                              <span style={{ fontFamily: "var(--font-body)", fontWeight: 300, fontSize: '0.8rem', color: '#000' }}>
                                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              {product.compare_at_price && (
                                <span style={{ fontFamily: "var(--font-body)", fontWeight: 300, fontSize: '0.7rem', color: 'rgba(0,0,0,0.4)', textDecoration: 'line-through' }}>
                                  R$ {product.compare_at_price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              )}
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 300,
                        fontSize: '0.85rem',
                        color: 'rgba(0,0,0,0.4)',
                        fontStyle: 'italic',
                      }}
                    >
                      em breve.
                    </p>
                  )}

                  {/* CTA */}
                  <div className="mt-10 text-center">
                    <Link
                      to={`/colecoes/${child.slug}`}
                      className="inline-flex items-center gap-2 group/link"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 300,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        fontSize: '0.7rem',
                        color: '#000',
                        textDecoration: 'none',
                      }}
                    >
                      ver coleção completa
                      <ArrowRight size={14} className="transition-transform duration-300 group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </section>
            );
          })
        )}
      </div>
    </Layout>
  );
};

export default CollectionParentPage;
