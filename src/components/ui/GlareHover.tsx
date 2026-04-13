import React, { useRef } from 'react';
import './GlareHover.css';

interface GlareHoverProps {
  children: React.ReactNode;
  width?: string;
  height?: string;
  background?: string;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  borderRadius?: string;
  style?: React.CSSProperties;
  className?: string;
}

const GlareHover: React.FC<GlareHoverProps> = ({
  children,
  width = 'auto',
  height = 'auto',
  background = 'transparent',
  glareColor = '#ffffff',
  glareOpacity = 0.2,
  glareAngle = -45,
  glareSize = 300,
  transitionDuration = 600,
  borderRadius = '0px',
  style = {},
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !glareRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glareRef.current.style.left = `${x}px`;
    glareRef.current.style.top = `${y}px`;
    glareRef.current.style.opacity = String(glareOpacity);
  };

  const handleMouseLeave = () => {
    if (!glareRef.current) return;
    glareRef.current.style.opacity = '0';
  };

  return (
    <div
      ref={containerRef}
      className={`glare-hover-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width,
        height,
        background,
        borderRadius,
        ...style,
      }}
    >
      {children}
      <div
        ref={glareRef}
        className="glare-hover-effect"
        style={{
          position: 'absolute',
          width: `${glareSize}px`,
          height: `${glareSize}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glareColor} 0%, transparent 70%)`,
          transform: `translate(-50%, -50%) rotate(${glareAngle}deg)`,
          pointerEvents: 'none',
          opacity: 0,
          transition: `opacity ${transitionDuration}ms ease`,
        }}
      />
    </div>
  );
};

export default GlareHover;
