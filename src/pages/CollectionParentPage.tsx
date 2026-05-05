import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import type { Collection } from '@/types';
import { useReveal } from '@/hooks/useReveal';

interface Props {
  parentSlug: 'velas' | 'borrifadores' | 'corpo';
}

const CollectionParentPage = ({ parentSlug }: Props) => {
  const [parent, setParent] = useState<Collection | null>(null);
  const [children, setChildren] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

        if (!cancelled) {
          setParent(parentRow as Collection);
          setChildren((childRows ?? []) as Collection[]);
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

  const hasDescription = !!(parent.description && parent.description.trim().length > 0);

  return (
    <Layout>
      <div ref={ref}>
        {/* Hero — espelha BorrifadoresPage.tsx:124-141 */}
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

        {/* Cards de coleções-filhas */}
        <section className="py-24 md:py-32 px-6" style={{ background: '#fcf5e0' }}>
          <div className="max-w-[1400px] mx-auto">
            {children.length === 0 ? (
              <div className="min-h-[40vh] flex items-center justify-center">
                <p style={{ fontFamily: "var(--font-body)", fontWeight: 300, color: 'rgba(0,0,0,0.5)' }}>
                  Nenhuma coleção disponível.
                </p>
              </div>
            ) : (
              <div className="reveal-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children.map((child) => (
                  <Link
                    key={child.id}
                    to={`/colecoes/${child.slug}`}
                    className="reveal group relative overflow-hidden block"
                    style={{ aspectRatio: '4/3' }}
                  >
                    {child.cover_image ? (
                      <img
                        src={child.cover_image}
                        alt={child.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        style={{ filter: 'saturate(0.7) brightness(0.5)' }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0" style={{ backgroundColor: '#29241f' }} />
                    )}
                    <div
                      className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-80"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%)', opacity: 0.7 }}
                    />
                    <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
                      {child.numeral && (
                        <span
                          style={{
                            fontFamily: "'Wagon', sans-serif",
                            fontWeight: 300,
                            fontSize: '0.85rem',
                            color: 'rgba(244,237,210,0.4)',
                            marginBottom: 4,
                          }}
                        >
                          {child.numeral}
                        </span>
                      )}
                      <h3
                        className="heading-display"
                        style={{
                          fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                          color: '#f4edd2',
                          marginBottom: 4,
                        }}
                      >
                        {child.name}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default CollectionParentPage;
