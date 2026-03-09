import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';
import { useCart } from '@/contexts/CartContext';
import { mockProducts } from '@/lib/mocks';
import {
  imgFlorDeLaranjeira,
  imgCedroVetiver,
  imgLavandaProvencal,
  imgRosaOud,
  imgBaunilhaTonka,
  imgFigoMediterraneo,
  imgSandaloAmbar,
  imgAlecrimSalvia,
  bannerCollection,
  bannerAtelier,
} from '@/assets';

const PRODUCTS = mockProducts;
const FEATURED = PRODUCTS.filter((p) => p.is_bestseller).slice(0, 4);
const COLLECTION_2 = PRODUCTS.filter((p) => !p.is_bestseller).slice(0, 4);

/* ── Reusable product card ── */
const ProductCard = ({ product, addItem }: { product: typeof PRODUCTS[0]; addItem: (p: typeof PRODUCTS[0]) => void }) => (
  <div className="reveal group">
    <Link to={`/product/${product.slug}`} className="block relative overflow-hidden aspect-[3/4] mb-4">
      <img
        src={product.images[0]}
        alt={product.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        style={{ filter: 'saturate(0.85) brightness(0.9)' }}
        loading="lazy"
      />
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'linear-gradient(to top, rgba(41,36,31,0.7) 0%, transparent 50%)' }}
      />
      {product.badge && (
        <span
          className="absolute top-3 left-3"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 300,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontSize: '0.6rem',
            color: '#f4edd2',
            background: 'rgba(41,36,31,0.7)',
            padding: '4px 10px',
            backdropFilter: 'blur(4px)',
          }}
        >
          {product.badge === 'sale' ? 'Promoção' : product.badge === 'new' ? 'Novo' : 'Edição Limitada'}
        </span>
      )}
      <button
        onClick={(e) => { e.preventDefault(); addItem(product); }}
        className="absolute bottom-0 left-0 right-0 py-3 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-400"
        style={{
          background: 'rgba(86,86,0,0.9)',
          color: '#f4edd2',
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 300,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontSize: '0.65rem',
          backdropFilter: 'blur(4px)',
        }}
      >
        adicionar ao carrinho
      </button>
    </Link>
    <Link to={`/product/${product.slug}`} className="block">
      <h3
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 400,
          fontSize: '1.1rem',
          color: '#f4edd2',
          marginBottom: 4,
        }}
      >
        {product.name}
      </h3>
      <div className="flex items-center gap-3">
        <span
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 300,
            fontSize: '0.8rem',
            color: '#989857',
          }}
        >
          R$ {product.price.toFixed(2)}
        </span>
        {product.compare_at_price && (
          <span
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 300,
              fontSize: '0.7rem',
              color: 'rgba(244,237,210,0.3)',
              textDecoration: 'line-through',
            }}
          >
            R$ {product.compare_at_price.toFixed(2)}
          </span>
        )}
      </div>
    </Link>
  </div>
);

/* ── Reusable product focus banner ── */
const ProductFocusBanner = ({ product, reverse = false }: { product: typeof PRODUCTS[0]; reverse?: boolean }) => (
  <div className={`reveal flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} min-h-[50vh]`}>
    <div className="md:w-1/2 relative overflow-hidden" style={{ minHeight: 350 }}>
      <img
        src={product.images[0]}
        alt={product.name}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'saturate(0.7) brightness(0.6)' }}
        loading="lazy"
      />
      <div
        className="absolute inset-0"
        style={{
          background: reverse
            ? 'linear-gradient(to left, transparent 60%, #29241f)'
            : 'linear-gradient(to right, transparent 60%, #29241f)',
        }}
      />
      <div className="loi-grain" />
    </div>
    <div className="md:w-1/2 flex items-center px-8 md:px-16 lg:px-24 py-16 md:py-0" style={{ background: '#29241f' }}>
      <div className="max-w-md">
        <span className="loi-label block mb-4">{product.collection}</span>
        <h3
          className="heading-display mb-4"
          style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            color: '#f4edd2',
            lineHeight: 1.15,
          }}
        >
          {product.name}
        </h3>
        <div className="loi-divider mb-6" />
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: '1.05rem',
            color: 'rgba(244,237,210,0.5)',
            lineHeight: 1.8,
            marginBottom: '1.5rem',
          }}
        >
          {product.description}
        </p>
        <p
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 300,
            fontSize: '0.85rem',
            color: '#989857',
            marginBottom: '1.5rem',
          }}
        >
          R$ {product.price.toFixed(2)}
        </p>
        <Link to={`/product/${product.slug}`} className="loi-btn-outline">
          ver produto
        </Link>
      </div>
    </div>
  </div>
);

