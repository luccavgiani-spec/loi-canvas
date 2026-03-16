import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { getOrderById, getRelatedProducts, getProducts } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { Loader2, Package } from 'lucide-react';
import type { Product } from '@/types';

const CHAR = '#29241f';
const OLIVA = '#565600';
const CREME = '#f4edd2';
const CREME_LIGHT = '#fcf5e0';

const SUPABASE_STORAGE_URL =
  'https://xigituxddrtsqhmrmsvy.supabase.co/storage/v1/object/public/produtos';

function buildThumbUrl(assetFolder: string | null | undefined): string {
  if (!assetFolder || typeof assetFolder !== 'string') return '';
  return `${SUPABASE_STORAGE_URL}/${assetFolder}_principal.JPG`;
}

const LABEL: React.CSSProperties = {
  fontFamily: "'Sackers Gothic', 'Cormorant Garamond', serif",
  fontSize: '0.6rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: `${CHAR}99`,
};

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const orderId = searchParams.get('order_id');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    if (!orderId) {
      navigate('/', { replace: true });
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const data = await getOrderById(orderId);
        if (!data || cancelled) {
          if (!cancelled) navigate('/', { replace: true });
          return;
        }
        setOrder(data);

        // Fetch related products
        const items = data.order_items || [];
        const firstProduct = items[0]?.product;
        let recs: Product[] = [];

        if (firstProduct) {
          recs = await getRelatedProducts(items[0].product_id);
        }

        // Fallback: get general products excluding order items
        if (recs.length === 0) {
          const all = await getProducts();
          const orderProductIds = new Set(items.map((i: any) => i.product_id));
          recs = all.filter(p => !orderProductIds.has(p.id)).slice(0, 4);
        }

        if (!cancelled) setRelated(recs.slice(0, 4));
      } catch {
        if (!cancelled) navigate('/', { replace: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [orderId, navigate]);

  if (loading) {
    return (
      <Layout>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: CREME_LIGHT }}>
          <Loader2 size={28} className="animate-spin" style={{ color: OLIVA }} />
        </div>
      </Layout>
    );
  }

  if (!order) return null;

  const items = order.order_items || [];
  const orderTotal = Number(order.total) || items.reduce((s: number, i: any) => s + Number(i.unit_price) * Number(i.qty), 0);

  return (
    <Layout>
      <div style={{ background: CREME_LIGHT, minHeight: '100vh' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(48px,8vw,96px) 24px' }}>

          {/* ── Section 1: Confirmation ── */}
          <section style={{ textAlign: 'center', marginBottom: 56 }}>
            {/* Animated check icon */}
            <div style={{ marginBottom: 24 }}>
              <svg
                width="56" height="56" viewBox="0 0 56 56" fill="none"
                style={{ animation: 'confirmCheck 0.6s ease-out forwards', opacity: 0, transform: 'scale(0.5)' }}
              >
                <circle cx="28" cy="28" r="27" stroke={OLIVA} strokeWidth="1.5" fill="none" />
                <path d="M17 28l7 7 15-15" stroke={OLIVA} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <style>{`
                @keyframes confirmCheck {
                  to { opacity: 1; transform: scale(1); }
                }
              `}</style>
            </div>

            <span style={{ ...LABEL, display: 'block', marginBottom: 14 }}>pedido confirmado</span>

            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(2rem,5vw,3rem)',
              fontWeight: 300,
              color: CHAR,
              margin: '0 0 20px',
              letterSpacing: '0.04em',
            }}>
              Obrigada pela sua compra
            </h1>

            <div style={{ width: 40, height: 1, background: `${OLIVA}55`, margin: '0 auto 20px' }} />

            <p style={{
              fontFamily: "'Sackers Gothic', 'Cormorant Garamond', serif",
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              color: CHAR,
              marginBottom: 10,
            }}>
              #{order.id.slice(0, 8).toUpperCase()}
            </p>

            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: '0.95rem',
              color: `${CHAR}77`,
              lineHeight: 1.6,
            }}>
              Você receberá a confirmação e atualizações no e-mail cadastrado.
            </p>
          </section>

          {/* ── Section 2: Order Summary ── */}
          <section style={{
            border: `1px solid ${CHAR}14`,
            padding: 28,
            marginBottom: 40,
            background: `${CREME}44`,
          }}>
            <span style={{ ...LABEL, display: 'block', marginBottom: 20 }}>seu pedido</span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {items.map((item: any, idx: number) => {
                const product = item.product;
                const thumb = buildThumbUrl(product?.asset_folder);
                const qty = Number(item.qty);
                const unitPrice = Number(item.unit_price);
                return (
                  <div key={idx} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={product?.name || ''}
                        style={{ width: 56, height: 56, objectFit: 'cover', filter: 'saturate(0.6)', background: CREME }}
                      />
                    ) : (
                      <div style={{ width: 56, height: 56, background: CREME }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '1rem',
                        color: CHAR,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {product?.name || 'Produto'}
                      </p>
                      <p style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 300,
                        fontSize: '0.7rem',
                        color: `${CHAR}55`,
                        margin: '2px 0 0',
                      }}>
                        {qty} × R$ {unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <span style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '0.95rem',
                      color: CHAR,
                      whiteSpace: 'nowrap',
                    }}>
                      R$ {(qty * unitPrice).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ borderTop: `1px solid ${CHAR}14`, marginTop: 20, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.05rem',
                color: CHAR,
              }}>
                Total
              </span>
              <span style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.2rem',
                fontWeight: 500,
                color: CHAR,
              }}>
                R$ {orderTotal.toFixed(2)}
              </span>
            </div>
          </section>

          {/* ── Section 3: Delivery ── */}
          <section style={{
            background: CREME,
            padding: 28,
            marginBottom: 40,
          }}>
            <span style={{ ...LABEL, display: 'block', marginBottom: 20 }}>entrega estimada</span>

            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
              <Package size={20} style={{ color: OLIVA, flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1rem',
                  color: CHAR,
                  margin: '0 0 8px',
                  lineHeight: 1.5,
                }}>
                  <strong>5 a 10 dias úteis</strong> após a confirmação do pagamento
                </p>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '0.9rem',
                  color: `${CHAR}77`,
                  margin: '0 0 12px',
                  lineHeight: 1.5,
                }}>
                  Você receberá o código de rastreamento por e-mail assim que o pedido for despachado.
                </p>
                <a
                  href="https://rastreamento.correios.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '0.85rem',
                    color: OLIVA,
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                  }}
                >
                  Acompanhe pelo site oficial dos Correios
                </a>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '0.8rem',
                  color: `${CHAR}55`,
                  margin: '8px 0 0',
                  lineHeight: 1.5,
                }}>
                  Ou acesse a seção 'Meus Pedidos' em nosso site quando disponível.
                </p>
              </div>
            </div>
          </section>

          {/* ── Section 4: Upsell ── */}
          {related.length > 0 && (
            <section style={{ marginBottom: 56 }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <span style={{ ...LABEL, display: 'block', marginBottom: 10 }}>você também pode gostar</span>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(1.4rem,3vw,2rem)',
                  fontWeight: 300,
                  color: CHAR,
                  margin: 0,
                }}>
                  Complete sua experiência
                </h2>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: 20,
              }}>
                {related.map(product => (
                  <div key={product.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{ aspectRatio: '1', overflow: 'hidden', background: CREME }}>
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.6)' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : null}
                      </div>
                    </Link>
                    <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
                      <p style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '0.95rem',
                        color: CHAR,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {product.name}
                      </p>
                    </Link>
                    <span style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '0.9rem',
                      color: `${CHAR}88`,
                    }}>
                      R$ {product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => addItem(product, 1)}
                      style={{
                        padding: '8px 12px',
                        background: 'transparent',
                        border: `1px solid ${CHAR}33`,
                        color: CHAR,
                        fontFamily: "'Sackers Gothic', 'Cormorant Garamond', serif",
                        fontSize: '0.5rem',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = CHAR; e.currentTarget.style.color = CREME; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = CHAR; }}
                    >
                      adicionar ao carrinho
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Section 5: CTA ── */}
          <section style={{ textAlign: 'center', paddingBottom: 40 }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '16px 40px',
                background: CHAR,
                color: CREME,
                border: 'none',
                fontFamily: "'Sackers Gothic', 'Cormorant Garamond', serif",
                fontSize: '0.6rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                marginBottom: 20,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              voltar à loja
            </button>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: '0.85rem',
              color: `${CHAR}55`,
            }}>
              loiê — sala aromática
            </p>
          </section>

        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;
