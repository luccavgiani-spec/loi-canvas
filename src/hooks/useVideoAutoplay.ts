import { useEffect, useRef } from 'react';

/**
 * Hook que garante que um elemento <video> comece a tocar,
 * com fallback de tentativas e degradação de qualidade.
 */
export function useVideoAutoplay(lowSrc?: string) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Garante atributos críticos programaticamente (redundância)
    video.muted = true;
    video.playsInline = true;

    let attempts = 0;
    const maxAttempts = 3;

    const tryPlay = async () => {
      attempts++;
      try {
        await video.play();
      } catch (err) {
        if (attempts < maxAttempts) {
          // Aguarda 500ms e tenta novamente
          setTimeout(tryPlay, 500);
        } else if (lowSrc && video.src !== lowSrc) {
          // Última tentativa: troca para versão de baixa qualidade
          video.src = lowSrc;
          video.load();
          try {
            await video.play();
          } catch {
            // Falhou mesmo com low quality — nada mais a fazer
          }
        }
      }
    };

    // Tenta reproduzir quando o componente monta
    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('canplay', tryPlay, { once: true });
    }

    // Retry ao visibilidade da aba voltar (usuário volta pro app)
    const handleVisibility = () => {
      if (!document.hidden && video.paused) {
        tryPlay();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Retry ao IntersectionObserver (vídeo entra na viewport)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && video.paused) {
            tryPlay();
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(video);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      observer.disconnect();
    };
  }, [lowSrc]);

  return videoRef;
}
