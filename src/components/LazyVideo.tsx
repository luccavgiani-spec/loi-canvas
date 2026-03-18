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
 * LazyVideo: only mounts the <video> element when it enters (or nears)
 * the viewport. Pauses and removes src when it leaves to free memory
 * and network bandwidth.
 */
const LazyVideo = memo(({
  src,
  poster,
  className,
  style,
  width,
  height,
  rootMargin = '200px 0px',
}: LazyVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isVisible) {
      videoRef.current?.pause();
      return;
    }

    const tryPlay = () => { v.play().catch(() => {}); };

    if (v.readyState >= 3) {
      tryPlay();
    } else {
      v.addEventListener('canplay', tryPlay, { once: true });
      return () => v.removeEventListener('canplay', tryPlay);
    }
  }, [isVisible]);

  return (
    <div ref={containerRef} className={className} style={style}>
      {isVisible ? (
        <VideoPlayer
          ref={videoRef}
          src={src}
          poster={poster}
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
