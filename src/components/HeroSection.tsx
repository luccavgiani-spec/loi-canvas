import { useRef, useEffect, useState } from 'react';

/* ─── video config ─── */
const VIDEOS = [
  { src: '/hero/escritorio_cadeira__1_.mp4',     playbackRate: 1.0, sat: 0.65, bri: 0.60, con: 1.05 },
  { src: '/hero/Cartao_Postal_Loie_1.mp4',       playbackRate: 0.5, sat: 0.55, bri: 0.55, con: 1.10 },
  { src: '/hero/Cartao_Postal_Loie.mp4',         playbackRate: 0.5, sat: 0.58, bri: 0.52, con: 1.12 },
  { src: '/hero/Cartao_Postal_Loie_5.mp4',       playbackRate: 0.5, sat: 0.55, bri: 0.54, con: 1.10 },
  { src: '/hero/Cartao_Postal_Loie_8.mp4',       playbackRate: 0.5, sat: 0.55, bri: 0.53, con: 1.11 },
];

const CROSSFADE_MS = 2000;
const NEUTRAL = { sat: 0.18, bri: 0.28, con: 1.00 };

/* ─── pure helpers (module scope) ─── */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function buildFilter(sat: number, bri: number, con: number) {
  return `saturate(${sat}) brightness(${bri}) contrast(${con})`;
}

function animateFilter(
  el: HTMLVideoElement,
  from: { sat: number; bri: number; con: number },
  to: { sat: number; bri: number; con: number },
  durationMs: number,
  onDone?: () => void,
) {
  const start = performance.now();
  function tick(now: number) {
    const raw = Math.min((now - start) / durationMs, 1);
    const t = easeInOut(raw);
    el.style.filter = buildFilter(
      lerp(from.sat, to.sat, t),
      lerp(from.bri, to.bri, t),
      lerp(from.con, to.con, t),
    );
    if (raw < 1) {
      requestAnimationFrame(tick);
    } else {
      onDone?.();
    }
  }
  requestAnimationFrame(tick);
}

function doTransition(
  videos: (HTMLVideoElement | null)[],
  fromIdx: number,
  toIdx: number,
  onDone: () => void,
) {
  const outEl = videos[fromIdx];
  const inEl = videos[toIdx];
  if (!outEl || !inEl) return;

  const outCfg = VIDEOS[fromIdx];
  const inCfg = VIDEOS[toIdx];
  const half = CROSSFADE_MS / 2;

  // fade out current → neutral
  animateFilter(outEl, { sat: outCfg.sat, bri: outCfg.bri, con: outCfg.con }, NEUTRAL, half, () => {
    outEl.style.opacity = '0';
    outEl.pause();
    outEl.currentTime = 0;

    // prepare incoming
    inEl.style.filter = buildFilter(NEUTRAL.sat, NEUTRAL.bri, NEUTRAL.con);
    inEl.style.opacity = '1';
    inEl.playbackRate = inCfg.playbackRate;
    inEl.play().catch(() => {});

    // fade in → target
    animateFilter(inEl, NEUTRAL, { sat: inCfg.sat, bri: inCfg.bri, con: inCfg.con }, half, onDone);
  });
}

function scheduleNext(
  videos: (HTMLVideoElement | null)[],
  currentIdxRef: { current: number },
  isTransitioningRef: { current: boolean },
  timerRef: { current: number | null },
) {
  const el = videos[currentIdxRef.current];
  if (!el) return;

  function check() {
    if (!el || el.paused) return;
    const remaining = el.duration - el.currentTime;
    if (remaining <= 1) {
      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;
      const nextIdx = (currentIdxRef.current + 1) % VIDEOS.length;
      doTransition(videos, currentIdxRef.current, nextIdx, () => {
        currentIdxRef.current = nextIdx;
        isTransitioningRef.current = false;
        scheduleNext(videos, currentIdxRef, isTransitioningRef, timerRef);
      });
    } else {
      timerRef.current = window.setTimeout(check, Math.max(50, (remaining - 1.2) * 1000));
    }
  }
  check();
}

