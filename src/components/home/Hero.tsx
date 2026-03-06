import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Plasma from '@/components/ui/Plasma';

const Hero = () => {
  return (
    <section className="relative h-[90vh] md:h-[95vh] overflow-hidden bg-primary">
      {/* Plasma background */}
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
