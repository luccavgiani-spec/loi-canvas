import { Link } from 'react-router-dom';
import Plasma from '@/components/ui/Plasma';
import { useState, useEffect } from 'react';

const SLIDES = [
  {
    phrase: 'o aroma é uma linguagem',
    bg: 'linear-gradient(160deg, #29241f 0%, #565600 100%)',
  },
  {
    phrase: 'acendemos uma vela como quem abre uma porta',
    bg: 'linear-gradient(160deg, #3d3d00 0%, #29241f 100%)',
  },
  {
    phrase: 'natural com presença estética',
    bg: 'linear-gradient(160deg, #29241f 0%, #726f09 100%)',
  },
  {
    phrase: 'a loiê ocupa o espaço entre o design e o ritual',
    bg: 'linear-gradient(160deg, #1a1512 0%, #565600 100%)',
  },
];

const SLIDE_DURATION = 6000;

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        setTransitioning(false);
      }, 600);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[90vh] md:h-[95vh] overflow-hidden bg-primary">
      {/* Plasma base layer */}
      <div className="absolute inset-0">
        <Plasma
          color="#b26a02"
          speed={0.6}
          direction="forward"
          scale={1.1}
          opacity={0.8}
          mouseInteractive={true}
        />
      </div>

      {/* Slide gradient overlays — crossfade */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            background: slide.bg,
            opacity: i === currentSlide ? (transitioning ? 0 : 0.72) : 0,
            transition: 'opacity 0.6s ease',
          }}
        />
      ))}

      {/* Dark gradient from bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent" />

      {/* Phrase text */}
      <div className="absolute inset-0 flex items-center justify-center px-8">
        <p
          key={currentSlide}
          style={{
            fontFamily: "'Wagon', sans-serif",
            fontWeight: 200,
            fontStyle: 'italic',
            fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
            color: 'rgba(244,237,210,0.75)',
            letterSpacing: '0.06em',
            textAlign: 'center',
            maxWidth: '640px',
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? 'translateY(8px)' : 'translateY(0)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          {SLIDES[currentSlide].phrase}
        </p>
      </div>

      {/* Bottom: dots + navegar button */}
      <div className="absolute bottom-0 left-0 right-0 pb-16 flex flex-col items-center gap-8">
        {/* Slide dots */}
        <div className="flex items-center gap-3">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Slide ${i + 1}`}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                border: '1px solid rgba(244,237,210,0.5)',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                opacity: i === currentSlide ? 0.9 : 0.3,
                transition: 'opacity 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* navegar button */}
        <Link to="/shop" className="loi-ghost group" style={{ color: 'rgba(244,237,210,0.65)' }}>
          <span style={{ color: 'rgba(244,237,210,0.65)' }}>navegar</span>
          <span className="loi-ghost-dash" style={{ background: 'rgba(244,237,210,0.65)' }} />
          <span className="transition-transform duration-300 group-hover:translate-x-1" style={{ color: 'rgba(244,237,210,0.65)' }}>→</span>
        </Link>
      </div>
    </section>
  );
};

export default Hero;
