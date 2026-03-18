import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook que garante que um elemento <video> comece a tocar,
 * com retry infinito (backoff exponencial) e degradação de qualidade.
 * Dispara onPlaybackFailed após timeout para exibir tap-to-play.
 */
export function useVideoAutoplay(
  lowSrc?: string,
  onPlaybackFailed?: () => void,
  failTimeout = 12000,
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playingRef = useRef(false);
  const unmountedRef = useRef(false);

  const tryPlay = useCallback(async (video: HTMLVideoElement, attempt = 0) => {
    if (unmountedRef.current || playingRef.current) return;

    // Ensure critical attributes
    video.muted = true;
    video.playsInline = true;

    try {
      await video.play();
      playingRef.current = true;
    } catch {
      if (unmountedRef.current) return;

      // After several attempts with high-quality, try low-quality
      if (attempt === 4 && lowSrc && video.src !== lowSrc) {
        video.src = lowSrc;
        video.load();
      }

      // Backoff: 300, 600, 1200, 2400, 4000, 4000, ...
      const delay = Math.min(300 * Math.pow(2, attempt), 4000);
      setTimeout(() => tryPlay(video, attempt + 1), delay);
    }
  }, [lowSrc]);

  useEffect(() => {
    unmountedRef.current = false;
    playingRef.current = false;
    const video = videoRef.current;
    if (!video) return;

    // Fail timeout — trigger tap-to-play fallback
    const failTimer = setTimeout(() => {
      if (!playingRef.current && onPlaybackFailed) {
        onPlaybackFailed();
      }
    }, failTimeout);

    const startPlay = () => tryPlay(video);

    // Use canplaythrough for more reliable playback on mobile
    if (video.readyState >= 4) {
      startPlay();
    } else {
      video.addEventListener('canplaythrough', startPlay, { once: true });
      // Also try on loadeddata as a secondary trigger
      video.addEventListener('loadeddata', startPlay, { once: true });
    }

    // Retry when tab becomes visible again
    const handleVisibility = () => {
      if (!document.hidden && video.paused && !unmountedRef.current) {
        playingRef.current = false;
        tryPlay(video);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Retry when video enters viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && video.paused && !unmountedRef.current) {
          playingRef.current = false;
          tryPlay(video);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(video);

    return () => {
      unmountedRef.current = true;
      clearTimeout(failTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      observer.disconnect();
      video.removeEventListener('canplaythrough', startPlay);
      video.removeEventListener('loadeddata', startPlay);
    };
  }, [lowSrc, tryPlay, onPlaybackFailed, failTimeout]);

  return videoRef;
}
