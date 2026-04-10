import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { getProductBySlug, getRelatedProducts } from '@/lib/api';
import { FAMILIES } from '@/lib/families';
import type { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Star, Truck, RefreshCw, Leaf, Package } from 'lucide-react';
import ReviewSection from '@/components/product/ReviewSection';
import ShippingCalculator from '@/components/ShippingCalculator';

const FONT_BODY = "'Sackers Gothic', sans-serif";

const benefits = [
  { icon: Truck, label: 'Frete grátis acima de R$ 299' },
  { icon: RefreshCw, label: 'Trocas em até 7 dias' },
  { icon: Leaf, label: 'Embalagem sustentável' },
  { icon: Package, label: 'Feita em pequenos lotes' },
];

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getProductBySlug(slug).then((prod) => {
      setProduct(prod);
      setSelectedImage(0);
      getRelatedProducts(prod.id).then(setRelated);
    }).finally(() => setLoading(false));
  }, [slug]);

  if (loading || !product) {
    return (
      <Layout>
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-16">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="aspect-square" style={{ background: 'rgba(0,0,0,0.05)' }} />
            <div className="space-y-4">
              <div className="h-8 w-3/4" style={{ background: 'rgba(0,0,0,0.05)' }} />
              <div className="h-6 w-1/3" style={{ background: 'rgba(0,0,0,0.05)' }} />
              <div className="h-32 w-full" style={{ background: 'rgba(0,0,0,0.05)' }} />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  /* Famílias às quais este produto pertence */
  const productFamilies = FAMILIES.filter((fam) =>
    fam.products.some((p) => p.slug === product.slug)
  );

  return (
    <Layout>
      {/* FIX: overflow-x-hidden impede vazamento horizontal no mobile */}
      <div className="w-full overflow-x-hidden">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-14">
            {/* Gallery */}
            {/* FIX: min-w-0 impede que o grid item expanda além da coluna */}
            <div className="min-w-0">
              <div className="aspect-square overflow-hidden mb-3 w-full">
                {product.images[selectedImage]?.match(/\.mp4$/i) ? (
                  <VideoPlayer
                    key={selectedImage}
                    src={product.images[selectedImage]}
                    poster={product.images.find(s => !s.match(/\.mp4$/i))}
                    className="w-full h-full object-cover"
                    style={{ filter: 'saturate(0.85) brightness(0.9)' }}
                  />
                ) : (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    style={{ filter: 'saturate(0.85) brightness(0.9)' }}
                  />
                )}
              </div>
              {product.images.length > 1 && (
                // FIX: pb-1 evita corte da scrollbar no mobile
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className="w-16 h-16 overflow-hidden transition-all flex-shrink-0"
                      style={{
                        border: i === selectedImage ? '2px solid #000' : '2px solid transparent',
                        opacity: i === selectedImage ? 1 : 0.5,
                      }}
                    >
                      {img.match(/\.mp4$/i) ? (
                        <VideoPlayer
                          src={img}
                          poster={product.images.find(s => !s.match(/\.mp4$/i))}
                          className="w-full h-full object-cover"
                          style={{ filter: 'saturate(0.7) brightness(0.8)' }}
                        />
                      ) : (
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                          style={{ filter: 'saturate(0.7) brightness(0.8)' }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            {/* FIX: min-w-0 impede que o grid item expanda além da coluna */}
            <div className="min-w-0">

              {/* Nav família aromática */}
              {productFamilies.length > 0 && (
                <div className="mb-5 space-y-2">
                  {productFamilies.map((fam) => (
                    <div key={fam.label} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span
                        style={{
                          fontFamily: FONT_BODY,
                          fontWeight: 300,
                          fontSize: '0.6rem',
                          letterSpacing: '0.18em',
                          color: 'rgba(0,0,0,0.4)',
                          flexShrink: 0,
                        }}
                      >
                        {fam.label}
                      </span>
                      <span style={{ color: 'rgba(0,0,0,0.2)', fontSize: '0.6rem' }}>·</span>
                      {fam.products.map((p, i, arr) => {
                        const isCurrent = p.slug === product.slug;
                        return (
                          <span key={p.slug} className="flex items-baseline gap-x-1">
                            {isCurrent ? (
                              <span
                                style={{
                                  fontFamily: FONT_BODY,
                                  fontWeight: 300,
                                  fontSize: '0.65rem',
                                  letterSpacing: '0.12em',
                                  color: '#000',
                                }}
                              >
                                {p.name}
                              </span>
                            ) : (
                              <Link
                                to={`/product/${p.slug}`}
                                style={{
                                  fontFamily: FONT_BODY,
                                  fontWeight: 300,
                                  fontSize: '0.65rem',
                                  letterSpacing: '0.12em',
                                  color: 'rgba(0,0,0,0.4)',
                                  textDecoration: 'none',
                                  transition: 'color 0.3s ease',
                                }}
                                className="hover:!text-black"
                              >
                                {p.name}
                              </Link>
                            )}
                            {i < arr.length - 1 && (
                              <span style={{ color: 'rgba(0,0,0,0.2)', fontSize: '0.65rem', marginLeft: '2px' }}>·</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}

              {product.badge && (
                <span
                  className="inline-block mb-3"
                  style={{
                    fontFamily: FONT_BODY,
                    fontWeight: 300,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontSize: '0.6rem',
                    color: '#000',
                    background: 'rgba(0,0,0,0.08)',
                    padding: '4px 12px',
                  }}
                >
                  {product.badge === 'sale' ? 'Promoção' : product.badge === 'new' ? 'Novo' : 'Edição Limitada'}
                </span>
              )}

              <h1
                className="heading-display mb-3"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#000' }}
              >
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      className={s <= Math.round(product.rating_avg) ? 'fill-current' : ''}
                      style={{ color: s <= Math.round(product.rating_avg) ? '#000' : 'rgba(0,0,0,0.15)' }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontFamily: FONT_BODY,
                    fontWeight: 300,
                    fontSize: '0.75rem',
                    color: '#000',
                  }}
                >
                  {product.rating_avg} ({product.rating_count} avaliações)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="heading-display"
                  style={{ fontSize: '1.8rem', color: '#000' }}
                >
                  R$ {product.price.toFixed(2)}
                </span>
                {product.compare_at_price && (
                  <span
                    style={{
                      fontFamily: FONT_BODY,
                      fontWeight: 300,
                      fontSize: '1rem',
                      color: '#000',
                      textDecoration: 'line-through',
                    }}
                  >
                    R$ {product.compare_at_price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Accord & Notes */}
              {product.notes && (
                // FIX: break-words para notas longas não vazarem
                <p
                  className="mb-2 break-words"
                  style={{
                    fontFamily: FONT_BODY,
                    fontWeight: 300,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontSize: '0.65rem',
                    color: 'rgba(0,0,0,0.45)',
                  }}
                >
                  {product.notes}
                </p>
              )}
              {product.accord && (
                <p
                  className="mb-5 break-words"
                  style={{
                    fontFamily: "'Wagon', sans-serif",
                    fontWeight: 400,
                    fontSize: '0.9rem',
                    color: 'rgba(0,0,0,0.55)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {product.accord}
                </p>
              )}

              {/* Descrição — texto corrido, sem título */}
              <p
                className="mb-6 break-words"
                style={{
                  fontFamily: "'Wagon', sans-serif",
                  fontWeight: 300,
                  fontStyle: 'italic',
                  fontSize: '1.05rem',
                  color: '#000',
                  lineHeight: 1.8,
                }}
              >
                {product.description}
              </p>

              {/* Sugestão de uso — sem título, conteúdo direto */}
              {product.suggested_use && (
                <p
                  className="mb-6 break-words"
                  style={{
                    fontFamily: FONT_BODY,
                    fontWeight: 300,
                    fontSize: '0.82rem',
                    color: '#000',
                    lineHeight: 1.9,
                  }}
                >
                  {product.suggested_use}
                </p>
              )}

              {/* Composição — Cormorant Garamond, destaque visual */}
              {product.composition && (
                <p
                  className="mb-6 break-words"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 400,
                    fontStyle: 'italic',
                    fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                    color: '#000',
                    lineHeight: 1.7,
                    borderLeft: '2px solid rgba(0,0,0,0.12)',
                    paddingLeft: '1rem',
                  }}
                >
                  {product.composition}
                </p>
              )}

              {/* Ritual de uso — bloco sem título, integrado ao fluxo */}
              {product.ritual && (
                <p
                  className="mb-6 break-words"
                  style={{
                    fontFamily: "'Wagon', sans-serif",
                    fontWeight: 300,
                    fontSize: '0.9rem',
                    color: 'rgba(0,0,0,0.7)',
                    lineHeight: 1.85,
                  }}
                >
                  {product.ritual}
                </p>
              )}

              {/* Shipping calculator */}
              <div className="mb-8">
                <ShippingCalculator />
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {benefits.map((b) => (
                  <div key={b.label} className="flex items-center gap-2">
                    <b.icon size={14} style={{ color: '#000', flexShrink: 0 }} />
                    <span
                      style={{
                        fontFamily: FONT_BODY,
                        fontWeight: 300,
                        fontSize: '0.72rem',
                        color: '#000',
                        // FIX: impede texto de overflow no grid de 2 colunas
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        minWidth: 0,
                      }}
                    >
                      {b.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              {/* FIX: sempre flex-col no mobile; w-full nos botões garante largura correta */}
              <div className="flex flex-col gap-3 mb-10">
                <button
                  onClick={() => addItem(product)}
                  className="loi-btn w-full justify-center"
                >
                  adicionar ao carrinho
                </button>
                <button
                  onClick={() => addItem(product)}
                  className="loi-btn-outline w-full justify-center"
                >
                  comprar agora
                </button>
              </div>

              {/* Detalhes — accordion residual (apenas `details`) */}
              {product.details && (
                <div style={{ borderTop: '1px solid rgba(0,0,0,0.12)' }}>
                  <details style={{ borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
                    <summary
                      className="flex items-center justify-between py-4 cursor-pointer list-none"
                      style={{
                        fontFamily: "'Wagon', sans-serif",
                        fontWeight: 400,
                        fontSize: '1rem',
                        color: '#000',
                      }}
                    >
                      detalhes
                      <span style={{ color: '#000', fontSize: '1.2rem', fontWeight: 200 }}>+</span>
                    </summary>
                    <p
                      className="pb-4 break-words"
                      style={{
                        fontFamily: FONT_BODY,
                        fontWeight: 300,
                        fontSize: '0.82rem',
                        color: '#000',
                        lineHeight: 1.8,
                      }}
                    >
                      {product.details}
                    </p>
                  </details>
                </div>
              )}

            </div>
          </div>

          <ReviewSection productId={product.id} />

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-20 md:mt-28">
              <div className="text-center mb-12">
                <span className="loi-label block mb-4">recomendados</span>
                <h2 className="heading-display" style={{ fontSize: '2rem', color: '#000' }}>
                  Você também pode gostar
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {related.map((p) => (
                  <div key={p.id} className="group">
                    <Link to={`/product/${p.slug}`} className="block relative overflow-hidden aspect-[3/4] mb-4">
                      {p.images[0]?.match(/\.mp4$/i) ? (
                        <VideoPlayer
                          src={p.images[0]}
                          poster={p.images.find(s => !s.match(/\.mp4$/i))}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          style={{ filter: 'saturate(0.85) brightness(0.9)' }}
                        />
                      ) : (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          style={{ filter: 'saturate(0.85) brightness(0.9)' }}
                          loading="lazy"
                        />
                      )}
                    </Link>
                    <Link to={`/product/${p.slug}`}>
                      <h3 style={{ fontFamily: "'Wagon', sans-serif", fontWeight: 400, fontSize: '1rem', color: '#000', marginBottom: 4 }}>
                        {p.name}
                      </h3>
                      <span style={{ fontFamily: FONT_BODY, fontWeight: 300, fontSize: '0.8rem', color: '#000' }}>
                        R$ {p.price.toFixed(2)}
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
