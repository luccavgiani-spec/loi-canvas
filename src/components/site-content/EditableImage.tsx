import type { CSSProperties } from 'react';
import { useSiteContent } from '@/lib/site-content/hooks';

interface Props {
  pageKey: string;
  sectionKey: string;
  blockKey: string;
  fallbackSrc: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  loading?: 'eager' | 'lazy';
  decoding?: 'auto' | 'sync' | 'async';
}

const EditableImage = ({
  pageKey, sectionKey, blockKey, fallbackSrc,
  alt = '', className, style, loading = 'lazy', decoding = 'async',
}: Props) => {
  const { data } = useSiteContent(pageKey, sectionKey);
  const block = data?.[blockKey];
  if (block && !block.is_visible) return null;
  const src = block?.value_image_url ?? fallbackSrc;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      decoding={decoding}
    />
  );
};

export default EditableImage;
