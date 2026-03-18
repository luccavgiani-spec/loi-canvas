import { useRef, useEffect, useState, memo } from 'react';
import { VideoPlayer } from '@/components/ui/VideoPlayer';

interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  rootMargin?: string;
}

/**
 * LazyVideo: mounts the <video> once when first visible, then keeps it
 * in the DOM (pausing when off-screen) to preserve the buffer.
 */
const LazyVideo = memo(({
  src,
  poster,
  className,
  style,
  rootMargin = '200px 0px',
}: LazyVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Track visibility
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);
        if (visible) setMounted(true); // mount once, never unmount
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  // Pause/resume based on visibility (don't unmount)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (isVisible) {
      const tryPlay = () => { v.play().catch(() => {}); };
      if (v.readyState >= 3) {
        tryPlay();
      } else {
        v.addEventListener('canplay', tryPlay, { once: true });
        return () => v.removeEventListener('canplay', tryPlay);
      }
    } else {
      v.pause();
    }
  }, [isVisible]);

  return (
    <div ref={containerRef} className={className} style={style}>
      {mounted ? (
        <VideoPlayer
          ref={videoRef}
          src={src}
          poster={poster}
          preload={isVisible ? 'auto' : 'metadata'}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : poster ? (
        <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : null}
    </div>
  );
});

LazyVideo.displayName = 'LazyVideo';

export default LazyVideo;
