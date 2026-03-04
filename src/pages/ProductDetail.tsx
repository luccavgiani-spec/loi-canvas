import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { getProductBySlug, getRelatedProducts, getReviews } from '@/lib/api';
import type { Product, Review } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Truck, RefreshCw, Leaf, Package } from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';

const benefits = [
  { icon: Truck, label: 'Frete grátis acima de R$ 299' },
  { icon: RefreshCw, label: 'Trocas em até 7 dias' },
  { icon: Leaf, label: 'Embalagem sustentável' },
  { icon: Package, label: 'Feita em pequenos lotes' },
];

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      getProductBySlug(slug),
      getReviews(slug),
    ]).then(([prod, revs]) => {
      setProduct(prod);
      setReviews(revs);
      setSelectedImage(0);
      getRelatedProducts(prod.id).then(setRelated);
    }).finally(() => setLoading(false));
  }, [slug]);

  if (loading || !product) {
    return (
      <Layout>
        <div className="container py-16">
          <div className="grid md:grid-cols-2 gap-10">
            <Skeleton className="aspect-square" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-10 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-14">
          {/* Gallery */}
          <div>
            <div className="aspect-square overflow-hidden rounded bg-secondary mb-3">
              <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                      i === selectedImage ? 'border-accent' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.badge && (
              <span className={`badge-product badge-${product.badge} rounded-sm mb-3 inline-block`}>
                {product.badge === 'sale' ? 'Sale' : product.badge === 'new' ? 'Novo' : 'Limited Edition'}
              </span>
            )}
            <h1 className="heading-display text-3xl md:text-4xl mb-2">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={14} className={s <= Math.round(product.rating_avg) ? 'fill-accent text-accent' : 'text-border'} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating_avg} ({product.rating_count} avaliações)</span>
              <button className="text-xs text-accent underline underline-offset-2 ml-2">Escreva uma avaliação</button>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-heading font-semibold text-foreground">R$ {product.price.toFixed(2)}</span>
              {product.compare_at_price && (
                <span className="text-lg text-muted-foreground line-through">R$ {product.compare_at_price.toFixed(2)}</span>
              )}
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed mb-6">{product.description}</p>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {benefits.map(b => (
                <div key={b.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <b.icon size={14} className="text-accent shrink-0" />
                  <span>{b.label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex gap-3 mb-8">
              <Button onClick={() => addItem(product)} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-3 text-sm uppercase tracking-wider">
                Adicionar ao carrinho
              </Button>
              <Button onClick={() => { addItem(product); }} variant="outline" className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground py-3 text-sm uppercase tracking-wider">
                Comprar agora
              </Button>
            </div>

            {/* Details accordion */}
            <Accordion type="single" collapsible defaultValue="desc">
              <AccordionItem value="desc">
                <AccordionTrigger className="text-sm">Descrição</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{product.description}</AccordionContent>
              </AccordionItem>
              {product.details && (
                <AccordionItem value="details">
                  <AccordionTrigger className="text-sm">Detalhes</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{product.details}</AccordionContent>
                </AccordionItem>
              )}
              {product.how_to_use && (
                <AccordionItem value="how">
                  <AccordionTrigger className="text-sm">Como usar</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{product.how_to_use}</AccordionContent>
                </AccordionItem>
              )}
              {product.care_instructions && (
                <AccordionItem value="care">
                  <AccordionTrigger className="text-sm">Cuidados</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{product.care_instructions}</AccordionContent>
                </AccordionItem>
              )}
            </Accordion>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="mt-8 border-t border-border pt-6">
                <h3 className="font-heading text-lg mb-4">Avaliações ({reviews.length})</h3>
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} size={12} className={s <= r.rating ? 'fill-accent text-accent' : 'text-border'} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{r.author}</span>
                      </div>
                      <h4 className="text-sm font-medium">{r.title}</h4>
                      <p className="text-xs text-muted-foreground">{r.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16 md:mt-24">
            <h2 className="heading-display text-2xl md:text-3xl text-center mb-8">Você também pode gostar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
