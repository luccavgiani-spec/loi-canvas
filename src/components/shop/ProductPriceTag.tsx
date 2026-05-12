import type { Product } from '@/types';
import { getProductAvailability } from '@/lib/productFilters';

interface Props {
  product: Product;
  size?: 'sm' | 'md';
  dark?: boolean;
  className?: string;
}

// Selo de disponibilidade + preço — único ponto onde a regra de "esgotado"
// e "em breve" é renderizada visualmente. Mantém o cartão clicável; a UI de
// botão "adicionar ao carrinho" desabilita-se via getProductAvailability().
const ProductPriceTag = ({ product, size = 'md', dark = false, className }: Props) => {
  const availability = getProductAvailability(product);
  const priceFontSize = size === 'sm' ? '0.78rem' : '0.8rem';
  const labelFontSize = size === 'sm' ? '0.58rem' : '0.62rem';

  const priceColor = dark ? '#f4edd2' : '#000';
  const mutedColor = dark ? 'rgba(244,237,210,0.4)' : 'rgba(0,0,0,0.4)';
  const labelColor = dark ? 'rgba(244,237,210,0.55)' : 'rgba(41,36,31,0.6)';

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Sackers Gothic Std', 'Sackers Gothic', sans-serif",
    fontWeight: 200,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    fontSize: labelFontSize,
    color: labelColor,
  };

  const priceBaseStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontWeight: 300,
    fontSize: priceFontSize,
  };

  return (
    <div className={`flex items-center flex-wrap gap-x-3 gap-y-1 ${className ?? ''}`}>
      <span
        style={{
          ...priceBaseStyle,
          color: availability === 'esgotado' ? mutedColor : priceColor,
          textDecoration: availability === 'esgotado' ? 'line-through' : 'none',
        }}
      >
        R$ {product.price.toFixed(2)}
      </span>

      {availability === 'estoque' && product.compare_at_price && (
        <span
          style={{
            ...priceBaseStyle,
            fontSize: size === 'sm' ? '0.68rem' : '0.7rem',
            color: mutedColor,
            textDecoration: 'line-through',
          }}
        >
          R$ {product.compare_at_price.toFixed(2)}
        </span>
      )}

      {availability === 'esgotado' && <span style={labelStyle}>esgotado</span>}
      {availability === 'em-breve' && <span style={labelStyle}>em breve</span>}
    </div>
  );
};

export default ProductPriceTag;
