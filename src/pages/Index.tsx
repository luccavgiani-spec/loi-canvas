import { useState, useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import HomeSections from '@/components/home/HomeSections';
import HomeFooter from '@/components/home/HomeFooter';
import CartDrawer from '@/components/layout/CartDrawer';

const HERO_VIDEOS = [
  '/hero/escritorio_cadeira__1_.mp4',
  '/hero/Cartao_Postal_Loie_1.mp4',
  '/hero/Cartao_Postal_Loie.mp4',
  '/hero/Cartao_Postal_Loie_5.mp4',
  '/hero/Cartao_Postal_Loie_8.mp4',
];

const Index = () => {
  const [videosReady, setVideosReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    let loaded = 0;

    const promises = HERO_VIDEOS.map(
      (src) =>
        new Promise<void>((resolve) => {
          const video = document.createElement('video');
          video.preload = 'auto';
          video.muted = true;
          video.playsInline = true;

          const onReady = () => {
            loaded++;
            if (mounted) {
              setProgress(Math.round((loaded / HERO_VIDEOS.length) * 100));
            }
            resolve();
          };

          video.addEventListener('canplaythrough', onReady, { once: true });

          // fallback: if loadedmetadata fires but canplaythrough doesn't within 8s
          const timeout = setTimeout(() => {
            video.removeEventListener('canplaythrough', onReady);
            onReady();
          }, 8000);

          video.addEventListener('canplaythrough', () => clearTimeout(timeout), { once: true });

          video.src = src;
          video.load();
        }),
    );

    Promise.all(promises).then(() => {
      if (mounted) setVideosReady(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!videosReady) {
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
      <CartDrawer />
      <HeroSection />
      <HomeSections />
      <HomeFooter />
    </>
  );
};

export default Index;
