import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bannerUrl } from '@/lib/storage';
import { supabase } from '@/integrations/supabase/client';
import GlareHover from '@/components/ui/GlareHover';
import { FAMILIES } from '@/lib/families';

/* ─── grain SVG data URI ─── */
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`;

/* ─── component ─── */
const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [activeFamily, setActiveFamily] = useState<string | null>(null);
  const [bannerImages, setBannerImages] = useState<string[]>([]);

  useEffect(() => {
    supabase.storage.from('banner').list().then(({ data, error }) => {
      if (error) {
        console.error('[HeroSection] banner list() failed:', error.message);
        return;
      }
      if (data) {
        const urls = data
          .filter(f => f.name.match(/\.(webp|jpg|jpeg|png)$/i))
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(f => bannerUrl(f.name));
        setBannerImages(urls);
      }
    });
  }, []);

  useEffect(() => {
    if (bannerImages.length === 0) return;
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(id);
  }, [bannerImages.length]);

  return (
    <section
      className="relative w-full h-screen overflow-hidden"
      style={{ background: '#29241f' }}
    >
      {/* ── banner images ── */}
      {bannerImages.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: i === current ? 1 : 0,
            transition: 'opacity 1.2s ease',
            filter: 'saturate(0.65) brightness(0.60) contrast(1.05)',
          }}
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}

      {/* ── overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 65% 70% at 50% 50%, rgba(41,36,31,0.05) 0%, rgba(41,36,31,0.60) 100%),
            linear-gradient(to bottom, rgba(41,36,31,0.62) 0%, rgba(41,36,31,0.00) 28%, rgba(41,36,31,0.00) 72%, rgba(41,36,31,0.72) 100%)
          `,
        }}
      />

      {/* ── grain ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.04, backgroundImage: GRAIN_SVG, backgroundSize: '200px 200px' }}
      />

      {/* ── central content ── */}
      <div
        className="relative z-[2] flex flex-col items-center justify-center h-full"
        style={{ paddingTop: '5rem' }}
      >
        <div
          className="flex flex-col items-center"
          style={{
            position: 'absolute',
            bottom: '5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            width: '100%',
          }}
        >
          <p
            className="hero-fadeUp mt-8"
            style={{
              fontFamily: "'Wagon', sans-serif",
              fontWeight: 300,
              fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
              color: 'rgba(244,237,210,0.6)',
              lineHeight: 1.7,
              animationDelay: '0.85s',
            }}
          >
            Acendemos uma vela como quem abre uma porta.
          </p>

          <div className="flex items-center gap-4 sm:gap-8 mt-10 px-6 sm:px-0">
            <a
              href="/shop"
              className="hero-fadeUp hero-btn-primary"
              style={{ animationDelay: '1.0s' }}
            >
              navegar
            </a>

            <a
              href="/about"
              className="hero-fadeUp hero-btn-ghost group"
              style={{ animationDelay: '1.1s' }}
            >
              <span>nossa história</span>
              <span className="hero-btn-ghost-dash" />
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── soft fade that eases the banner image into the aromatic bar ── */}
      <div
        className="absolute z-[2] bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '160px',
          background: 'linear-gradient(to bottom, rgba(41,36,31,0) 0%, rgba(41,36,31,0.55) 100%)',
        }}
      />

      {/* ── aromatics family bar ── */}
      <div
        className="absolute z-[3] bottom-0 left-0 right-0"
        style={{
          background: 'rgba(41,36,31,0.25)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(244,237,210,0.06)',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-[5rem] py-3">
          {/* family buttons row */}
          <div className="flex flex-nowrap md:flex-wrap items-center gap-2 aromatic-bar">
            <span
              className="loi-label mr-2 hidden md:inline"
              style={{ color: 'rgba(244,237,210,0.3)', whiteSpace: 'nowrap' }}
            >
              família aromática
            </span>
            {FAMILIES.map((fam) => {
              const isActive = activeFamily === fam.label;
              return (
                <GlareHover
                  key={fam.label}
                  width="auto"
                  height="auto"
                  background="transparent"
                  glareColor="#fcf5e0"
                  glareOpacity={0.18}
                  glareAngle={-45}
                  glareSize={250}
                  transitionDuration={600}
                  borderRadius="0px"
                  style={{ display: 'inline-block', flexShrink: 0 }}
                >
                  <button
                    onClick={() => setActiveFamily(isActive ? null : fam.label)}
                    className="shrink-0"
                    style={{
                      fontFamily: "'Sackers Gothic', sans-serif",
                      fontWeight: 300,
                      fontSize: '0.6rem',
                      letterSpacing: '0.18em',
                      color: isActive ? '#f4edd2' : 'rgba(244,237,210,0.4)',
                      background: 'transparent',
                      border: `1px solid ${isActive ? 'rgba(244,237,210,0.5)' : 'rgba(244,237,210,0.15)'}`,
                      padding: '5px 14px',
                      cursor: 'pointer',
                      transition: 'color 0.3s ease, border-color 0.3s ease',
                      scrollSnapAlign: 'start',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {fam.label}
                  </button>
                </GlareHover>
              );
            })}
          </div>

          {/* product links row — visible below the buttons when a family is active */}
          {activeFamily && (
            <div
              style={{
                fontFamily: "'Sackers Gothic', sans-serif",
                fontWeight: 300,
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'rgba(244,237,210,0.55)',
                marginTop: '0.5rem',
              }}
            >
              {FAMILIES.find((f) => f.label === activeFamily)?.products.map((product, i, arr) => (
                <span key={product.slug}>
                  <Link
                    to={`/product/${product.slug}`}
                    style={{ color: 'rgba(244,237,210,0.55)', textDecoration: 'none', transition: 'color 0.3s ease' }}
                    className="hover:!text-[#f4edd2]"
                  >
                    {product.name}
                  </Link>
                  {i < arr.length - 1 && <span style={{ opacity: 0.3, margin: '0 0.4em' }}>·</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
