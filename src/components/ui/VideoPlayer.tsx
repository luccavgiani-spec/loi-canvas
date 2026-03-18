import React, { useCallback, useState } from 'react';
import { useVideoAutoplay } from '@/hooks/useVideoAutoplay';
import { selectVideoSrc } from '@/lib/videoQuality';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  lowSrc?: string;
  className?: string;
  poster?: string;
  style?: React.CSSProperties;
  onLoadedData?: () => void;
  /** Preload strategy — use "metadata" for off-screen videos */
  preload?: 'auto' | 'metadata' | 'none';
}

/**
 * Componente de vídeo com autoplay robusto para mobile.
 * Exibe tap-to-play como fallback quando autoplay falha.
 */
export const VideoPlayer = React.forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ src, lowSrc, className, poster, style, onLoadedData, preload = 'auto' }, externalRef) => {
    const [status, setStatus] = useState<'loading' | 'playing' | 'failed'>('loading');

    const handleFailed = useCallback(() => setStatus('failed'), []);
    const internalRef = useVideoAutoplay(lowSrc, handleFailed);
    const initialSrc = selectVideoSrc(src, lowSrc);

    const setRef = useCallback(
      (node: HTMLVideoElement | null) => {
        (internalRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
        if (typeof externalRef === 'function') {
          externalRef(node);
        } else if (externalRef) {
          externalRef.current = node;
        }
      },
      [externalRef, internalRef],
    );

    const handlePlaying = useCallback(() => setStatus('playing'), []);

    const handleTapToPlay = useCallback(() => {
      const video = (internalRef as React.MutableRefObject<HTMLVideoElement | null>).current;
      if (video) {
        video.muted = true;
        video.play().then(() => setStatus('playing')).catch(() => {});
      }
    }, [internalRef]);

    return (
      <div className={className} style={{ ...style, position: 'relative' }}>
        <video
          ref={setRef}
          src={initialSrc}
          autoPlay
          muted
          loop
          playsInline
          preload={preload}
          disablePictureInPicture
          disableRemotePlayback
          poster={poster}
          className="w-full h-full object-cover"
          onLoadedData={onLoadedData}
          onPlaying={handlePlaying}
        />

        {/* Tap-to-play overlay — shown when autoplay fails after timeout */}
        {status === 'failed' && (
          <button
            onClick={handleTapToPlay}
            aria-label="Reproduzir vídeo"
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[2px] transition-opacity cursor-pointer"
          >
            <div className="rounded-full bg-white/80 p-4 shadow-lg">
              <Play className="h-8 w-8 text-foreground fill-foreground" />
            </div>
          </button>
        )}

        {/* Loading indicator — subtle pulse on poster */}
        {status === 'loading' && poster && (
          <div className="absolute inset-0 z-[5] pointer-events-none animate-pulse bg-black/5" />
        )}
      </div>
    );
  },
);

VideoPlayer.displayName = 'VideoPlayer';
