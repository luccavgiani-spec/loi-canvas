import { useState, useEffect } from 'react';
import { bannerUrl } from '@/lib/storage';

/* ─── olfactory families ─── */
const FAMILIES = [
  'cítricos e frescos',
  'verdes e verbais',
  'florais',
  'amadeirados',
  'especiados e quentes',
  'gourmand e conforto',
];

/* ─── banner images ─── */
const BANNER_IMAGES = [
  bannerUrl('banners (1).webp'),
  bannerUrl('banners (1) (1).webp'),
  bannerUrl('banners (2).webp'),
  bannerUrl('banners (3).webp'),
  bannerUrl('banners (4).webp'),
  bannerUrl('banners (5).webp'),
  bannerUrl('banners (6).webp'),
  bannerUrl('banners (7).webp'),
  bannerUrl('banners (8).webp'),
];

/* ─── grain SVG data URI ─── */
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`;

/* ─── component ─── */
const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [activeFamily, setActiveFamily] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNER_IMAGES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      className="relative w-full h-screen overflow-hidden"
      style={{ background: '#29241f' }}
    >
      {/* ── banner images ── */}
      {BANNER_IMAGES.map((src, i) => (
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
        <div className="flex flex-col items-center text-center" style={{ maxWidth: 1000 }}>
          <h1
            style={{
              fontFamily: "'Wagon', sans-serif",
              fontWeight: 300,
              fontSize: 'clamp(5rem, 12.5vw, 11rem)',
              lineHeight: 0.88,
            }}
          >
            <span className="block overflow-hidden">
              <span
                className="inline-block hero-wordReveal"
                style={{ color: '#565600', animationDelay: '0.3s' }}
              >
                o aroma é
              </span>
            </span>
            <span className="block overflow-hidden">
              <span
                className="inline-block hero-wordReveal"
                style={{ color: '#f4edd2', animationDelay: '0.45s' }}
              >
                uma linguagem.
              </span>
            </span>
          </h1>

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

      {/* ── aromatics family bar ── */}
      <div
        className="absolute z-[3] bottom-0 left-0 right-0"
        style={{
          background: 'rgba(41,36,31,0.35)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(244,237,210,0.08)',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-[5rem] py-3 flex flex-wrap items-center gap-2">
          <span
            className="loi-label mr-2 hidden md:inline"
            style={{ color: 'rgba(244,237,210,0.3)', whiteSpace: 'nowrap' }}
          >
            família aromática
          </span>
          {FAMILIES.map((fam) => {
            const isActive = activeFamily === fam;
            return (
              <button
                key={fam}
                onClick={() => setActiveFamily(isActive ? null : fam)}
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
                }}
              >
                {fam}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
