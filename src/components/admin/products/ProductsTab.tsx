import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  getAdminProducts, getAdminCollections,
  createAdminProduct, updateAdminProduct, deleteAdminProduct,
  uploadProductImage, insertProductImage, deleteProductImage, productImagePublicUrl,
} from '@/lib/api';
import type { AdminProductRow, AdminCollectionRow } from '@/lib/api';
import { tableCls, thCls, tdCls } from '@/components/admin/shared/styles';
import { ConfirmDeleteDialog } from '@/components/admin/shared/ConfirmDeleteDialog';
import { EmptyState } from '@/components/admin/shared/EmptyState';
import { Modal } from '@/components/admin/shared/Modal';
import { ProductForm, type ProductFormPayload } from '@/components/admin/products/ProductForm';
import { BestsellerProductsOrder } from '@/components/admin/products/BestsellerProductsOrder';

export function ProductsTab() {
  const { toast } = useToast();
  const [subTab, setSubTab] = useState<'list' | 'bestseller-order'>('list');
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [collections, setCollections] = useState<AdminCollectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProductRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProductRow | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const [prods, cols] = await Promise.all([getAdminProducts(), getAdminCollections()]);
      setProducts(prods);
      setCollections(cols);
    } catch (err) {
      console.error('[ProductsTab] failed to load', err);
      toast({ title: 'Erro ao carregar produtos.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); }, []);

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: AdminProductRow) => { setEditing(p); setModalOpen(true); };

  const handleDelete = async (target: AdminProductRow) => {
    try {
      for (const img of target.product_images) {
        try { await deleteProductImage(img.id, img.filename); } catch (e) { console.warn('image cleanup failed', e); }
      }
      await deleteAdminProduct(target.id);
      setProducts(prev => prev.filter(p => p.id !== target.id));
      toast({ title: 'Produto excluído com sucesso.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao excluir produto.', variant: 'destructive' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSave = async (payload: ProductFormPayload) => {
    setSaving(true);
    try {
      const productId = editing
        ? (await updateAdminProduct(editing.id, payload.insert)).id
        : (await createAdminProduct(payload.insert)).id;

      for (const id of payload.removedImageIds) {
        const img = editing?.product_images.find((i) => i.id === id);
        if (img) {
          try { await deleteProductImage(img.id, img.filename); } catch (e) { console.warn('removeImage failed', e); }
        }
      }

      const baseSort = editing
        ? Math.max(-1, ...editing.product_images
            .filter((i) => !payload.removedImageIds.includes(i.id))
            .map((i) => i.sort_order)) + 1
        : 0;
      for (let i = 0; i < payload.newFiles.length; i++) {
        const filename = await uploadProductImage(productId, payload.newFiles[i]);
        await insertProductImage(productId, filename, baseSort + i);
      }

      toast({ title: editing ? 'Produto atualizado com sucesso.' : 'Produto criado com sucesso.' });
      setModalOpen(false);
      void reload();
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao salvar produto.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>;
  }

  return (
    <div>
      <div className="flex gap-1 mb-4 border-b border-border">
        <button
          type="button"
          onClick={() => setSubTab('list')}
          className={`px-3 py-2 text-xs font-medium transition-colors ${subTab === 'list' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Lista
        </button>
        <button
          type="button"
          onClick={() => setSubTab('bestseller-order')}
          className={`px-3 py-2 text-xs font-medium transition-colors ${subTab === 'bestseller-order' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Ordem dos Bestsellers
        </button>
      </div>

      {subTab === 'bestseller-order' ? (
        <BestsellerProductsOrder products={products} onSaved={() => void reload()} />
      ) : (
      <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Produtos ({products.length})</h3>
        <Button size="sm" onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs gap-1"><Plus size={14} /> Novo Produto</Button>
      </div>

      {products.length === 0 ? <EmptyState label="produto" /> : (
        <div className="overflow-x-auto">
          <table className={tableCls}>
            <thead>
              <tr className="border-b border-border">
                <th className={thCls}>Produto</th>
                <th className={thCls}>SKU</th>
                <th className={thCls}>Coleção</th>
                <th className={thCls}>Preço</th>
                <th className={thCls}>Visível</th>
                <th className={thCls}>Bestseller</th>
                <th className={thCls}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const cover = p.product_images.length > 0
                  ? productImagePublicUrl(p.product_images.slice().sort((a, b) => a.sort_order - b.sort_order)[0].filename)
                  : null;
                return (
                  <tr key={p.id} className="border-b border-border">
                    <td className={tdCls}>
                      <div className="flex items-center gap-2">
                        {cover
                          ? <img src={cover} alt={p.name} className="w-8 h-8 rounded object-cover" />
                          : <div className="w-8 h-8 rounded bg-muted" />}
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className={`${tdCls} font-mono text-xs`}>{p.sku}</td>
                    <td className={`${tdCls} text-muted-foreground`}>{p.collections?.name ?? '—'}</td>
                    <td className={tdCls}>R$ {Number(p.price).toFixed(2)}</td>
                    <td className={tdCls}>{p.visible ? 'Sim' : '—'}</td>
                    <td className={tdCls}>{p.is_bestseller ? 'Sim' : '—'}</td>
                    <td className={tdCls}>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="text-accent hover:text-accent/80"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteTarget(p)} className="text-destructive hover:text-destructive/80"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => !saving && setModalOpen(false)} title={editing ? 'Editar Produto' : 'Novo Produto'}>
        <ProductForm
          product={editing}
          collections={collections}
          saving={saving}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Excluir produto"
        description="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
      </>
      )}
    </div>
  );
}
