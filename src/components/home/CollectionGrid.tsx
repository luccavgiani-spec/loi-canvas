import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import ProductCard from '@/components/shop/ProductCard';

interface Props {
  title: string;
  subtitle?: string;
  products: Product[];
  ctaLabel?: string;
  ctaLink?: string;
}

const CollectionGrid = ({ title, subtitle, products, ctaLabel = 'Ver todos', ctaLink = '/shop' }: Props) => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="heading-display text-3xl md:text-4xl lg:text-5xl mb-3">{title}</h2>
          {subtitle && <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">{subtitle}</p>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to={ctaLink} className="text-sm uppercase tracking-wider text-accent hover:underline underline-offset-4">
            {ctaLabel} →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CollectionGrid;
