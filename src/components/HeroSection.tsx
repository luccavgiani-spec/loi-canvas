import { storageUrl } from '@/lib/storage';
import { VideoPlayer } from '@/components/ui/VideoPlayer';

/* ─── video config ─── */
const VIDEO_SRC = storageUrl('escritorio_cadeira__1_.mp4');

/* ─── grain SVG data URI ─── */
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`;

/* ─── component ─── */
const HeroSection = () => {

  return (
    <section
      className="relative w-full h-screen overflow-hidden"
      style={{ background: '#29241f' }}
    >
      {/* ── video ── */}
      <VideoPlayer
        src={VIDEO_SRC}
        poster="/hero/hero-poster.jpg"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: 'saturate(0.65) brightness(0.60) contrast(1.05)',
        }}
      />

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
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: 'clamp(5rem, 12.5vw, 11rem)',
              lineHeight: 0.88,
            }}
          >
            <span className="block overflow-hidden">
              <span
                className="inline-block hero-wordReveal"
                style={{ color: '#f4edd2', animationDelay: '0.3s' }}
              >
                atmosferas
              </span>
            </span>
            <span className="block overflow-hidden">
              <span
                className="inline-block hero-wordReveal"
                style={{ color: '#565600', fontStyle: 'italic', animationDelay: '0.45s' }}
              >
                que
              </span>
            </span>
            <span className="block overflow-hidden">
              <span
                className="inline-block hero-wordReveal"
                style={{ color: '#f4edd2', animationDelay: '0.6s' }}
              >
                ficam.
              </span>
            </span>
          </h1>

          <p
            className="hero-fadeUp mt-8"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
              color: 'rgba(244,237,210,0.6)',
              lineHeight: 1.7,
              animationDelay: '0.85s',
            }}
          >
            Cada vela é uma narrativa. Cada aroma, uma porta.
            <br />
            Feitas à mão, com essência e intenção.
          </p>

          <div className="flex items-center gap-4 sm:gap-8 mt-10 px-6 sm:px-0">
            <a
              href="/shop"
              className="hero-fadeUp hero-btn-primary"
              style={{ animationDelay: '1.0s' }}
            >
              explorar coleção
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

      {/* ── bottom bar: scroll + symbol ── */}
      <div
        className="absolute z-[3] bottom-0 left-0 right-0 flex flex-col items-center gap-6 pb-[2rem] md:flex-row md:items-end md:justify-between md:px-[5rem] md:pb-[2.5rem]"
      >
        {/* spacer for left alignment (desktop only) */}
        <div className="hidden md:block" />

        {/* scroll indicator */}
        <div
          className="scroll-indicator flex flex-col items-center gap-2 hero-fadeUp"
          style={{ color: 'rgba(244,237,210,0.3)', animationDelay: '1.4s' }}
        >
          <span className="loi-label" style={{ color: 'rgba(244,237,210,0.3)' }}>scroll</span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M8 4v12M4 12l4 4 4-4" />
          </svg>
        </div>

        {/* brand symbol */}
        <div
          className="hero-fadeIn hero-symbol-wrapper group md:!m-0"
          style={{ width: 80, height: 80, animationDelay: '1.5s', position: 'relative', margin: '0 auto' }}
        >
          {/* Glow - desktop: hover, mobile: constant pulse */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none hidden md:block opacity-0 group-hover:opacity-100"
            style={{
              background: 'radial-gradient(circle, rgba(86,86,0,0.25) 0%, transparent 70%)',
              transition: '550ms cubic-bezier(0.4,0,0.2,1)',
            }}
          />
          <div
            className="absolute inset-0 rounded-full pointer-events-none md:hidden hero-symbol-glow"
            style={{
              background: 'radial-gradient(circle, rgba(86,86,0,0.3) 0%, transparent 70%)',
            }}
          />

          {/* Default symbol (outline) */}
          <img
            src="/hero/SIMBOLO_t.png"
            alt=""
            width={80}
            height={80}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-contain md:opacity-100 opacity-0"
            style={{
              transition: '550ms cubic-bezier(0.4,0,0.2,1)',
            }}
          />
          {/* Green symbol - desktop: shown on hover, mobile: always visible with pulse */}
          <img
            src="/hero/SIMBOLO_2_t.png"
            alt=""
            width={80}
            height={80}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none md:opacity-0 hero-symbol-green"
            style={{
              transition: '550ms cubic-bezier(0.4,0,0.2,1)',
              filter: 'drop-shadow(0 0 6px rgba(86,86,0,0.4))',
            }}
          />
          {/* Desktop hover trigger */}
          <div
            className="absolute inset-0 hidden md:block"
            onMouseEnter={() => {
              const container = document.querySelector('.hero-symbol-wrapper') as HTMLElement;
              if (!container) return;
              const imgs = container.querySelectorAll('img');
              if (imgs[0]) { imgs[0].style.opacity = '0'; imgs[0].style.transform = 'scale(1.1) rotate(4deg)'; }
              if (imgs[1]) { imgs[1].style.opacity = '1'; imgs[1].style.transform = 'scale(1) rotate(0deg)'; imgs[1].style.filter = 'drop-shadow(0 0 8px rgba(86,86,0,0.5))'; }
            }}
            onMouseLeave={() => {
              const container = document.querySelector('.hero-symbol-wrapper') as HTMLElement;
              if (!container) return;
              const imgs = container.querySelectorAll('img');
              if (imgs[0]) { imgs[0].style.opacity = '1'; imgs[0].style.transform = 'scale(1) rotate(0deg)'; }
              if (imgs[1]) { imgs[1].style.opacity = '0'; imgs[1].style.transform = ''; imgs[1].style.filter = ''; }
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