/* ─── grain SVG data URI ─── */
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`;

/* ─── component ─── */
const HeroSection = () => {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const currentIdx = useRef(0);
  const isTransitioning = useRef(false);
  const timerRef = useRef<number | null>(null);
  const [activeScene, setActiveScene] = useState(0);

  // sync activeScene with currentIdx for indicator
  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveScene(currentIdx.current);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const vids = videoRefs.current;

    // wait for all loadedmetadata
    let mounted = true;
    const promises = vids.map(
      (v) =>
        new Promise<void>((resolve) => {
          if (!v) { resolve(); return; }
          if (v.readyState >= 1) { resolve(); return; }
          const handler = () => { v.removeEventListener('loadedmetadata', handler); resolve(); };
          v.addEventListener('loadedmetadata', handler);
        }),
    );

    Promise.all(promises).then(() => {
      if (!mounted) return;

      // apply initial filters & hide all
      vids.forEach((v, i) => {
        if (!v) return;
        const c = VIDEOS[i];
        v.style.filter = buildFilter(c.sat, c.bri, c.con);
        v.style.opacity = '0';
        v.playbackRate = c.playbackRate;
      });

      // start first
      const first = vids[0];
      if (first) {
        first.style.opacity = '1';
        first.play().catch(() => {});
        scheduleNext(vids, currentIdx, isTransitioning, timerRef);
      }
    });

    return () => {
      mounted = false;
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      vids.forEach((v) => { if (v) { v.pause(); } });
    };
  }, []);

  const jumpToScene = (idx: number) => {
    if (idx === currentIdx.current || isTransitioning.current) return;
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    isTransitioning.current = true;
    const vids = videoRefs.current;
    doTransition(vids, currentIdx.current, idx, () => {
      currentIdx.current = idx;
      isTransitioning.current = false;
      scheduleNext(vids, currentIdx, isTransitioning, timerRef);
    });
  };

  return (
    <section className="relative w-full h-screen overflow-hidden" style={{ background: '#29241f' }}>
      {/* ── videos ── */}
      {VIDEOS.map((v, i) => (
        <video
          key={v.src}
          ref={(el) => { videoRefs.current[i] = el; }}
          src={v.src}
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0, transition: 'none' }}
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

      {/* ── navbar ── */}
      <nav className="absolute top-0 left-0 right-0 z-[5]">
        {/* logo */}
        <div
          className="absolute hero-fadeDown"
          style={{ left: '45%', transform: 'translateX(-50%)', height: '5rem', display: 'flex', alignItems: 'center', animationDelay: '0.3s' }}
        >
          <img
            src="/hero/LOGO_BRANCA_t.png"
            alt="Loie"
            style={{ width: 'clamp(80px, 9vw, 130px)', height: 'auto' }}
          />
        </div>

        {/* nav left */}
        <div
          className="absolute flex gap-8 hero-fadeDown"
          style={{ left: '5rem', top: 0, height: '5rem', alignItems: 'center', animationDelay: '0.5s' }}
        >
          <a href="/shop" className="hero-nav-link">coleção</a>
          <a href="/about" className="hero-nav-link">sobre</a>
        </div>

        {/* nav right */}
        <div
          className="absolute flex gap-8 hero-fadeDown"
          style={{ right: '5rem', top: 0, height: '5rem', alignItems: 'center', animationDelay: '0.5s' }}
        >
          <a href="/shop" className="hero-nav-link">loja</a>
          <a href="/contact" className="hero-nav-link">contato</a>
        </div>
      </nav>

      {/* ── central content ── */}
      <div
        className="relative z-[2] flex flex-col items-center justify-center h-full"
        style={{ paddingTop: '5rem' }}
      >
        <div className="flex flex-col items-center text-center" style={{ maxWidth: 1000 }}>
          {/* title h1 */}
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: 'clamp(5rem, 12.5vw, 11rem)',
              lineHeight: 0.88,
            }}
          >
            {/* line 1 */}
            <span className="block overflow-hidden">
              <span
                className="inline-block hero-wordReveal"
                style={{ color: '#f4edd2', animationDelay: '1.05s' }}
              >
                atmosferas
              </span>
            </span>
            {/* line 2 */}
            <span className="block overflow-hidden">
              <span
                className="inline-block hero-wordReveal"
                style={{ color: '#989857', fontStyle: 'italic', animationDelay: '1.20s' }}
              >
                que
              </span>
            </span>
            {/* line 3 */}
            <span className="block overflow-hidden">
              <span
                className="inline-block hero-wordReveal"
                style={{ color: '#f4edd2', animationDelay: '1.35s' }}
              >
                ficam.
              </span>
            </span>
          </h1>

          {/* subtitle */}
          <p
            className="hero-fadeUp mt-8"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
              color: 'rgba(244,237,210,0.6)',
              lineHeight: 1.7,
              animationDelay: '1.6s',
            }}
          >
            Cada vela é uma narrativa. Cada aroma, uma porta.
            <br />
            Feitas à mão, com essência e intenção.
          </p>

          {/* buttons */}
          <div className="flex items-center gap-8 mt-10">
            {/* primary button */}
            <a
              href="/shop"
              className="hero-fadeUp hero-btn-primary"
              style={{ animationDelay: '1.75s' }}
            >
              explorar coleção
            </a>

            {/* ghost button */}
            <a
              href="/about"
              className="hero-fadeUp hero-btn-ghost group"
              style={{ animationDelay: '1.85s' }}
            >
              <span>nossa história</span>
              <span className="hero-btn-ghost-dash" />
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── scene indicator ── */}
      <div
        className="absolute z-[3] flex flex-col gap-2 hero-fadeUp"
        style={{ bottom: '2.5rem', left: '5rem', animationDelay: '2.1s' }}
      >
        <span
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 300,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(244,237,210,0.3)',
            fontSize: '0.65rem',
          }}
        >
          cena
        </span>
        <div className="flex gap-1.5">
          {VIDEOS.map((_, i) => (
            <button
              key={i}
              onClick={() => jumpToScene(i)}
              aria-label={`Cena ${i + 1}`}
              style={{ paddingTop: 6, paddingBottom: 6, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <span
                style={{
                  display: 'block',
                  height: 2,
                  width: activeScene === i ? 36 : 20,
                  borderRadius: 1,
                  backgroundColor: activeScene === i ? 'rgba(152,152,87,0.9)' : 'rgba(152,152,87,0.3)',
                  transition: 'all 0.4s ease',
                }}
                className="hover:!bg-[rgba(152,152,87,0.6)]"
              />
            </button>
          ))}
        </div>
      </div>

      {/* ── brand symbol ── */}
      <div
        className="absolute z-[3] hero-fadeIn group"
        style={{ bottom: '3rem', right: '5rem', width: 80, height: 80, animationDelay: '2.2s' }}
      >
        {/* glow */}
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(244,237,210,0.15) 0%, transparent 70%)',
            transition: '550ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />
        <img
          src="/hero/SIMBOLO_t.png"
          alt=""
          className="absolute inset-0 w-full h-full object-contain"
          style={{
            opacity: 1,
            transition: '550ms cubic-bezier(0.4,0,0.2,1)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0'; e.currentTarget.style.transform = 'scale(1.1) rotate(4deg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; }}
        />
        <img
          src="/hero/SIMBOLO_2_t.png"
          alt=""
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{
            opacity: 0,
            transition: '550ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />
        {/* hover controller on container */}
        <div
          className="absolute inset-0"
          onMouseEnter={() => {
            const container = document.querySelector('.hero-fadeIn.group') as HTMLElement;
            if (!container) return;
            const imgs = container.querySelectorAll('img');
            if (imgs[0]) { imgs[0].style.opacity = '0'; imgs[0].style.transform = 'scale(1.1) rotate(4deg)'; }
            if (imgs[1]) { imgs[1].style.opacity = '1'; imgs[1].style.transform = 'scale(1) rotate(0deg)'; imgs[1].style.filter = 'drop-shadow(0 0 8px rgba(244,237,210,0.4))'; }
          }}
          onMouseLeave={() => {
            const container = document.querySelector('.hero-fadeIn.group') as HTMLElement;
            if (!container) return;
            const imgs = container.querySelectorAll('img');
            if (imgs[0]) { imgs[0].style.opacity = '1'; imgs[0].style.transform = 'scale(1) rotate(0deg)'; }
            if (imgs[1]) { imgs[1].style.opacity = '0'; imgs[1].style.transform = ''; imgs[1].style.filter = ''; }
          }}
        />
      </div>
    </section>
  );
};

export default HeroSection;
