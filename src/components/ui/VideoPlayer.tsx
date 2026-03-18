import React, { useCallback } from 'react';
import { useVideoAutoplay } from '@/hooks/useVideoAutoplay';
import { selectVideoSrc } from '@/lib/videoQuality';

interface VideoPlayerProps {
  src: string;
  lowSrc?: string;
  className?: string;
  poster?: string;
  style?: React.CSSProperties;
  onLoadedData?: () => void;
}

/**
 * Componente de vídeo que garante reprodução em mobile,
 * com degradação automática de qualidade quando necessário.
 * Suporta forwardRef para que consumidores externos possam
 * acessar o elemento de vídeo (ex: About.tsx useScrollVideo).
 */
export const VideoPlayer = React.forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ src, lowSrc, className, poster, style, onLoadedData }, externalRef) => {
    const internalRef = useVideoAutoplay(lowSrc);
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

    return (
      <video
        ref={setRef}
        src={initialSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        poster={poster}
        className={className}
        style={style}
        onLoadedData={onLoadedData}
      />
    );
  },
);

VideoPlayer.displayName = 'VideoPlayer';
