import { useState, useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import HomeSections from '@/components/home/HomeSections';
import HomeFooter from '@/components/home/HomeFooter';
import CartDrawer from '@/components/layout/CartDrawer';
import Header from '@/components/layout/Header';

const Index = () => {
  const [assetsReady, setAssetsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Only wait for the first hero video — the one that plays immediately.
    // Other videos and product images load in the background after render.
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;

    let resolved = false;
    const onReady = () => {
      if (resolved) return;
      resolved = true;
      if (mounted) setAssetsReady(true);
    };

    video.addEventListener('loadeddata', onReady, { once: true });
    // Fallback: don't block longer than 2s
    const timeout = setTimeout(onReady, 2000);
    video.addEventListener('loadeddata', () => clearTimeout(timeout), { once: true });

    video.src = '/hero/escritorio_cadeira__1_.mp4';
    video.load();

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, []);

  if (!assetsReady) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{ background: '#29241f' }}
      >
        <div
          style={{
            position: 'relative',
            width: 'clamp(80px, 12vw, 140px)',
            height: 'clamp(80px, 12vw, 140px)',
            marginBottom: '1.5rem',
          }}
        >
          <img
            src="/hero/SIMBOLO_t.png"
            alt=""
            width={140}
            height={140}
            className="loading-symbol-outline"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
          <img
            src="/hero/SIMBOLO_t.png"
            alt="Loiê"
            width={140}
            height={140}
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
