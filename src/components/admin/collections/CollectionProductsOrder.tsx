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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getAdminProductsByCollection, updateProductsSortOrder, productImagePublicUrl } from '@/lib/api';
import { SortableProductRow, type OrderItem } from '@/components/admin/shared/SortableProductRow';

interface CollectionProductsOrderProps {
  collectionId: string;
  onClose: () => void;
}

export function CollectionProductsOrder({ collectionId, onClose }: CollectionProductsOrderProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [originalIds, setOriginalIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAdminProductsByCollection(collectionId)
      .then(rows => {
        if (cancelled) return;
        const mapped: OrderItem[] = rows.map(r => {
          const firstImg = (r.product_images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order)[0];
          return {
            id: r.id,
            name: r.name,
            sku: r.sku ?? '',
            thumbnail: firstImg ? productImagePublicUrl(firstImg.filename) : null,
          };
        });
        setItems(mapped);
        setOriginalIds(mapped.map(m => m.id));
      })
      .catch(err => {
        console.error('[CollectionProductsOrder] load failed', err);
        toast({ title: 'Erro ao carregar produtos da coleção.', variant: 'destructive' });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [collectionId, toast]);

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
      const ordered = items.map((it, idx) => ({ id: it.id, sort_order: idx }));
      await updateProductsSortOrder(ordered);
      setOriginalIds(items.map(i => i.id));
      toast({ title: 'Ordem salva com sucesso.' });
      onClose();
    } catch (err) {
      console.error('[CollectionProductsOrder] save failed', err);
      toast({ title: 'Erro ao salvar ordem. Alguns produtos podem não ter sido atualizados.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>;
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">Nenhum produto vinculado a esta coleção.</p>;
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3">
        Arraste para reordenar. A ordem definida aqui aparece na página pública da coleção.
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
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
      </div>
    </div>
  );
}
