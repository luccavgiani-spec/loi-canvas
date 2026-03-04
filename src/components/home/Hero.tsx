import { Link } from 'react-router-dom';
import { heroBanner as heroImg } from '@/assets';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="relative h-[90vh] md:h-[95vh] overflow-hidden bg-primary">
      {/* Background image */}
      <img src={heroImg} alt="Loiê candle" className="absolute inset-0 w-full h-full object-cover opacity-70" />

      {/* Plasma / smoke overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="plasma-orb absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-gradient-radial from-amber-500/20 via-orange-400/10 to-transparent blur-3xl" style={{ background: 'radial-gradient(circle, hsla(33,80%,55%,0.25) 0%, hsla(25,60%,40%,0.1) 40%, transparent 70%)' }} />
        <div className="plasma-orb absolute top-1/3 left-[40%] w-[200px] h-[200px] md:w-[350px] md:h-[350px] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, hsla(15,60%,50%,0.2) 0%, transparent 60%)', animationDelay: '-3s' }} />
        {/* Rising smoke particles */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="smoke-particle absolute rounded-full blur-xl"
            style={{
              width: `${40 + i * 20}px`,
              height: `${40 + i * 20}px`,
              left: `${40 + i * 5}%`,
              bottom: '20%',
              background: 'radial-gradient(circle, hsla(35,40%,70%,0.3), transparent)',
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-end pb-20 md:pb-28 text-center px-6">
        <h1 className="heading-display text-4xl md:text-6xl lg:text-7xl text-primary-foreground mb-4">
          Fragrâncias que<br />contam histórias
        </h1>
        <p className="text-primary-foreground/70 text-sm md:text-base max-w-md mb-8 font-body">
          Velas artesanais feitas à mão com cera de soja natural e óleos essenciais selecionados.
        </p>
        <div className="flex gap-3">
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-3 text-sm uppercase tracking-wider">
            <Link to="/shop">Comprar agora</Link>
          </Button>
          <Button asChild variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-3 text-sm uppercase tracking-wider">
            <Link to="/shop">Ver coleções</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
