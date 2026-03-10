import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { getProducts } from '@/lib/api';
import { mockCollections } from '@/lib/mocks';
import type { Product } from '@/types';
import { useReveal } from '@/hooks/useReveal';
import { useCart } from '@/contexts/CartContext';
import { ArrowRight } from 'lucide-react';

const collectionMeta: Record<string, {numeral: string;detail: string;priceLabel: string;}> = {
  'Cotidianas': { numeral: 'I', detail: 'Latinha 160g · dois pavios', priceLabel: 'a partir de R$ 72' },
  'Sala ou Estar': { numeral: 'II', detail: 'Copo 200g transparente · um pavio', priceLabel: 'a partir de R$ 172' },
  'Refúgio': { numeral: 'III', detail: 'Copo âmbar 300g · um pavio', priceLabel: 'a partir de R$ 260' },
  'Botânicas e Florais': { numeral: 'IV', detail: 'Copo 400g · dois pavios', priceLabel: 'a partir de R$ 332' }
};

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const ref = useReveal(0.15, [loading]);

  useEffect(() => {
    getProducts().then(setProducts).finally(() => setLoading(false));
  }, []);

  const collections = mockCollections.filter((c) => c.is_active).sort((a, b) => a.sort_order - b.sort_order);

  const getCollectionProducts = (name: string) =>
  products.filter((p) => p.collection === name);

  return (
    <Layout>
      <div ref={ref}>
        {/* Hero */}
        <section
          className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 overflow-hidden"
          style={{ background: '#29241f' }}>
          
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #f4edd2 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
          
          <div className="max-w-[1400px] mx-auto relative z-10 text-center">
            <span
              className="reveal-fade inline-block mb-6"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 300,
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                fontSize: '0.6rem',
                color: 'rgba(244,237,210,0.35)'
              }}>
              
              nossas coleções
            </span>
            <h1
              className="reveal-fade heading-display mb-6"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                color: '#f4edd2',
                lineHeight: 1.1
              }}>
              
              Atmosferas que ficam
            </h1>
            <p
              className="reveal-fade max-w-xl mx-auto"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontStyle: 'italic',
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: 'rgba(244,237,210,0.5)',
                lineHeight: 1.8
              }}>
              
              Quatro coleções, uma filosofia: velas artesanais feitas com cera de soja
              100% natural e fragrâncias cuidadosamente desenvolvidas.
            </p>
          </div>
        </section>

        {/* Collection sections */}
        {collections.map((col, idx) => {
          const meta = collectionMeta[col.name];
          const colProducts = getCollectionProducts(col.name);
          const isEven = idx % 2 === 0;

          return (
            <section
              key={col.id}
              className="reveal md:py-32 px-6 py-[38px]"
              style={{
                background: isEven ? '#fcf5e0' : '#f5ecd0'
              }}>
              
              <div className="max-w-[1400px] mx-auto">
                {/* Collection header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                  <div>
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 300,
                        fontStyle: 'italic',
                        fontSize: '1rem',
                        color: 'rgba(86,86,0,0.5)',
                        display: 'block',
                        marginBottom: 8
                      }}>
                      
                      {meta?.numeral}
                    </span>
                    <h2
                      className="heading-display"
                      style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        color: '#29241f',
                        marginBottom: 8
                      }}>
                      
                      {col.name}
                    </h2>
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 300,
                        fontStyle: 'italic',
                        fontSize: '1rem',
                        color: 'rgba(41,36,31,0.6)',
                        lineHeight: 1.7,
                        maxWidth: 500
                      }}>
                      
                      {col.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 300,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        fontSize: '0.65rem',
                        color: 'rgba(41,36,31,0.4)'
                      }}>
                      
                      {meta?.detail}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 300,
                        letterSpacing: '0.1em',
                        fontSize: '0.75rem',
                        color: '#565600'
                      }}>
                      
                      {meta?.priceLabel}
                    </span>
                  </div>
                </div>

                {/* Products grid */}
                {loading ?
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                    {Array.from({ length: 4 }).map((_, i) =>
                  <div key={i}>
                        <div className="aspect-[3/4] mb-4" style={{ background: 'rgba(41,36,31,0.05)' }} />
                        <div className="h-4 w-3/4 mb-2" style={{ background: 'rgba(41,36,31,0.05)' }} />
                        <div className="h-3 w-1/2" style={{ background: 'rgba(41,36,31,0.05)' }} />
                      </div>
                  )}
                  </div> :

                <div className="reveal-stagger grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                    {colProducts.map((product) =>
                  <div key={product.id} className="reveal group">
                        <Link to={`/product/${product.slug}`} className="block relative overflow-hidden aspect-[3/4] mb-4">
                          {product.images[0]?.match(/\.mp4$/i) ?
                      <video
                        src={product.images[0]}
                        muted
                        playsInline
                        autoPlay
                        loop
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        style={{ filter: 'saturate(0.85) brightness(0.9)' }} /> :


                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        style={{ filter: 'saturate(0.85) brightness(0.9)' }}
                        loading="lazy" />

                      }
                          <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ background: 'linear-gradient(to top, rgba(41,36,31,0.7) 0%, transparent 50%)' }} />
                      
                          {product.badge &&
                      <span
                        className="absolute top-3 left-3"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 300,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          fontSize: '0.6rem',
                          color: '#f4edd2',
                          background: 'rgba(41,36,31,0.7)',
                          padding: '4px 10px',
                          backdropFilter: 'blur(4px)'
                        }}>
                        
                              {product.badge === 'sale' ? 'Promoção' : product.badge === 'new' ? 'Novo' : 'Edição Limitada'}
                            </span>
                      }
                          <button
                        onClick={(e) => {e.preventDefault();addItem(product);}}
                        className="absolute bottom-0 left-0 right-0 py-3 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                        style={{
                          background: 'rgba(86,86,0,0.9)',
                          color: '#f4edd2',
                          fontFamily: "var(--font-body)",
                          fontWeight: 300,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          fontSize: '0.65rem'
                        }}>
                        
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
                          color: 'rgba(41,36,31,0.6)',
                          lineHeight: 1.5,
                          marginBottom: 8,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                        
                            {product.description}
                          </p>
                          <span style={{ fontFamily: "var(--font-body)", fontWeight: 300, fontSize: '0.8rem', color: '#565600' }}>
                            R$ {product.price.toFixed(2)}
                          </span>
                        </Link>
                      </div>
                  )}
                  </div>
                }

                {/* View collection link */}
                <div className="mt-10 text-center">
                  <Link
                    to={`/shop/${col.slug}`}
                    className="inline-flex items-center gap-2 group/link"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 300,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      color: '#565600',
                      textDecoration: 'none',
                      transition: 'gap 0.3s ease'
                    }}>
                    
                    ver coleção completa
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </div>
            </section>);

        })}
      </div>
    </Layout>);

};

export default Shop;