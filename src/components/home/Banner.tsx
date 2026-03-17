import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Props {
  image: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  reverse?: boolean;
}

const Banner = ({ image, title, subtitle, ctaLabel, ctaLink, reverse }: Props) => {
  return (
    <section className="bg-secondary">
      <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} min-h-[50vh]`}>
        <div className="md:w-1/2">
          <img src={image} alt={title} className="w-full h-64 md:h-full object-cover" />
        </div>
        <div className="md:w-1/2 flex items-center justify-center p-10 md:p-16 lg:p-24">
          <div className="max-w-md">
            <h2 className="heading-display text-3xl md:text-4xl lg:text-5xl mb-4">{title}</h2>
            <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed">{subtitle}</p>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-base uppercase tracking-wider">
              <Link to={ctaLink}>{ctaLabel}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
