import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  getAdminCoupons, getAdminCollections,
  createAdminCoupon, updateAdminCoupon, deleteAdminCoupon,
} from '@/lib/api';
import type { AdminCollectionRow } from '@/lib/api';
import type { Coupon } from '@/types';
import { tableCls, thCls, tdCls } from '@/components/admin/shared/styles';
import { ConfirmDeleteDialog } from '@/components/admin/shared/ConfirmDeleteDialog';
import { EmptyState } from '@/components/admin/shared/EmptyState';
import { Modal } from '@/components/admin/shared/Modal';
import { CouponForm, type CouponFormPayload } from '@/components/admin/coupons/CouponForm';

function formatDiscount(c: Coupon): string {
  return c.type === 'percent'
    ? `${c.value}%`
    : `R$ ${c.value.toFixed(2)}`;
}

function formatValidity(c: Coupon): string {
  if (!c.valid_until) return 'Sem expiração';
  return new Date(c.valid_until).toLocaleDateString('pt-BR');
}

function formatUses(c: Coupon): string {
  if (c.max_uses == null) return `${c.current_uses}`;
  return `${c.current_uses}/${c.max_uses}`;
}

export function CouponsTab() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [collections, setCollections] = useState<AdminCollectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAdminCoupons(), getAdminCollections()])
      .then(([cs, cols]) => {
        setCoupons(cs);
        setCollections(cols);
      })
      .catch(err => {
        console.error('[CouponsTab] load failed', err);
        toast({ title: 'Erro ao carregar cupons.', variant: 'destructive' });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const collectionName = (id: string | null) =>
    id ? collections.find(c => c.id === id)?.name ?? '—' : 'Todas';

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (c: Coupon) => { setEditing(c); setModalOpen(true); };

  // Toggle is_active otimista com rollback em erro.
  const handleToggleActive = async (coupon: Coupon) => {
    const next = !coupon.is_active;
    setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: next } : c));
    try {
      await updateAdminCoupon(coupon.id, { is_active: next });
      toast({ title: next ? 'Cupom ativado.' : 'Cupom desativado.' });
    } catch (err) {
      console.error('[CouponsTab] toggle failed', err);
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: coupon.is_active } : c));
      toast({ title: 'Erro ao alterar status do cupom.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAdminCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      setDeleteTarget(null);
      toast({ title: 'Cupom excluído com sucesso.' });
    } catch (err) {
      console.error('[CouponsTab] delete failed', err);
      toast({ title: 'Erro ao excluir cupom.', variant: 'destructive' });
    }
  };

  const handleSave = async (data: CouponFormPayload) => {
    try {
      if (editing) {
        const updated = await updateAdminCoupon(editing.id, data);
        setCoupons(prev => prev.map(c => (c.id === editing.id ? updated : c)));
      } else {
        const created = await createAdminCoupon(data);
        setCoupons(prev => [created, ...prev]);
      }
      setModalOpen(false);
      toast({ title: editing ? 'Cupom atualizado com sucesso.' : 'Cupom criado com sucesso.' });
    } catch (err) {
      console.error('[CouponsTab] save failed', err);
      const msg = err instanceof Error ? err.message : 'Erro ao salvar cupom.';
      toast({ title: msg, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Cupons ({coupons.length})</h3>
        <Button size="sm" onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs gap-1"><Plus size={14} /> Novo Cupom</Button>
      </div>

      {coupons.length === 0 ? <EmptyState label="cupom" /> : (
        <div className="overflow-x-auto">
          <table className={tableCls}>
            <thead>
              <tr className="border-b border-border">
                <th className={thCls}>Código</th>
                <th className={thCls}>Tipo</th>
                <th className={thCls}>Valor</th>
                <th className={thCls}>Validade</th>
                <th className={thCls}>Usos</th>
                <th className={thCls}>Coleção</th>
                <th className={thCls}>Ativo</th>
                <th className={thCls}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="border-b border-border">
                  <td className={`${tdCls} font-mono`}>{c.code}</td>
                  <td className={tdCls}>{c.type === 'percent' ? 'Percentual' : 'Valor fixo'}</td>
                  <td className={tdCls}>{formatDiscount(c)}</td>
                  <td className={tdCls}>{formatValidity(c)}</td>
                  <td className={tdCls}>{formatUses(c)}</td>
                  <td className={tdCls}>{collectionName(c.collection_id)}</td>
                  <td className={tdCls}>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} mr-2`}>
                      {c.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                    <Switch checked={c.is_active} onCheckedChange={() => handleToggleActive(c)} />
                  </td>
                  <td className={tdCls}>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="text-accent hover:text-accent/80" title="Editar"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteTarget(c.id)} className="text-destructive hover:text-destructive/80" title="Excluir"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Cupom' : 'Novo Cupom'}>
        <CouponForm
          coupon={editing}
          collections={collections}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Excluir cupom"
        description="Tem certeza que deseja excluir este cupom? Esta ação não pode ser desfeita."
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </div>
  );
}
