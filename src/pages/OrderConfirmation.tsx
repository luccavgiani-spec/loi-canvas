import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { getPublicOrderConfirmation, type PublicOrderConfirmation, type UpsellProduct } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { Loader2, Package } from 'lucide-react';
import type { Product } from '@/types';

const CHAR = '#29241f';
const OLIVA = '#565600';
const CREME = '#f4edd2';
const CREME_LIGHT = '#fcf5e0';

const LABEL: React.CSSProperties = {
  fontFamily: "'Sackers Gothic', 'Wagon', sans-serif",
  fontSize: '0.6rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: `${CHAR}99`,
};

const BODY_TEXT_FAMILY = "'Sackers Gothic', sans-serif";

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const orderId = searchParams.get('order_id');

  const [order, setOrder] = useState<PublicOrderConfirmation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate('/', { replace: true });
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const data = await getPublicOrderConfirmation(orderId);
        if (cancelled) return;
        setOrder(data);
      } catch {
        if (!cancelled) navigate('/', { replace: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [orderId, navigate]);

  // Bridge UpsellProduct → Product para passar ao addItem do CartContext.
  // O CartDrawer só usa id/slug/name/price/images[0]; os demais campos
  // ficam stub vazios. Construir aqui (não no addItem) mantém o tipo
  // Product compartilhado intocado.
  const upsellToCartProduct = (u: UpsellProduct): Product => ({
    id: u.id,
    slug: u.slug,
    name: u.name,
    description: '',
    price: u.price,
    images: u.image_url ? [u.image_url] : [],
    collection: '',
    tags: [],
    rating_avg: 0,
    rating_count: 0,
    created_at: new Date().toISOString(),
  });

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

  const items = order.items;
  const orderTotal = Number(order.total) || items.reduce((s, i) => s + i.unit_price * i.quantity, 0);

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
              fontFamily: "'Wagon', sans-serif",
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
              fontFamily: "'Sackers Gothic', 'Wagon', sans-serif",
              fontSize: '0.7rem',
              letterSpacing: '0.12em',
              color: CHAR,
              marginBottom: 10,
            }}>
              #{order.id.slice(0, 8).toUpperCase()}
            </p>

            <p style={{
              fontFamily: BODY_TEXT_FAMILY,
              fontWeight: 300,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
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
              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: BODY_TEXT_FAMILY,
                      fontWeight: 300,
                      fontSize: '1rem',
                      color: CHAR,
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.product_name}
                    </p>
                    <p style={{
                      fontFamily: "'Sackers Gothic', sans-serif",
                      fontWeight: 300,
                      fontSize: '0.7rem',
                      color: `${CHAR}55`,
                      margin: '2px 0 0',
                    }}>
                      {item.quantity} × R$ {item.unit_price.toFixed(2)}
                    </p>
                  </div>
                  <span style={{
                    fontFamily: BODY_TEXT_FAMILY,
                    fontWeight: 300,
                    fontSize: '0.95rem',
                    color: CHAR,
                    whiteSpace: 'nowrap',
                  }}>
                    R$ {(item.quantity * item.unit_price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: `1px solid ${CHAR}14`, marginTop: 20, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontFamily: BODY_TEXT_FAMILY,
                fontWeight: 300,
                fontSize: '1.05rem',
                color: CHAR,
              }}>
                Total
              </span>
              <span style={{
                fontFamily: BODY_TEXT_FAMILY,
                fontSize: '1.2rem',
                fontWeight: 500,
                color: CHAR,
              }}>
                R$ {orderTotal.toFixed(2)}
              </span>
            </div>
          </section>

          {/* ── Section 3: Delivery / Pickup ── */}
          <section style={{
            background: CREME,
            padding: 28,
            marginBottom: 40,
          }}>
            <span style={{ ...LABEL, display: 'block', marginBottom: 20 }}>
              {order.is_pickup ? 'retirada na loja' : 'entrega estimada'}
            </span>

            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
              <Package size={20} style={{ color: OLIVA, flexShrink: 0, marginTop: 2 }} />
              <div>
                {order.is_pickup ? (
                  <>
                    <p style={{
                      fontFamily: BODY_TEXT_FAMILY,
                      fontWeight: 300,
                      fontSize: '0.85rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: CHAR,
                      margin: '0 0 8px',
                      lineHeight: 1.5,
                    }}>
                      <strong>até 10 dias úteis</strong> para retirada após confirmação do pagamento
                    </p>
                    {order.pickup_address && (
                      <p style={{
                        fontFamily: BODY_TEXT_FAMILY,
                        fontWeight: 300,
                        fontSize: '0.9rem',
                        color: `${CHAR}99`,
                        margin: '0 0 12px',
                        lineHeight: 1.6,
                      }}>
                        endereço para retirada: {order.pickup_address}
                      </p>
                    )}
                    <p style={{
                      fontFamily: BODY_TEXT_FAMILY,
                      fontWeight: 300,
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: `${CHAR}77`,
                      margin: 0,
                      lineHeight: 1.6,
                    }}>
                      avisaremos por e-mail assim que estiver disponível para retirada.
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{
                      fontFamily: BODY_TEXT_FAMILY,
                      fontWeight: 300,
                      fontSize: '0.85rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: CHAR,
                      margin: '0 0 8px',
                      lineHeight: 1.5,
                    }}>
                      <strong>7 a 15 dias úteis</strong> após a postagem
                    </p>
                    <p style={{
                      fontFamily: BODY_TEXT_FAMILY,
                      fontWeight: 300,
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: `${CHAR}77`,
                      margin: '0 0 12px',
                      lineHeight: 1.6,
                    }}>
                      seu código de rastreio será enviado para o e-mail cadastrado assim que seu pedido for postado. fique de olho na sua caixa de entrada.
                    </p>
                    <a
                      href="https://rastreamento.correios.com.br"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: BODY_TEXT_FAMILY,
                        fontWeight: 300,
                        fontSize: '0.7rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: OLIVA,
                        textDecoration: 'underline',
                        textUnderlineOffset: '3px',
                      }}
                    >
                      Acompanhe pelo site oficial dos Correios
                    </a>
                    <p style={{
                      fontFamily: BODY_TEXT_FAMILY,
                      fontWeight: 300,
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: `${CHAR}55`,
                      margin: '8px 0 0',
                      lineHeight: 1.5,
                    }}>
                      Ou acesse a seção 'Meus Pedidos' em nosso site quando disponível.
                    </p>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* ── Section 4: Upsell ── */}
          {order.upsells.length > 0 && (
            <section style={{ marginBottom: 56 }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <span style={{ ...LABEL, display: 'block', marginBottom: 10 }}>você também pode gostar</span>
                <h2 style={{
                  fontFamily: "'Wagon', sans-serif",
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
                {order.upsells.map(upsell => (
                  <div key={upsell.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <Link to={`/product/${upsell.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{ aspectRatio: '1', overflow: 'hidden', background: CREME }}>
                        {upsell.image_url ? (
                          <img
                            src={upsell.image_url}
                            alt={upsell.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.6)' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : null}
                      </div>
                    </Link>
                    <Link to={`/product/${upsell.slug}`} style={{ textDecoration: 'none' }}>
                      <p style={{
                        fontFamily: BODY_TEXT_FAMILY,
                        fontWeight: 300,
                        fontSize: '0.95rem',
                        color: CHAR,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {upsell.name}
                      </p>
                    </Link>
                    <span style={{
                      fontFamily: BODY_TEXT_FAMILY,
                      fontWeight: 300,
                      fontSize: '0.9rem',
                      color: `${CHAR}88`,
                    }}>
                      R$ {upsell.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => addItem(upsellToCartProduct(upsell), 1)}
                      style={{
                        padding: '8px 12px',
                        background: 'transparent',
                        border: `1px solid ${CHAR}33`,
                        color: CHAR,
                        fontFamily: "'Sackers Gothic', 'Wagon', sans-serif",
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
                fontFamily: "'Sackers Gothic', 'Wagon', sans-serif",
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
              fontFamily: BODY_TEXT_FAMILY,
              fontWeight: 300,
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
