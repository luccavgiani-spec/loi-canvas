import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Manifesto = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container max-w-3xl text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-accent mb-6 block">Nosso Ateliê</span>
        <h2 className="heading-display text-3xl md:text-4xl lg:text-5xl mb-6">
          Cada vela é uma história, cada aroma é uma memória
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Na Loiê, acreditamos que os aromas têm o poder de transformar ambientes e evocar sentimentos.
          Nossas velas são produzidas em pequenos lotes, com cera de soja 100% vegetal e fragrâncias
          cuidadosamente selecionadas por perfumistas brasileiros. Do derretimento ao rótulo,
          cada detalhe é feito à mão no nosso ateliê em São Paulo.
        </p>
        <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 text-sm uppercase tracking-wider">
          <Link to="/about">Conheça nossa história</Link>
        </Button>
      </div>
    </section>
  );
};

export default Manifesto;
