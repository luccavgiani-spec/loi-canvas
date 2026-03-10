import { useState, useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import HomeSections from '@/components/home/HomeSections';
import HomeFooter from '@/components/home/HomeFooter';
import CartDrawer from '@/components/layout/CartDrawer';
import Header from '@/components/layout/Header';
import { mockProducts } from '@/lib/mocks';

const HERO_VIDEOS = [
  '/hero/escritorio_cadeira__1_.mp4',
  '/hero/Cartao_Postal_Loie_1.mp4',
  '/hero/Cartao_Postal_Loie.mp4',
  '/hero/Cartao_Postal_Loie_5.mp4',
  '/hero/Cartao_Postal_Loie_8.mp4',
];

/* Collect all unique product images used on the homepage */
const PRODUCT_IMAGES = Array.from(
  new Set(mockProducts.flatMap((p) => p.images)),
);

const Index = () => {
  const [assetsReady, setAssetsReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    let loaded = 0;
    const totalAssets = HERO_VIDEOS.length + PRODUCT_IMAGES.length;

    const tick = () => {
      loaded++;
      if (mounted) {
        setProgress(Math.round((loaded / totalAssets) * 100));
      }
    };

    /* ── Preload videos ── */
    const videoPromises = HERO_VIDEOS.map(
      (src) =>
        new Promise<void>((resolve) => {
          const video = document.createElement('video');
          video.preload = 'auto';
          video.muted = true;
          video.playsInline = true;

          let resolved = false;
          const onReady = () => {
            if (resolved) return;
            resolved = true;
            tick();
            resolve();
          };

          // Use 'loadeddata' instead of 'canplaythrough' — mobile browsers
          // often refuse to buffer enough data for canplaythrough to fire,
          // especially when preload="auto" is downgraded to "metadata".
          video.addEventListener('loadeddata', onReady, { once: true });
          video.addEventListener('canplaythrough', onReady, { once: true });

          // Shorter fallback timeout (3s) — videos are small after compression
          const timeout = setTimeout(onReady, 3000);
          video.addEventListener('loadeddata', () => clearTimeout(timeout), { once: true });

          video.src = src;
          video.load();
        }),
    );

    /* ── Preload product images ── */
    const imagePromises = PRODUCT_IMAGES.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          let resolved = false;
          const onReady = () => {
            if (resolved) return;
            resolved = true;
            tick();
            resolve();
          };
          img.onload = onReady;
          img.onerror = onReady; // don't block on broken images
          // Fallback timeout for images too
          const timeout = setTimeout(onReady, 4000);
          img.onload = () => { clearTimeout(timeout); onReady(); };
          img.src = src;
        }),
    );

    Promise.all([...videoPromises, ...imagePromises]).then(() => {
      if (mounted) setAssetsReady(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!assetsReady) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{ background: '#29241f' }}
      >
        {/* Brand symbol with fill-up animation */}
        <div
          style={{
            position: 'relative',
            width: 'clamp(80px, 12vw, 140px)',
            height: 'clamp(80px, 12vw, 140px)',
            marginBottom: '1.5rem',
          }}
        >
          {/* Outline (dim) */}
          <img
            src="/hero/SIMBOLO_t.png"
            alt=""
            className="loading-symbol-outline"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
          {/* Filled version — clips from bottom to top */}
          <img
            src="/hero/SIMBOLO_t.png"
            alt="Loiê"
            className="loading-symbol-fill"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              opacity: 0.85,
            }}
          />
        </div>

        {/* Subtle loading text */}
        <p
          className="loading-pulse"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 300,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            fontSize: '0.55rem',
            color: 'rgba(244,237,210,0.25)',
            marginTop: '0.5rem',
          }}
        >
          carregando experiência
        </p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <CartDrawer />
      <HeroSection />
      <HomeSections />
      <HomeFooter />
    </>
  );
};

export default Index;
