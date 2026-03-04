import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
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
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-background">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl tracking-wide">Seu Carrinho</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Seu carrinho está vazio.</p>
          </div>
        ) : (
          <>
            {/* Free shipping bar */}
            <div className="px-1 py-3">
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {remaining > 0
                  ? `Faltam R$ ${remaining.toFixed(2)} para frete grátis`
                  : '🎉 Você ganhou frete grátis!'}
              </p>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto space-y-4 py-2">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-3">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-20 h-20 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{item.product.name}</h4>
                    <p className="text-sm text-accent font-medium">R$ {item.product.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => updateQty(item.product.id, item.quantity - 1)} className="p-1 hover:bg-secondary rounded">
                        <Minus size={12} />
                      </button>
                      <span className="text-xs w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product.id, item.quantity + 1)} className="p-1 hover:bg-secondary rounded">
                        <Plus size={12} />
                      </button>
                      <button onClick={() => removeItem(item.product.id)} className="p-1 ml-auto text-muted-foreground hover:text-destructive">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Upsell */}
            {upsellProducts.length > 0 && (
              <div className="border-t border-border pt-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Você também pode gostar</p>
                <div className="flex gap-2">
                  {upsellProducts.map(p => (
                    <UpsellCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}

            {/* Subtotal + CTA */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => { setIsOpen(false); navigate('/checkout'); }}
              >
                Finalizar Compra
              </Button>
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
    <div className="flex-1 border border-border rounded p-2">
      <img src={product.images[0]} alt={product.name} className="w-full h-16 object-cover rounded mb-1" />
      <p className="text-xs truncate">{product.name}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-accent">R$ {product.price}</span>
        <button onClick={() => addItem(product)} className="text-[10px] underline text-muted-foreground hover:text-foreground">
          Adicionar
        </button>
      </div>
    </div>
  );
}

export default CartDrawer;
