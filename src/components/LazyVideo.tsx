import { useRef, useEffect, useState, memo } from 'react';

interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  style?: React.CSSProperties;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  autoPlay?: boolean;
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
  muted = true,
  loop = true,
  playsInline = true,
  autoPlay = true,
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
    if (!v) return;

    if (isVisible) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [isVisible]);

  return (
    <div ref={containerRef} className={className} style={style}>
      {isVisible ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted={muted}
          loop={loop}
          playsInline={playsInline}
          autoPlay={autoPlay}
          preload="none"
          width={width}
          height={height}
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
