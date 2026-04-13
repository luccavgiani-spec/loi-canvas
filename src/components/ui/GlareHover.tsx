import { useRef, CSSProperties, ReactNode } from "react";

interface GlareHoverProps {
  children?: ReactNode;
  width?: string | number;
  height?: string | number;
  background?: string;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  borderRadius?: string;
  className?: string;
  style?: CSSProperties;
}

const GlareHover = ({
  children,
  width = "auto",
  height = "auto",
  background = "transparent",
  glareColor = "#ffffff",
  glareOpacity = 0.25,
  glareAngle = -45,
  glareSize = 300,
  transitionDuration = 800,
  borderRadius = "0px",
  className = "",
  style = {},
}: GlareHoverProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    const glare = glareRef.current;
    if (!container || !glare) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    glare.style.setProperty("--glare-x", `${x}px`);
    glare.style.setProperty("--glare-y", `${y}px`);
    glare.style.opacity = String(glareOpacity);
  };

  const handleMouseLeave = () => {
    const glare = glareRef.current;
    if (glare) glare.style.opacity = "0";
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        width,
        height,
        background,
        borderRadius,
        overflow: "hidden",
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <div
        ref={glareRef}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          pointerEvents: "none",
          transition: `opacity ${transitionDuration}ms ease`,
          background: `radial-gradient(circle ${glareSize}px at var(--glare-x, 50%) var(--glare-y, 50%), ${glareColor}, transparent)`,
          transform: `rotate(${glareAngle}deg) scale(2)`,
          borderRadius,
        }}
      />
    </div>
  );
};

export default GlareHover;
