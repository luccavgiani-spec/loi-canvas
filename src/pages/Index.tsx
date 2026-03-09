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
        {/* Logo */}
        <img
          src="/hero/LOGO_BRANCA_t.png"
          alt="Loiê"
          style={{
            width: 'clamp(100px, 12vw, 160px)',
            height: 'auto',
            marginBottom: '2.5rem',
            opacity: 0.8,
          }}
        />

        {/* Progress bar */}
        <div
          style={{
            width: 'clamp(140px, 20vw, 200px)',
            height: 2,
            background: 'rgba(244,237,210,0.1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: '#8B6914',
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        {/* Loading text */}
        <p
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 300,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            fontSize: '0.6rem',
            color: 'rgba(244,237,210,0.3)',
            marginTop: '1rem',
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
