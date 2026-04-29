import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  getAdminCollabs, createAdminCollab, updateAdminCollab, deleteAdminCollab,
} from '@/lib/api';
import type { Collab } from '@/types';
import { VideoPlayer } from '@/components/ui/VideoPlayer';
import { cardCls } from '@/components/admin/shared/styles';
import { ConfirmDeleteDialog } from '@/components/admin/shared/ConfirmDeleteDialog';
import { EmptyState } from '@/components/admin/shared/EmptyState';
import { Modal } from '@/components/admin/shared/Modal';
import { CollabForm } from '@/components/admin/collabs/CollabForm';

export function CollabsTab() {
  const { toast } = useToast();
  const [collabs, setCollabs] = useState<Collab[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Collab | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    getAdminCollabs()
      .then(setCollabs)
      .catch(err => {
        console.error('[CollabsTab] load failed', err);
        toast({ title: 'Erro ao carregar collabs.', variant: 'destructive' });
      });
  }, [toast]);

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (c: Collab) => { setEditing(c); setModalOpen(true); };

  const handleDelete = async (id: string) => {
    try {
      await deleteAdminCollab(id);
      setCollabs(prev => prev.filter(c => c.id !== id));
      setDeleteTarget(null);
      toast({ title: 'Collab excluída com sucesso.' });
    } catch (err) {
      console.error('[CollabsTab] delete failed', err);
      toast({ title: 'Erro ao excluir collab.', variant: 'destructive' });
    }
  };

  const handleSave = async (data: Partial<Collab>) => {
    try {
      if (editing) {
        const updated = await updateAdminCollab(editing.id, data);
        setCollabs(prev => prev.map(c => (c.id === editing.id ? updated : c)));
      } else {
        // Sempre adiciona ao fim. Inserir manualmente em uma posição
        // intermediaria duplicaria sort_order de alguma collab existente
        // e quebrava a renderizacao da home (chave React duplicada).
        // Reordenacao posterior via edicao explicita do campo Ordem.
        const nextSortOrder = collabs.length === 0
          ? 0
          : Math.max(...collabs.map(c => c.sort_order)) + 1;
        const created = await createAdminCollab({
          ...data,
          sort_order: nextSortOrder,
        });
        setCollabs(prev => [...prev, created]);
      }
      setModalOpen(false);
      toast({ title: editing ? 'Collab atualizada com sucesso.' : 'Collab criada com sucesso.' });
    } catch (err) {
      console.error('[CollabsTab] save failed', err);
      toast({ title: 'Erro ao salvar collab.', variant: 'destructive' });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Collabs ({collabs.length})</h3>
        <Button size="sm" onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs gap-1"><Plus size={14} /> Nova Collab</Button>
      </div>

      {collabs.length === 0 ? <EmptyState label="collab" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collabs.map(c => (
            <div key={c.id} className={cardCls}>
              <div className="flex gap-3">
                <div className="flex-shrink-0 flex gap-1">
                  {c.images.slice(0, 2).map((src, i) => (
                    <div key={i} className="w-16 h-20 overflow-hidden rounded border border-border">
                      {src.endsWith('.mp4') ? (
                        <VideoPlayer src={src} className="w-full h-full object-cover" />
                      ) : (
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm">{c.name}</h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  {c.caption && <p className="text-xs text-accent mt-0.5">{c.caption}</p>}
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">slug: <code className="font-mono">{c.slug}</code> · {c.images.length} mídia(s)</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <button onClick={() => openEdit(c)} className="text-xs text-accent hover:underline flex items-center gap-1"><Pencil size={12} /> Editar</button>
                <button onClick={() => setDeleteTarget(c.id)} className="text-xs text-destructive hover:underline flex items-center gap-1"><Trash2 size={12} /> Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Collab' : 'Nova Collab'}>
        <CollabForm collab={editing} onSave={handleSave} onCancel={() => setModalOpen(false)} />
      </Modal>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Excluir collab"
        description="Tem certeza que deseja excluir esta collab? Esta ação não pode ser desfeita."
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </div>
  );
}
