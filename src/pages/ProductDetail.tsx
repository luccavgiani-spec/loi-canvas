import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { getProductBySlug, getRelatedProducts } from '@/lib/api';
import type { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Star, Truck, RefreshCw, Leaf, Package } from 'lucide-react';
import ReviewSection from '@/components/product/ReviewSection';
import ShippingCalculator from '@/components/ShippingCalculator';

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
        <div className="max-w-[1400px] mx-auto px-6 py-16">
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

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto px-6 py-10 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-14">
          {/* Gallery */}
          <div>
            <div className="aspect-square overflow-hidden mb-3">
              {product.images[selectedImage]?.match(/\.mp4$/i) ? (
                <video
                  key={selectedImage}
                  src={product.images[selectedImage]}
                  muted
                  playsInline
                  autoPlay
                  loop
                  preload="metadata"
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
              <div className="flex gap-2 overflow-x-auto">
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
                      <video
                        src={img}
                        muted
                        playsInline
                        preload="none"
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
          <div>
            {product.badge && (
              <span
                className="inline-block mb-3"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
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
                  fontFamily: "'Montserrat', sans-serif",
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
                    fontFamily: "'Montserrat', sans-serif",
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
              <p
                className="mb-2"
                style={{
                  fontFamily: "'Sackers Gothic', 'Montserrat', sans-serif",
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
                className="mb-5"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 400,
                  fontSize: '0.9rem',
                  color: 'rgba(0,0,0,0.55)',
                  letterSpacing: '0.04em',
                }}
              >
                {product.accord}
              </p>
            )}

            <p
              className="mb-8"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontStyle: 'italic',
                fontSize: '1.05rem',
                color: '#000',
                lineHeight: 1.8,
              }}
            >
              {product.description}
            </p>

            {/* Shipping calculator */}
            <div className="mb-8">
              <ShippingCalculator />
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {benefits.map((b) => (
                <div key={b.label} className="flex items-center gap-2">
                  <b.icon size={14} style={{ color: '#000' }} />
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 300,
                      fontSize: '0.72rem',
                      color: '#000',
                    }}
                  >
                    {b.label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <button onClick={() => addItem(product)} className="loi-btn flex-1 justify-center">
                adicionar ao carrinho
              </button>
              <button onClick={() => addItem(product)} className="loi-btn-outline flex-1 justify-center">
                comprar agora
              </button>
            </div>

            {/* Details */}
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.12)' }}>
              {[
                product.suggested_use ? { title: 'uso sugerido', content: product.suggested_use } : null,
                product.composition ? { title: 'composição', content: product.composition } : null,
                product.ritual ? { title: 'ritual de uso', content: product.ritual } : null,
                product.details ? { title: 'detalhes', content: product.details } : null,
              ]
                .filter(Boolean)
                .map((item) => (
                  <details key={item!.title} style={{ borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
                    <summary
                      className="flex items-center justify-between py-4 cursor-pointer list-none"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 400,
                        fontSize: '1rem',
                        color: '#000',
                      }}
                    >
                      {item!.title}
                      <span style={{ color: '#000', fontSize: '1.2rem', fontWeight: 200 }}>+</span>
                    </summary>
                    <p
                      className="pb-4"
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 300,
                        fontSize: '0.82rem',
                        color: '#000',
                        lineHeight: 1.8,
                      }}
                    >
                      {item!.content}
                    </p>
                  </details>
                ))}
            </div>

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
                      <video
                        src={p.images[0]}
                        muted
                        playsInline
                        autoPlay
                        loop
                        preload="none"
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
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: '1rem', color: '#000', marginBottom: 4 }}>
                      {p.name}
                    </h3>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: '#000' }}>
                      R$ {p.price.toFixed(2)}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
