import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FREE_SHIPPING_THRESHOLD } from '@/config';
import { mockProducts } from '@/lib/mocks';

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQty, subtotal } = useCart();
  const navigate = useNavigate();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const upsellProducts = mockProducts.filter(p => !items.find(i => i.product.id === p.id)).slice(0, 2);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        className="w-full sm:max-w-md flex flex-col"
        style={{ background: '#fcf5e0', borderLeft: '1px solid rgba(86,86,0,0.1)' }}
      >
        <SheetHeader>
          <SheetTitle
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 300,
              fontSize: '1.4rem',
              color: '#29241f',
              letterSpacing: '0.02em',
            }}
          >
            Seu Carrinho
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontStyle: 'italic',
                fontSize: '1rem',
                color: 'rgba(41,36,31,0.4)',
              }}
            >
              Seu carrinho está vazio.
            </p>
          </div>
        ) : (
          <>
            {/* Free shipping bar */}
            <div className="px-1 py-3">
              <div className="h-[2px] overflow-hidden" style={{ background: 'rgba(41,36,31,0.08)' }}>
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: '#565600' }}
                />
              </div>
              <p
                className="mt-2"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 300,
                  fontSize: '0.7rem',
                  color: 'rgba(41,36,31,0.4)',
                }}
              >
                {remaining > 0
                  ? `Faltam R$ ${remaining.toFixed(2)} para frete grátis`
                  : 'Você ganhou frete grátis!'}
              </p>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto space-y-4 py-2">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-3">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4
                      className="truncate"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 400,
                        fontSize: '0.95rem',
                        color: '#29241f',
                      }}
                    >
                      {item.product.name}
                    </h4>
                    <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: '#565600' }}>
                      R$ {item.product.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(item.product.id, item.quantity - 1)}
                        className="p-1"
                        style={{ color: 'rgba(41,36,31,0.4)' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.75rem', color: '#29241f', width: 24, textAlign: 'center', display: 'inline-block' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.product.id, item.quantity + 1)}
                        className="p-1"
                        style={{ color: 'rgba(41,36,31,0.4)' }}
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1 ml-auto"
                        style={{ color: 'rgba(41,36,31,0.25)', transition: 'color 0.3s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#c44')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(41,36,31,0.25)')}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Upsell */}
            {upsellProducts.length > 0 && (
              <div className="pt-3" style={{ borderTop: '1px solid rgba(86,86,0,0.1)' }}>
                <p className="loi-label mb-2">você também pode gostar</p>
                <div className="flex gap-2">
                  {upsellProducts.map(p => (
                    <UpsellCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Subtotal + CTA */}
            <div className="pt-4 space-y-3" style={{ borderTop: '1px solid rgba(86,86,0,0.1)' }}>
              <div className="flex justify-between">
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: 'rgba(41,36,31,0.4)' }}>
                  Subtotal
                </span>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.9rem', color: '#29241f' }}>
                  R$ {subtotal.toFixed(2)}
                </span>
              </div>
              <button
                className="loi-btn w-full justify-center"
                onClick={() => { setIsOpen(false); navigate('/checkout'); }}
              >
                finalizar compra
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

function UpsellCard({ product }: { product: import('@/types').Product }) {
  const { addItem } = useCart();
  return (
    <div className="flex-1 p-2" style={{ border: '1px solid rgba(86,86,0,0.12)' }}>
      <img
        src={product.images[0]}
        alt={product.name}
        className="w-full h-16 object-cover mb-1"
      />
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: '0.8rem', color: '#29241f' }} className="truncate">
        {product.name}
      </p>
      <div className="flex items-center justify-between mt-1">
        <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.7rem', color: '#565600' }}>
          R$ {product.price}
        </span>
        <button
          onClick={() => addItem(product)}
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 300,
            fontSize: '0.6rem',
            color: 'rgba(41,36,31,0.4)',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
          }}
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}

export default CartDrawer;
