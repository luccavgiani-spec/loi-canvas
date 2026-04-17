import { type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ArrowLinkProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const ArrowLink = ({ children, className, style }: ArrowLinkProps) => {
  return (
    <span
      className={cn(
        'group/arrow inline-flex items-center gap-2 uppercase',
        className,
      )}
      style={{
        fontFamily: "'Sackers Gothic', sans-serif",
        fontSize: '0.65rem',
        letterSpacing: '0.18em',
        color: 'currentColor',
        ...style,
      }}
    >
      {children}
      <span
        aria-hidden="true"
        className="inline-block transition-transform duration-300 ease-out group-hover/arrow:translate-x-[6px]"
      >
        →
      </span>
    </span>
  );
};

export default ArrowLink;
