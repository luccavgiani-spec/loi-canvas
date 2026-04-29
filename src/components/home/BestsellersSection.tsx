import { useEffect, useState } from 'react';
import ProductCard from '@/components/shop/ProductCard';
import { getBestsellerProducts } from '@/lib/api';
import type { Product } from '@/types';

const BestsellersSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBestsellerProducts()
      .then(setProducts)
      .catch((err) => console.error('[BestsellersSection] failed to load', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-10 md:mb-14">
            <div className="h-10 w-48 mx-auto bg-foreground/5 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-foreground/5 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="heading-display text-3xl md:text-4xl lg:text-5xl mb-3">Bestsellers</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestsellersSection;
