import { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateBestsellerSortOrder, productImagePublicUrl } from '@/lib/api';
import type { AdminProductRow } from '@/lib/api';
import { SortableProductRow, type OrderItem } from '@/components/admin/shared/SortableProductRow';

interface BestsellerProductsOrderProps {
  products: AdminProductRow[];
  onSaved: () => void;
}

export function BestsellerProductsOrder({ products, onSaved }: BestsellerProductsOrderProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [originalIds, setOriginalIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    const bestsellers = products
      .filter(p => p.is_bestseller)
      .slice()
      .sort((a, b) => {
        const ao = a.bestseller_sort_order ?? 0;
        const bo = b.bestseller_sort_order ?? 0;
        if (ao !== bo) return ao - bo;
        // Tie-break: created_at desc (mantem o default antigo)
        return (b.created_at ?? '').localeCompare(a.created_at ?? '');
      });
    const mapped: OrderItem[] = bestsellers.map(p => {
      const firstImg = (p.product_images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order)[0];
      return {
        id: p.id,
        name: p.name,
        sku: p.sku ?? '',
        thumbnail: firstImg ? productImagePublicUrl(firstImg.filename) : null,
      };
    });
    setItems(mapped);
    setOriginalIds(mapped.map(m => m.id));
  }, [products]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems(prev => {
      const oldIndex = prev.findIndex(p => p.id === active.id);
      const newIndex = prev.findIndex(p => p.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const dirty = items.some((it, idx) => originalIds[idx] !== it.id);

  const handleSave = async () => {
    setSaving(true);
    try {
      const ordered = items.map((it, idx) => ({ id: it.id, bestseller_sort_order: idx }));
      await updateBestsellerSortOrder(ordered);
      setOriginalIds(items.map(i => i.id));
      toast({ title: 'Ordem dos bestsellers salva.' });
      onSaved();
    } catch (err) {
      console.error('[BestsellerProductsOrder] save failed', err);
      toast({ title: 'Erro ao salvar ordem. Alguns produtos podem não ter sido atualizados.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        Nenhum produto marcado como bestseller. Marque a flag "Bestseller" em algum produto para começar.
      </p>
    );
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">
        Arraste para reordenar os {items.length} bestsellers. A ordem é usada por <code>getBestsellerProducts</code>.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {items.map(item => <SortableProductRow key={item.id} item={item} />)}
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex gap-2 pt-4 mt-4 border-t border-border">
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saving ? 'Salvando…' : 'Salvar ordem'}
        </Button>
      </div>
    </div>
  );
}