/* ────────────────────────────────────────────────────────────── */
const HomeSections = () => {
  const ref = useReveal();
  const { addItem } = useCart();

  // Product focus banner selections
  const focusProduct1 = PRODUCTS.find((p) => p.slug === 'rosa-oud')!;
  const focusProduct2 = PRODUCTS.find((p) => p.slug === 'cedro-vetiver')!;
  const focusProduct3 = PRODUCTS.find((p) => p.slug === 'figo-mediterraneo')!;
  const focusProduct4 = PRODUCTS.find((p) => p.slug === 'sândalo-amber')!;

  return (
    <div ref={ref} style={{ background: '#29241f' }}>
      {/* ── 1. Scroll indicator transition ── */}
      <div className="flex items-center justify-center py-6">
        <div className="scroll-indicator flex flex-col items-center gap-2" style={{ color: 'rgba(244,237,210,0.3)' }}>
          <span className="loi-label">scroll</span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M8 4v12M4 12l4 4 4-4" />
          </svg>
        </div>
      </div>

      {/* ── 2. Coleção 1 — Bestsellers ── */}
      <section className="py-28 md:py-36 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <span className="reveal loi-label block mb-4">mais amados</span>
            <h2
              className="reveal heading-display"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#f4edd2' }}
            >
              Bestsellers
            </h2>
          </div>
          <div className="reveal-stagger grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {FEATURED.map((product) => (
              <ProductCard key={product.id} product={product} addItem={addItem} />
            ))}
          </div>
          <div className="reveal text-center mt-14">
            <Link to="/shop" className="loi-ghost group">
              <span>ver toda a coleção</span>
              <span className="loi-ghost-dash" />
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. Banner de Produto Foco 1 / Banner de Produto Foco 2 ── */}
      <section className="relative">
        <ProductFocusBanner product={focusProduct1} />
      </section>
      <section className="relative">
        <ProductFocusBanner product={focusProduct2} reverse />
      </section>

      {/* ── 4. Manifesto (from /about) ── */}
      <section className="relative py-28 md:py-40 overflow-hidden">
        <div className="loi-grain" />
        <div className="relative z-[1] max-w-3xl mx-auto px-6 text-center">
          <span className="reveal loi-label block mb-8">manifesto</span>
          <h2
            className="reveal heading-display mb-8"
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              color: '#f4edd2',
              lineHeight: 1.2,
            }}
          >
            A Loiê Sala Aromática é esse gesto poético, mas também é um ateliê real
            <em style={{ color: '#989857' }}> — feito de tempo, matéria, escolhas e presença</em>
          </h2>
          <div className="reveal loi-divider mx-auto mb-8" />
          <p
            className="reveal"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(1rem, 1.5vw, 1.15rem)',
              color: 'rgba(244,237,210,0.55)',
              lineHeight: 1.8,
              maxWidth: 620,
              margin: '0 auto',
              whiteSpace: 'pre-line',
            }}
          >
            Acendemos uma vela como quem abre uma porta. Uma porta para dentro. Pra memória. Pra beleza que mora no silêncio.
            {'\n\n'}
            A Loiê nasceu de uma casa antiga, de um ritual secreto, de um saber que se aprende com as mãos e os sentidos.
            {'\n\n'}
            Cada aroma é uma narrativa, cada frasco é um convite a ficar mais tempo com o que importa.
            {'\n\n'}
            Somos fogo, mas somos calma. Somos essência, mas somos presença. Somos brasileiros, feitos à mão, com técnica e com alma.
            {'\n\n'}
            Não vendemos velas. Criamos atmosferas.
          </p>
          <div className="reveal flex items-center justify-center gap-8 mt-12">
            <Link to="/about" className="loi-btn">nossa história</Link>
          </div>
        </div>
      </section>

      {/* ── 5. Coleção 2 — Destaques ── */}
      <section className="py-28 md:py-36 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <span className="reveal loi-label block mb-4">destaques</span>
            <h2
              className="reveal heading-display"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#f4edd2' }}
            >
              Descubra Novos Aromas
            </h2>
          </div>
          <div className="reveal-stagger grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {COLLECTION_2.map((product) => (
              <ProductCard key={product.id} product={product} addItem={addItem} />
            ))}
          </div>
          <div className="reveal text-center mt-14">
            <Link to="/shop" className="loi-ghost group">
              <span>ver toda a coleção</span>
              <span className="loi-ghost-dash" />
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. Banner de Produto Foco 3 / Banner de Produto Foco 4 ── */}
      <section className="relative">
        <ProductFocusBanner product={focusProduct3} />
      </section>
      <section className="relative">
        <ProductFocusBanner product={focusProduct4} reverse />
      </section>

      {/* ── 7. Detalhes — O que torna cada vela única ── */}
      <section className="py-28 md:py-36 px-6" style={{ background: '#231f1a' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <span className="reveal loi-label block mb-4">detalhes</span>
            <h2
              className="reveal heading-display"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#f4edd2' }}
            >
              O que torna cada vela única
            </h2>
          </div>
          <div className="reveal-stagger grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {[
              {
                title: 'Ingredientes Puros',
                desc: 'Cera de soja 100% vegetal, pavios de algodão certificado e fragrâncias desenvolvidas em parceria com perfumistas brasileiros. Sem parafina, sem corantes artificiais.',
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                ),
              },
              {
                title: 'Feitas à Mão',
                desc: 'Cada vela passa por 12 etapas artesanais em nosso ateliê em São Paulo. Do derretimento da cera ao rótulo final, tudo é cuidado manualmente.',
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                ),
              },
              {
                title: '50+ Horas de Queima',
                desc: 'Cada vela de 250g proporciona mais de 50 horas de fragrância. Nosso compromisso é com qualidade, duração e a experiência completa.',
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="reveal text-center">
                <div className="flex justify-center mb-6" style={{ color: '#989857' }}>
                  {item.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 400,
                    fontSize: '1.4rem',
                    color: '#f4edd2',
                    marginBottom: '0.75rem',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 300,
                    fontSize: '0.8rem',
                    color: 'rgba(244,237,210,0.45)',
                    lineHeight: 1.8,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Todos os Produtos ── */}
      <section className="py-28 md:py-36 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <span className="reveal loi-label block mb-4">coleção completa</span>
            <h2
              className="reveal heading-display"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#f4edd2' }}
            >
              Todas as Fragrâncias
            </h2>
          </div>
          <div className="reveal-stagger grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {PRODUCTS.map((product) => (
              <div key={product.id} className="reveal group">
                <Link to={`/product/${product.slug}`} className="block relative overflow-hidden aspect-[3/4] mb-4">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ filter: 'saturate(0.85) brightness(0.9)' }}
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: 'linear-gradient(to top, rgba(41,36,31,0.7) 0%, transparent 50%)' }}
                  />
                  {product.badge && (
                    <span
                      className="absolute top-3 left-3"
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 300,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        fontSize: '0.6rem',
                        color: '#f4edd2',
                        background: 'rgba(41,36,31,0.7)',
                        padding: '4px 10px',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {product.badge === 'sale' ? 'Promoção' : product.badge === 'new' ? 'Novo' : 'Edição Limitada'}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.preventDefault(); addItem(product); }}
                    className="absolute bottom-0 left-0 right-0 py-3 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-400"
                    style={{
                      background: 'rgba(86,86,0,0.9)',
                      color: '#f4edd2',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 300,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      fontSize: '0.65rem',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    adicionar ao carrinho
                  </button>
                </Link>
                <Link to={`/product/${product.slug}`} className="block">
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 400,
                      fontSize: '1.1rem',
                      color: '#f4edd2',
                      marginBottom: 4,
                    }}
                  >
                    {product.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 300,
                      fontStyle: 'italic',
                      fontSize: '0.85rem',
                      color: 'rgba(244,237,210,0.4)',
                      lineHeight: 1.5,
                      marginBottom: 8,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {product.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 300,
                        fontSize: '0.8rem',
                        color: '#989857',
                      }}
                    >
                      R$ {product.price.toFixed(2)}
                    </span>
                    {product.compare_at_price && (
                      <span
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: 300,
                          fontSize: '0.7rem',
                          color: 'rgba(244,237,210,0.3)',
                          textDecoration: 'line-through',
                        }}
                      >
                        R$ {product.compare_at_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. FAQ Section ── */}
      <section className="py-28 md:py-36 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <span className="reveal loi-label block mb-4">dúvidas</span>
            <h2
              className="reveal heading-display"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#f4edd2' }}
            >
              Perguntas Frequentes
            </h2>
          </div>
          <div className="reveal space-y-0">
            {[
              { q: 'Qual o tempo de queima das velas?', a: 'Nossas velas de 250g têm duração aproximada de 50 horas. Recomendamos queimar por no máximo 4 horas seguidas para garantir a melhor performance da fragrância.' },
              { q: 'As velas são veganas e cruelty-free?', a: 'Sim! Utilizamos cera de soja 100% vegetal, pavios de algodão e fragrâncias livres de testes em animais. Nosso compromisso com a sustentabilidade é total.' },
              { q: 'Como funciona o frete?', a: 'Frete grátis para compras acima de R$ 299. Para pedidos menores, calculamos o frete no checkout com as melhores opções de envio para a sua região.' },
              { q: 'Posso trocar ou devolver?', a: 'Aceitamos trocas e devoluções em até 7 dias após o recebimento, desde que o produto não tenha sido usado. Sua satisfação é nossa prioridade.' },
              { q: 'Qual a diferença entre as coleções?', a: 'Cada coleção agrupa fragrâncias por família olfativa: Cítricos (frescos e vibrantes), Amadeirados (quentes e envolventes), Herbais (aromáticos e verdes), Orientais (intensos e sofisticados) e Gourmand (doces e aconchegantes).' },
            ].map((faq, i) => (
              <details
                key={i}
                className="group"
                style={{ borderBottom: '1px solid rgba(152,152,87,0.12)' }}
              >
                <summary
                  className="flex items-center justify-between py-6 cursor-pointer list-none"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 400,
                    fontSize: '1.1rem',
                    color: '#f4edd2',
                  }}
                >
                  {faq.q}
                  <span
                    className="ml-4 flex-shrink-0 transition-transform duration-300 group-open:rotate-45"
                    style={{ color: '#989857', fontSize: '1.5rem', fontWeight: 200 }}
                  >
                    +
                  </span>
                </summary>
                <p
                  className="pb-6"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 300,
                    fontSize: '0.82rem',
                    color: 'rgba(244,237,210,0.45)',
                    lineHeight: 1.8,
                    maxWidth: 520,
                  }}
                >
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. Newsletter / CTA Section ── */}
      <section className="py-28 md:py-36 px-6 relative overflow-hidden" style={{ background: '#231f1a' }}>
        <div className="loi-grain" />
        <div className="relative z-[1] max-w-lg mx-auto text-center">
          <span className="reveal loi-label block mb-6">exclusivo</span>
          <h2
            className="reveal heading-display mb-4"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: '#f4edd2',
              lineHeight: 1.15,
            }}
          >
            Ganhe 15% na primeira compra
          </h2>
          <p
            className="reveal mb-10"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: '1.05rem',
              color: 'rgba(244,237,210,0.5)',
              lineHeight: 1.7,
            }}
          >
            Cadastre seu e-mail e receba um cupom exclusivo de boas-vindas,
            além de novidades e lançamentos em primeira mão.
          </p>
          <form
            className="reveal flex gap-3"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input
              type="email"
              placeholder="seu@email.com"
              className="flex-1 px-4 py-3 bg-transparent border text-sm"
              style={{
                borderColor: 'rgba(152,152,87,0.25)',
                color: '#f4edd2',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 300,
                letterSpacing: '0.05em',
                outline: 'none',
              }}
            />
            <button type="submit" className="loi-btn" style={{ padding: '0.75rem 1.8rem' }}>
              cadastrar
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomeSections;
