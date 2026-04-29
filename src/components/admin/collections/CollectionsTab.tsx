import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import {
  getAdminCollections,
  createAdminCollection, updateAdminCollection, deleteAdminCollection,
  uploadCollectionCover,
} from '@/lib/api';
import type { AdminCollectionRow } from '@/lib/api';
import type { TablesInsert } from '@/integrations/supabase/types';
import { cardCls } from '@/components/admin/shared/styles';
import { ConfirmDeleteDialog } from '@/components/admin/shared/ConfirmDeleteDialog';
import { EmptyState } from '@/components/admin/shared/EmptyState';
import { Modal } from '@/components/admin/shared/Modal';
import { CollectionForm, type CollectionFormPayload } from '@/components/admin/collections/CollectionForm';
import { CollectionProductsOrder } from '@/components/admin/collections/CollectionProductsOrder';

export function CollectionsTab() {
  const { toast } = useToast();
  const [collections, setCollections] = useState<AdminCollectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCollectionRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCollectionRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [orderTarget, setOrderTarget] = useState<AdminCollectionRow | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      const cols = await getAdminCollections();
      setCollections(cols);
    } catch (err) {
      console.error('[CollectionsTab] failed to load', err);
      toast({ title: 'Erro ao carregar coleções.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); }, []);

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (c: AdminCollectionRow) => { setEditing(c); setModalOpen(true); };

  const handleDelete = async (target: AdminCollectionRow) => {
    try {
      await deleteAdminCollection(target.id);
      setCollections(prev => prev.filter(c => c.id !== target.id));
      toast({ title: 'Coleção excluída com sucesso.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao excluir coleção.', variant: 'destructive' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSave = async (payload: CollectionFormPayload) => {
    setSaving(true);
    try {
      let coverUrl: string | null = payload.insert.cover_image ?? null;
      if (payload.coverFile) {
        coverUrl = await uploadCollectionCover(payload.coverFile);
      } else if (payload.removeCover) {
        coverUrl = null;
      }
      const fullInsert: TablesInsert<'collections'> = { ...payload.insert, cover_image: coverUrl };
      if (editing) {
        await updateAdminCollection(editing.id, fullInsert);
      } else {
        await createAdminCollection(fullInsert);
      }
      toast({ title: editing ? 'Coleção atualizada com sucesso.' : 'Coleção criada com sucesso.' });
      setModalOpen(false);
      void reload();
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao salvar coleção.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Coleções ({collections.length})</h3>
        <Button size="sm" onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs gap-1"><Plus size={14} /> Nova Coleção</Button>
      </div>

      {collections.length === 0 ? <EmptyState label="coleção" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map(c => (
            <div key={c.id} className={`${cardCls} relative overflow-hidden`}>
              {c.cover_image && (
                <img src={c.cover_image} alt={c.name} className="w-full h-32 object-cover rounded mb-3" />
              )}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-sm">{c.numeral && <span className="text-muted-foreground mr-1">{c.numeral}</span>}{c.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                  {c.detail && <p className="text-xs text-muted-foreground mt-1">{c.detail}</p>}
                  {c.price_label && <p className="text-xs font-medium mt-1">{c.price_label}</p>}
                  <p className="text-xs text-muted-foreground mt-1">slug: <code className="font-mono">{c.slug}</code></p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {c.is_active ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <button onClick={() => openEdit(c)} className="text-xs text-accent hover:underline flex items-center gap-1"><Pencil size={12} /> Editar</button>
                <button onClick={() => setOrderTarget(c)} className="text-xs text-accent hover:underline flex items-center gap-1"><ArrowUpDown size={12} /> Ordenar produtos</button>
                <button onClick={() => setDeleteTarget(c)} className="text-xs text-destructive hover:underline flex items-center gap-1"><Trash2 size={12} /> Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!orderTarget}
        onClose={() => setOrderTarget(null)}
        title={orderTarget ? `Ordenar produtos — ${orderTarget.name}` : 'Ordenar produtos'}
      >
        {orderTarget && (
          <CollectionProductsOrder
            collectionId={orderTarget.id}
            onClose={() => setOrderTarget(null)}
          />
        )}
      </Modal>

      <Modal open={modalOpen} onClose={() => !saving && setModalOpen(false)} title={editing ? 'Editar Coleção' : 'Nova Coleção'}>
        <CollectionForm
          collection={editing}
          saving={saving}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Excluir coleção"
        description="Tem certeza que deseja excluir esta coleção? Esta ação não pode ser desfeita."
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </div>
  );
}
