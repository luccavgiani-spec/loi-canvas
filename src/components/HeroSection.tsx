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
              fontFamily: "'Wagon', sans-serif",
              fontWeight: 300,
              fontSize: 'clamp(5rem, 12.5vw, 11rem)',
              lineHeight: 0.88,
            }}
          >
            <span className="block overflow-hidden">
              <span
                className="inline-block hero-wordReveal"
                style={{ color: '#565600', fontStyle: 'italic', animationDelay: '0.3s' }}
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
              fontStyle: 'italic',
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

      {/* ── bottom bar: scroll + symbol ── */}
      <div
        className="absolute z-[3] bottom-0 left-0 right-0 flex flex-col items-center gap-6 pb-[2rem] md:flex-row md:items-end md:justify-between md:px-[5rem] md:pb-[2.5rem]"
      >
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

      </div>
    </section>
  );
};

export default HeroSection;
