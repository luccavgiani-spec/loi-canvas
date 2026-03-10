import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  const { addItem } = useCart();

  return (
    <div className="group">
      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden rounded bg-secondary aspect-square mb-3">
        {product.images[0]?.match(/\.mp4$/i) ? (
          <video
            src={product.images[0]}
            muted
            playsInline
            autoPlay
            loop
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
        {product.badge && (
          <span className={`badge-product badge-${product.badge} absolute top-2 left-2 rounded-sm`}>
            {product.badge === 'sale' ? 'Sale' : product.badge === 'new' ? 'Novo' : 'Limited'}
          </span>
        )}
        {/* Quick add on hover */}
        <button
          onClick={(e) => { e.preventDefault(); addItem(product); }}
          className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-xs uppercase tracking-wider py-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
        >
          Adicionar ao carrinho
        </button>
      </Link>
      <Link to={`/product/${product.slug}`}>
        <h3 className="text-sm font-medium mb-1">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-accent font-medium">R$ {product.price.toFixed(2)}</span>
          {product.compare_at_price && (
            <span className="text-xs text-muted-foreground line-through">R$ {product.compare_at_price.toFixed(2)}</span>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
