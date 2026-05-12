import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import ProductPriceTag from '@/components/shop/ProductPriceTag';
import { getProductAvailability } from '@/lib/productFilters';

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  const { addItem } = useCart();
  const availability = getProductAvailability(product);
  const canAdd = availability === 'estoque';

  return (
    <div className="group">
      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden rounded bg-secondary aspect-square mb-3">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: '#f4edd2' }} />
        )}
        {product.badge && (
          <span className={`badge-product badge-${product.badge} absolute top-2 left-2 rounded-sm`}>
            {product.badge === 'sale' ? 'Sale' : product.badge === 'new' ? 'Novo' : 'Limited'}
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); if (canAdd) addItem(product); }}
          disabled={!canAdd}
          className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-sm uppercase tracking-wider py-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 disabled:cursor-not-allowed disabled:opacity-70"
          aria-disabled={!canAdd}
        >
          {availability === 'em-breve'
            ? 'Em breve'
            : availability === 'esgotado'
              ? 'Esgotado'
              : 'Adicionar ao carrinho'}
        </button>
      </Link>
      <Link to={`/product/${product.slug}`}>
        <h3 className="text-base font-medium mb-1" style={{ fontFamily: "'Wagon', sans-serif" }}>{product.name}</h3>
        <ProductPriceTag product={product} />
      </Link>
    </div>
  );
};

export default ProductCard;
